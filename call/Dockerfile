# Use Maven image for building
FROM maven:3.9.4-openjdk-21 AS build

# Copy source code
COPY . /app
WORKDIR /app

# Build the application
RUN mvn clean package -DskipTests

# Use JRE for runtime
FROM openjdk:21-jre-slim

# Copy the built jar
COPY --from=build /app/target/call-0.0.1-SNAPSHOT.jar /app/app.jar

# Expose port
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "/app/app.jar"]
