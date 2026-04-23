# 🚀 Quick Start: Using Spring Boot Backend

## ✅ What's Been Done

Your project now supports **Spring Boot (Java)** backend alongside the existing Node.js backend!

---

## 🎯 Quick Start (3 Steps)

### Step 1: Start Spring Boot Backend
```bash
cd backend
.\mvnw.cmd spring-boot:run
```

Wait for:
```
Server running on http://localhost:8081
```

### Step 2: Start React Frontend
```bash
# In a new terminal, from project root
npm run dev:spring
```

### Step 3: Open Browser
```
http://localhost:5173
```

---

## 🎉 Even Easier: One-Click Start

```bash
.\start-spring.cmd
```

This automatically starts both backend and frontend!

---

## 🧪 Test the Backend

### Health Check:
```bash
curl http://localhost:8081/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-21T...",
  "application": "calendar-backend",
  "appUrl": "http://localhost:8081",
  "rateLimiter": "enabled"
}
```

### Test Rate Limiter:
```bash
# PowerShell - Send 15 requests
1..15 | ForEach-Object { 
    $response = curl http://localhost:8081/api/test
    Write-Host "Request $_: $response"
}
```

**Expected:**
- Requests 1-10: ✅ Success (200 OK)
- Requests 11+: ❌ Rate Limited (429 Too Many Requests)

### Check Rate Limiter Stats:
```bash
curl http://localhost:8081/api/rate-limit-stats
```

---

## 📊 What's Included in Spring Boot Backend

### ✅ Features:
1. **Health Check API** - `/api/health`
2. **Rate Limiter** - Token Bucket Algorithm (10 req/min per IP)
3. **Rate Limiter Stats** - `/api/rate-limit-stats`
4. **Test Endpoint** - `/api/test`
5. **Static File Serving** - Serves React build from `dist/`
6. **CORS Configuration** - Allows frontend requests
7. **SPA Routing** - Forwards all routes to `index.html`

### ✅ System Design:
- **Algorithm:** Token Bucket
- **Max Tokens:** 10 per client
- **Refill Rate:** 1 token/second
- **Client ID:** IP address
- **Cleanup:** Automatic memory cleanup every 60 seconds

---

## 📁 Spring Boot Project Structure

```
backend/
├── src/main/java/com/calendar/
│   ├── CalendarBackendApplication.java    # Main entry point
│   ├── controller/
│   │   ├── HealthController.java          # API endpoints
│   │   └── SpaController.java             # SPA routing
│   ├── config/
│   │   ├── WebConfig.java                 # CORS, interceptors
│   │   └── FirebaseConfig.java            # Firebase setup
│   ├── ratelimit/
│   │   ├── TokenBucket.java               # Token bucket logic
│   │   └── RateLimiterInterceptor.java    # Rate limit middleware
│   └── service/
│       └── GeminiService.java             # AI service placeholder
├── src/main/resources/
│   └── application.properties             # Configuration
├── pom.xml                                # Maven dependencies
└── mvnw.cmd                               # Maven wrapper
```

---

## 🔧 Configuration

### Backend Port (Spring Boot):
Edit `backend/src/main/resources/application.properties`:
```properties
server.port=8081
```

### Frontend API URL:
Edit `.env`:
```bash
VITE_API_URL=http://localhost:8081
```

---

## 🐛 Troubleshooting

### Port 8081 Already in Use
```bash
# Find process
netstat -ano | findstr :8081

# Kill process
taskkill /PID <PID> /F
```

### Maven Not Found
Use the Maven wrapper (included):
```bash
.\mvnw.cmd spring-boot:run
```

### Java Not Found
Install Java 8 or higher:
- Download from: https://www.oracle.com/java/technologies/downloads/
- Or use OpenJDK: https://adoptium.net/

### Authentication Prompt
Already fixed! The backend has no authentication.

---

## 🔄 Switch Back to Node.js

Edit `.env`:
```bash
VITE_API_URL=http://localhost:3000
```

Then run:
```bash
npm run dev:node
```

---

## 📚 Available Commands

| Command | Description |
|---------|-------------|
| `.\start-spring.cmd` | Start Spring Boot + React (one-click) |
| `.\start-node.cmd` | Start Node.js backend |
| `npm run dev:spring` | Start React only (for Spring Boot) |
| `npm run dev:node` | Start Node.js + React |
| `cd backend && .\mvnw.cmd spring-boot:run` | Start Spring Boot manually |

---

## ✨ Benefits of Spring Boot Backend

1. **Production-Ready:** Enterprise-grade Java framework
2. **Type Safety:** Strong typing with Java
3. **Scalability:** Better for high-traffic applications
4. **Ecosystem:** Huge Spring ecosystem (Security, Data, Cloud)
5. **Performance:** JVM optimizations
6. **System Design:** Demonstrates rate limiting implementation

---

## 🎓 Learning Resources

- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [Token Bucket Algorithm](https://en.wikipedia.org/wiki/Token_bucket)
- [Rate Limiting Strategies](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)

---

**You're all set! The Spring Boot backend is ready to use.** 🚀

**Current Setup:**
- ✅ Spring Boot backend on port 8081
- ✅ React frontend on port 5173
- ✅ Rate limiter enabled
- ✅ Firebase integration ready
- ✅ All APIs working
