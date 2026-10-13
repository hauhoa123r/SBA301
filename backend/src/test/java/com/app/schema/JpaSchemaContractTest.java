package com.app.schema;

import jakarta.persistence.Entity;
import org.hibernate.SessionFactory;
import org.hibernate.boot.Metadata;
import org.hibernate.boot.MetadataSources;
import org.hibernate.boot.model.naming.CamelCaseToUnderscoresNamingStrategy;
import org.hibernate.boot.registry.StandardServiceRegistry;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.hibernate.mapping.Column;
import org.hibernate.mapping.Table;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.AnnotationTypeFilter;
import org.opentest4j.AssertionFailedError;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;
import java.util.Arrays;
import java.util.Set;
import java.util.HashSet;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/** All mapped entities, including implicit join tables; no application context or production credentials. */
class JpaSchemaContractTest {
    private static final String CONTRACT_RESOURCE = "/schema/jpa-schema-contract.tsv";

    private static List<String> committedContract() throws Exception {
        var stream = JpaSchemaContractTest.class.getResourceAsStream(CONTRACT_RESOURCE);
        assertNotNull(stream, "Missing classpath test resource " + CONTRACT_RESOURCE
                + "; sync it with database/generate-schema-check.py before building the test image.");
        try (var reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
            return reader.lines().toList();
        }
    }

    private static void assertContractMatches(List<String> expected, List<String> actual) {
        assertEquals(expected, actual,
                "JPA changed: review fresh schema and explicitly regenerate its contract.");
    }

    private static StandardServiceRegistry registry(String url) {
        var builder = new StandardServiceRegistryBuilder()
                .applySetting("hibernate.dialect", "org.hibernate.dialect.MySQLDialect")
                .applySetting("hibernate.boot.allow_jdbc_metadata_access", false)
                .applySetting("hibernate.physical_naming_strategy", CamelCaseToUnderscoresNamingStrategy.class.getName())
                .applySetting("hibernate.jdbc.time_zone", "UTC");
        if (url != null) {
            builder.applySetting("hibernate.connection.url", url)
                    .applySetting("hibernate.connection.username", System.getenv().getOrDefault("FRESH_SCHEMA_USER", "root"))
                    .applySetting("hibernate.connection.password", System.getenv().getOrDefault("FRESH_SCHEMA_PASSWORD", ""))
                    .applySetting("hibernate.hbm2ddl.auto", "validate");
        }
        return builder.build();
    }

    private static Metadata mappings(StandardServiceRegistry registry) throws Exception {
        var scanner = new ClassPathScanningCandidateComponentProvider(false);
        scanner.addIncludeFilter(new AnnotationTypeFilter(Entity.class));
        var sources = new MetadataSources(registry);
        for (var candidate : scanner.findCandidateComponents("com.app")) {
            sources.addAnnotatedClass(Class.forName(candidate.getBeanClassName()));
        }
        return sources.buildMetadata();
    }

    private static Map<String, Table> tables(Metadata metadata) {
        Map<String, Table> result = new LinkedHashMap<>();
        for (var namespace : metadata.getDatabase().getNamespaces()) {
            for (Table table : namespace.getTables()) {
                if (table.isPhysicalTable()) result.putIfAbsent(table.getName(), table);
            }
        }
        return result;
    }

    private static List<String> contract(Metadata metadata) {
        var rows = new TreeSet<String>();
        for (Table table : tables(metadata).values()) {
            for (Column column : table.getColumns()) {
                rows.add(String.join("\t", "COLUMN", table.getName(), column.getName(),
                        column.getSqlType(metadata), Boolean.toString(column.isNullable())));
            }
            if (table.getPrimaryKey() != null) {
                rows.add("PRIMARY_KEY\t" + table.getName() + "\t" + names(table.getPrimaryKey().getColumns()));
            }
            for (var key : table.getUniqueKeys().values()) {
                rows.add("UNIQUE\t" + table.getName() + "\t" + names(key.getColumns()));
            }
            for (var key : table.getForeignKeys().values()) {
                var referenced = key.getReferencedColumns().isEmpty()
                        ? key.getReferencedTable().getPrimaryKey().getColumns() : key.getReferencedColumns();
                rows.add(String.join("\t", "FOREIGN_KEY", table.getName(), names(key.getColumns()),
                        key.getReferencedTable().getName(), names(referenced)));
            }
        }
        return new ArrayList<>(rows);
    }

    private static String names(List<Column> columns) {
        return String.join(",", columns.stream().map(Column::getName).toList());
    }

    @Test
    void committedContractMatchesEveryEntityAndJoinTable() throws Exception {
        var registry = registry(null);
        try {
            Metadata metadata = mappings(registry);
            List<String> expected = contract(metadata);
            String output = System.getProperty("schema.contract.output");
            if (output != null) {
                Path outputPath = Path.of(output);
                assertTrue(outputPath.isAbsolute(), "schema.contract.output must be an explicit absolute path");
                Files.write(outputPath, expected, StandardCharsets.UTF_8);
            } else {
                assertContractMatches(expected, committedContract());
            }
            System.out.printf("JPA contract: %d entities, %d tables, %d columns%n",
                    metadata.getEntityBindings().size(), tables(metadata).size(),
                    expected.stream().filter(row -> row.startsWith("COLUMN\t")).count());
        } finally {
            StandardServiceRegistryBuilder.destroy(registry);
        }
    }

    @Test
    void committedContractRejectsMissingTable() throws Exception {
        var registry = registry(null);
        try {
            List<String> expected = contract(mappings(registry));
            List<String> actual = new ArrayList<>(committedContract());
            assertContractMatches(expected, actual);
            assertTrue(actual.removeIf(row -> row.split("\t")[1].equals("authentication_settings")));
            assertThrows(AssertionFailedError.class, () -> assertContractMatches(expected, actual));
        } finally {
            StandardServiceRegistryBuilder.destroy(registry);
        }
    }

    @Test
    void committedContractRejectsMissingColumn() throws Exception {
        var registry = registry(null);
        try {
            List<String> expected = contract(mappings(registry));
            List<String> actual = new ArrayList<>(committedContract());
            assertContractMatches(expected, actual);
            assertTrue(actual.removeIf(row -> row.startsWith("COLUMN\tlesson_progress\tposition_seconds\t")));
            assertThrows(AssertionFailedError.class, () -> assertContractMatches(expected, actual));
        } finally {
            StandardServiceRegistryBuilder.destroy(registry);
        }
    }

    @Test
    @EnabledIfEnvironmentVariable(named = "RUN_FRESH_SCHEMA_TESTS", matches = "true")
    void freshMySqlSchemaValidatesAndEveryEntityCanBeSelected() throws Exception {
        String url = System.getenv("FRESH_SCHEMA_JDBC_URL");
        assertNotNull(url, "Set the JDBC URL of an isolated, freshly initialized MySQL test instance.");
        assertTrue(url.matches("jdbc:mysql://(127\\.0\\.0\\.1:33087|mysql-schema-test:3306)/chinese_online_learning(\\?.*)?"),
                "Only the dedicated loopback test port or CI test-container DNS is allowed.");
        var registry = registry(url);
        try {
            Metadata metadata = mappings(registry);
            try (SessionFactory factory = metadata.buildSessionFactory(); var session = factory.openSession()) {
                // hbm2ddl=validate performs no CREATE/ALTER; SELECT hydrates real MySQL columns.
                for (var entity : metadata.getEntityBindings()) {
                    session.createQuery("from " + entity.getEntityName(), Object.class).setMaxResults(1).getResultList();
                }
            }
            try (Connection connection = DriverManager.getConnection(url,
                    System.getenv().getOrDefault("FRESH_SCHEMA_USER", "root"),
                    System.getenv().getOrDefault("FRESH_SCHEMA_PASSWORD", ""))) {
                List<String> defects = new ArrayList<>();
                for (Table table : tables(metadata).values()) {
                    for (Column column : table.getColumns()) {
                        try (ResultSet actual = connection.getMetaData().getColumns("chinese_online_learning", null,
                                table.getName(), column.getName())) {
                            if (!actual.next()) {
                                defects.add("Missing " + table.getName() + "." + column.getName());
                                continue;
                            }
                            if (!column.isNullable() && actual.getInt("NULLABLE") != 0) {
                                defects.add("Nullable DB column but JPA requires NOT NULL: " + table.getName() + "." + column.getName());
                            }
                            String expectedType = column.getSqlType(metadata).toLowerCase();
                            if ((expectedType.startsWith("varchar(") || expectedType.startsWith("char("))
                                    && actual.getLong("COLUMN_SIZE") < column.getLength()) {
                                defects.add("DB string capacity too small: " + table.getName() + "." + column.getName()
                                        + " expected " + column.getLength() + " actual " + actual.getLong("COLUMN_SIZE"));
                            }
                            if (expectedType.startsWith("decimal(") && (actual.getInt("COLUMN_SIZE") != column.getPrecision()
                                    || actual.getInt("DECIMAL_DIGITS") != column.getScale())) {
                                defects.add("Decimal precision/scale mismatch: " + table.getName() + "." + column.getName());
                            }
                        }
                    }
                }
                Set<String> actualKeys = new HashSet<>();
                try (var statement = connection.createStatement(); var keys = statement.executeQuery("""
                        SELECT tc.CONSTRAINT_TYPE, tc.TABLE_NAME,
                               GROUP_CONCAT(k.COLUMN_NAME ORDER BY k.COLUMN_NAME),
                               COALESCE(MAX(k.REFERENCED_TABLE_NAME), ''),
                               COALESCE(GROUP_CONCAT(k.REFERENCED_COLUMN_NAME ORDER BY k.REFERENCED_COLUMN_NAME), '')
                        FROM information_schema.TABLE_CONSTRAINTS tc
                        JOIN information_schema.KEY_COLUMN_USAGE k
                          ON k.CONSTRAINT_SCHEMA=tc.CONSTRAINT_SCHEMA AND k.TABLE_NAME=tc.TABLE_NAME
                         AND k.CONSTRAINT_NAME=tc.CONSTRAINT_NAME
                        WHERE tc.CONSTRAINT_SCHEMA='chinese_online_learning'
                        GROUP BY tc.CONSTRAINT_TYPE, tc.TABLE_NAME, tc.CONSTRAINT_NAME
                        """)) {
                    while (keys.next()) {
                        String kind = keys.getString(1).replace(' ', '_');
                        String value = kind + "\t" + keys.getString(2) + "\t" + keys.getString(3);
                        if (kind.equals("FOREIGN_KEY")) value += "\t" + keys.getString(4) + "\t" + keys.getString(5);
                        actualKeys.add(value);
                        if (kind.equals("PRIMARY_KEY")) actualKeys.add(value.replace("PRIMARY_KEY", "UNIQUE"));
                    }
                }
                for (String row : contract(metadata)) {
                    String[] parts = row.split("\t");
                    if (parts[0].equals("COLUMN")) continue;
                    parts[2] = sorted(parts[2]);
                    if (parts[0].equals("FOREIGN_KEY")) parts[4] = sorted(parts[4]);
                    if (!actualKeys.contains(String.join("\t", parts))) defects.add("Missing constraint: " + row);
                }
                assertTrue(defects.isEmpty(), String.join("\n", defects));
                verifyPlaybackDefaultsAndChecks(connection);
            }
        } finally {
            StandardServiceRegistryBuilder.destroy(registry);
        }
    }

    private static String sorted(String columns) {
        return String.join(",", Arrays.stream(columns.split(",")).sorted().toList());
    }

    private static void verifyPlaybackDefaultsAndChecks(Connection connection) throws Exception {
        connection.setAutoCommit(false);
        try (var statement = connection.createStatement()) {
            statement.executeUpdate("INSERT INTO users(full_name,email,password_hash) VALUES ('Schema test','"
                    + UUID.randomUUID() + "@schema.test','')");
            long userId = lastId(statement);
            statement.executeUpdate("INSERT INTO courses(teacher_id,title) VALUES (" + userId + ",'Schema test')");
            long courseId = lastId(statement);
            statement.executeUpdate("INSERT INTO chapters(course_id,title,order_index) VALUES (" + courseId + ",'Schema test',1)");
            long chapterId = lastId(statement);
            statement.executeUpdate("INSERT INTO lessons(chapter_id,title,order_index) VALUES (" + chapterId + ",'Schema test',1)");
            long lessonId = lastId(statement);
            statement.executeUpdate("INSERT INTO lesson_progress(user_id,lesson_id) VALUES (" + userId + "," + lessonId + ")");
            try (var result = statement.executeQuery("SELECT position_seconds FROM lesson_progress WHERE user_id=" + userId)) {
                assertTrue(result.next());
                assertEquals(0, result.getInt(1));
                assertFalse(result.wasNull());
            }
            assertThrows(java.sql.SQLException.class, () -> statement.executeUpdate(
                    "UPDATE lesson_progress SET position_seconds=NULL WHERE user_id=" + userId));
            assertThrows(java.sql.SQLException.class, () -> statement.executeUpdate(
                    "UPDATE lesson_progress SET position_seconds=-1 WHERE user_id=" + userId));
            statement.executeUpdate("INSERT INTO audit_logs(user_id,action) VALUES (" + userId + ",'SCHEMA_TEST')");
        } finally {
            connection.rollback();
        }
    }

    private static long lastId(java.sql.Statement statement) throws Exception {
        try (var result = statement.executeQuery("SELECT LAST_INSERT_ID()")) {
            assertTrue(result.next());
            return result.getLong(1);
        }
    }
}
