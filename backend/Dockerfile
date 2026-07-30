FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY backend/pom.xml ./
RUN mvn -q -DskipTests dependency:go-offline

COPY backend/src ./src
COPY backend/data ./data

RUN mvn -DskipTests package

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/tracker-1.0.0.jar /app/app.jar
COPY --from=build /app/data /app/data

EXPOSE 8081

CMD ["java", "-jar", "/app/app.jar"]
