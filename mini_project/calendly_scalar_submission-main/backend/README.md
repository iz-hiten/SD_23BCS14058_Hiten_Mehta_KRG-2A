# Calendar Backend - Spring Boot

This is a Spring Boot backend implementation that mirrors the functionality of the Node.js/Express backend.

## Features

- ✅ Health check endpoint (`/api/health`)
- ✅ Static file serving for production builds
- ✅ SPA routing support (forwards all routes to index.html)
- ✅ CORS configuration
- ✅ Firebase integration ready
- ✅ Gemini AI service placeholder
- ✅ Environment variable configuration

## Prerequisites

- Java 17 or higher
- Maven 3.6 or higher

## Environment Variables

Create a `.env` file in the backend directory or set these environment variables:

```bash
GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:8080
```

## Running the Application

### Development Mode

```bash
# Using Maven
mvn spring-boot:run

# Or using Maven wrapper (if available)
./mvnw spring-boot:run
```

### Production Build

```bash
# Build the JAR
mvn clean package

# Run the JAR
java -jar target/calendar-backend-1.0.0.jar
```

## API Endpoints

### Health Check
```
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-04-21T10:30:00",
  "application": "calendar-backend",
  "appUrl": "http://localhost:8080"
}
```

## Configuration

The application can be configured via `src/main/resources/application.properties`:

- `server.port`: Server port (default: 8080)
- `gemini.api.key`: Gemini API key
- `app.url`: Application URL
- `cors.allowed.origins`: Allowed CORS origins

## Project Structure

```
backend/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── calendar/
│       │           ├── CalendarBackendApplication.java
│       │           ├── config/
│       │           │   ├── WebConfig.java
│       │           │   └── FirebaseConfig.java
│       │           ├── controller/
│       │           │   ├── HealthController.java
│       │           │   └── SpaController.java
│       │           └── service/
│       │               └── GeminiService.java
│       └── resources/
│           └── application.properties
├── pom.xml
└── README.md
```

## Serving Frontend

The backend is configured to serve static files from the `dist` directory (production build of the React app).

1. Build the frontend:
   ```bash
   cd ..
   npm run build
   ```

2. The Spring Boot app will automatically serve the files from the `dist` directory

## Firebase Configuration

To use Firebase:

1. Download your Firebase service account JSON file
2. Place it in the backend directory as `firebase-service-account.json`
3. The application will automatically initialize Firebase on startup

## Switching from Node.js to Spring Boot

To use this Spring Boot backend instead of the Node.js backend:

1. Stop the Node.js server
2. Start the Spring Boot application (see Running the Application above)
3. Update your frontend API calls if needed (default port changes from 3000 to 8080)

## Development

The application uses Spring Boot DevTools for hot reloading during development. Any changes to Java files will automatically restart the application.

## Testing

```bash
# Run tests
mvn test

# Run tests with coverage
mvn test jacoco:report
```

## Notes

- The default port is 8080 (vs 3000 for Node.js)
- All API routes are prefixed with `/api`
- Non-API routes are forwarded to `index.html` for SPA routing
- CORS is configured to allow requests from common development origins
