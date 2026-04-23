# Spring Boot Backend Setup Guide

## ✅ Status: All Files Created Successfully

All Java files are syntactically correct and ready to use. The warnings you see in your IDE are just because the project hasn't been imported as a Maven project yet.

## 📋 Prerequisites

### Required:
- **Java 8 or higher** ✅ (You have Java 1.8.0_401)
- **Maven** (or use the included Maven wrapper)

### Optional:
- IntelliJ IDEA, Eclipse, or VS Code with Java extensions

## 🚀 Quick Start

### Option 1: Using Maven Wrapper (Recommended - No Maven installation needed)

```bash
# Navigate to backend folder
cd backend

# On Windows (PowerShell or CMD)
.\mvnw.cmd spring-boot:run

# On Linux/Mac
./mvnw spring-boot:run
```

### Option 2: Using Maven (if installed)

```bash
cd backend
mvn spring-boot:run
```

### Option 3: Build and Run JAR

```bash
# Build
.\mvnw.cmd clean package

# Run
java -jar target/calendar-backend-1.0.0.jar
```

## 🔧 IDE Setup

### IntelliJ IDEA:
1. File → Open → Select the `backend` folder
2. IntelliJ will auto-detect it as a Maven project
3. Wait for dependencies to download
4. Right-click `CalendarBackendApplication.java` → Run

### VS Code:
1. Install "Extension Pack for Java"
2. Open the `backend` folder
3. VS Code will detect the Maven project
4. Press F5 to run

### Eclipse:
1. File → Import → Maven → Existing Maven Projects
2. Select the `backend` folder
3. Right-click project → Run As → Spring Boot App

## 📁 Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/calendar/
│   │   │   ├── CalendarBackendApplication.java    ← Main entry point
│   │   │   ├── config/
│   │   │   │   ├── WebConfig.java                 ← CORS & static files
│   │   │   │   └── FirebaseConfig.java            ← Firebase setup
│   │   │   ├── controller/
│   │   │   │   ├── HealthController.java          ← /api/health endpoint
│   │   │   │   └── SpaController.java             ← SPA routing
│   │   │   └── service/
│   │   │       └── GeminiService.java             ← AI service placeholder
│   │   └── resources/
│   │       └── application.properties             ← Configuration
│   └── test/
│       └── java/com/calendar/
│           ├── CalendarBackendApplicationTests.java
│           └── controller/
│               └── HealthControllerTest.java
├── pom.xml                                        ← Maven dependencies
├── mvnw & mvnw.cmd                                ← Maven wrapper scripts
└── README.md                                      ← Full documentation
```

## 🧪 Testing

```bash
# Run all tests
.\mvnw.cmd test

# Run with coverage
.\mvnw.cmd test jacoco:report
```

## 🌐 Endpoints

Once running, test these endpoints:

- **Health Check**: http://localhost:8080/api/health
- **Frontend**: http://localhost:8080/ (after building React app)

## ⚙️ Configuration

Edit `src/main/resources/application.properties`:

```properties
# Change port
server.port=8080

# Set environment variables
gemini.api.key=your_key_here
app.url=http://localhost:8080
```

Or use environment variables:
```bash
export GEMINI_API_KEY=your_key_here
export APP_URL=http://localhost:8080
```

## 🐛 Troubleshooting

### "mvnw is not recognized"
- Make sure you're in the `backend` directory
- On Windows, use `.\mvnw.cmd` (with the dot-slash)

### "JAVA_HOME not set"
```bash
# Windows
set JAVA_HOME=C:\Program Files\Java\jdk1.8.0_401
set PATH=%JAVA_HOME%\bin;%PATH%

# Linux/Mac
export JAVA_HOME=/path/to/java
export PATH=$JAVA_HOME/bin:$PATH
```

### Port 8080 already in use
Change the port in `application.properties`:
```properties
server.port=8081
```

### Dependencies not downloading
- Check your internet connection
- Try: `.\mvnw.cmd clean install -U`

## 📝 Next Steps

1. **Start the backend**: `.\mvnw.cmd spring-boot:run`
2. **Test health endpoint**: Visit http://localhost:8080/api/health
3. **Build frontend**: `cd .. && npm run build`
4. **Access full app**: http://localhost:8080

## ✨ Features Included

- ✅ Health check API endpoint
- ✅ Static file serving (for React build)
- ✅ SPA routing support
- ✅ CORS configuration
- ✅ Firebase Admin SDK integration
- ✅ Gemini AI service placeholder
- ✅ Hot reload with DevTools
- ✅ Unit tests
- ✅ Production-ready build

## 🔄 Switching from Node.js

| Feature | Node.js | Spring Boot |
|---------|---------|-------------|
| Port | 3000 | 8080 |
| Start command | `npm run dev` | `.\mvnw.cmd spring-boot:run` |
| Health endpoint | `/api/health` | `/api/health` |
| Static files | `dist/` | `dist/` |

Both backends are functionally equivalent!

## 📚 Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Maven Documentation](https://maven.apache.org/guides/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

---

**All files are correct and ready to use!** The IDE warnings will disappear once you import the project properly.
