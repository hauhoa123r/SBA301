# stage1
FROM maven:3.9.9-eclipse-temurin-17-alpine AS build

WORKDIR /backend
COPY . .
# Retry interrupted repository downloads while keeping completed downloads in .m2.
# -U allows missing artifacts to be retried instead of using cached failures.
RUN set -eu; \
    attempt=1; \
    while :; do \
        if mvn -B -ntp -U clean package -DskipTests; then \
            break; \
        else \
            build_status=$?; \
        fi; \
        if [ "$attempt" -ge 3 ]; then exit "$build_status"; fi; \
        echo "Maven package failed (attempt $attempt/3); retrying in 10 seconds..." >&2; \
        attempt=$((attempt + 1)); \
        sleep 10; \
    done; \
    test -s /backend/target/test-classes/schema/jpa-schema-contract.tsv

# stage2
FROM eclipse-temurin:17-jre-alpine

WORKDIR /run
COPY --from=build /backend/target/backend-0.0.1-SNAPSHOT.jar /run/backend-0.0.1-SNAPSHOT.jar

RUN adduser -D devhoa && chown -R devhoa:devhoa /run
USER devhoa

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "/run/backend-0.0.1-SNAPSHOT.jar"]
