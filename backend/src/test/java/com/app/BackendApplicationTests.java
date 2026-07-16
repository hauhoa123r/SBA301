package com.app;

import java.sql.Connection;
import javax.sql.DataSource;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.FileSystemResource;
import org.springframework.jdbc.datasource.init.ScriptUtils;

@SpringBootTest
class BackendApplicationTests {

    @Autowired
    private DataSource dataSource;

    @Test
    void contextLoads() {
    }

    @Test
    void importDataChineseSql() throws Exception {
        try (Connection conn = dataSource.getConnection()) {
            // Run schema first
            ScriptUtils.executeSqlScript(conn, new FileSystemResource("../database/chinese_online_learning.sql"));
            System.out.println("chinese_online_learning.sql successfully executed!");
            
            // Run seed data
            ScriptUtils.executeSqlScript(conn, new FileSystemResource("../database/DataChinese.sql"));
            System.out.println("DataChinese.sql successfully executed!");
        }
    }

}
