# stage1
FROM maven:3.9.9-eclipse-temurin-17-alpine AS build

WORKDIR /backend
COPY . .
RUN mvn clean package -DskipTests

# stage2
FROM eclipse-temurin:17-jre-alpine

WORKDIR /run
COPY --from=build /backend/target/backend-0.0.1-SNAPSHOT.jar /run/backend-0.0.1-SNAPSHOT.jar

RUN adduser -D devhoa && chown -R devhoa:devhoa /run
USER devhoa

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "/run/backend-0.0.1-SNAPSHOT.jar"]
