# ===== Builder stage =====
FROM gradle:9.4.0-jdk-25-alpine AS builder

WORKDIR /home/gradle/project

# 1) Сначала файлы сборки для кэширования зависимостей
COPY build.gradle settings.gradle gradlew gradle/ ./
RUN chmod +x gradlew \
    && ./gradlew --no-daemon dependencies -x test

# 2) Затем исходники и финальная сборка fat‑jar
COPY src ./src
RUN ./gradlew --no-daemon bootJar -x test

# ===== Runtime stage =====
FROM eclipse-temurin:25-jre-alpine

WORKDIR /app

# Копируем собранный Spring Boot fat‑jar
COPY --from=builder /home/gradle/project/build/libs/*.jar app.jar

# Приложение слушает порт 8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
