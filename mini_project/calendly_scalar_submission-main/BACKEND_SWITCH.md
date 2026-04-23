# 🔄 Backend Switching Guide

This project supports **two backend implementations**:
1. **Node.js/Express** (TypeScript) - Port 3000
2. **Spring Boot** (Java) - Port 8081

Both backends provide identical functionality with the same API endpoints.

---

## 🚀 Quick Switch

### Option 1: Use Spring Boot Backend (Java)

**1. Update environment:**
```bash
# Edit .env file
VITE_API_URL=http://localhost:8081
```

**2. Start Spring Boot backend:**
```bash
cd backend
.\mvnw.cmd spring-boot:run
```

**3. Start frontend:**
```bash
npm run dev
```

**4. Access app:**
```
http://localhost:5173
```

---

### Option 2: Use Node.js Backend (TypeScript)

**1. Update environment:**
```bash
# Edit .env file
VITE_API_URL=http://localhost:3000
```

**2. Start Node.js backend:**
```bash
npm run dev
```

**3. Access app:**
```
http://localhost:3000
```

---

## 📊 Backend Comparison

| Feature | Node.js/Express | Spring Boot |
|---------|----------------|-------------|
| **Language** | TypeScript | Java 8+ |
| **Port** | 3000 | 8081 |
| **Start Command** | `npm run dev` | `.\mvnw.cmd spring-boot:run` |
| **Hot Reload** | ✅ Vite HMR | ✅ Spring DevTools |
| **Rate Limiter** | ✅ Token Bucket | ✅ Token Bucket |
| **Static Files** | ✅ Vite/Express | ✅ Spring Static Resources |
| **CORS** | ✅ Configured | ✅ Configured |
| **Production Build** | `npm run build` | `mvn package` |

---

## 🔌 API Endpoints (Both Backends)

### 1. Health Check
```
GET /api/health
```
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-21T...",
  "application": "calendar-backend",
  "appUrl": "http://localhost:8081",
  "rateLimiter": "enabled"
}
```

### 2. Rate Limiter Stats
```
GET /api/rate-limit-stats
```
**Response:**
```json
{
  "totalClients": 3,
  "buckets": [
    { "clientId": "192.168.1.1", "tokens": 8 }
  ]
}
```

### 3. Test Endpoint
```
GET /api/test
```
**Response:**
```json
{
  "message": "Test endpoint",
  "timestamp": "2026-04-21T..."
}
```

---

## 🧪 Testing Rate Limiter

### Test with Spring Boot (Port 8081):
```bash
# PowerShell
1..15 | ForEach-Object { curl http://localhost:8081/api/test }
```

### Test with Node.js (Port 3000):
```bash
# PowerShell
1..15 | ForEach-Object { curl http://localhost:3000/api/test }
```

**Expected:** First 10 requests succeed, 11+ get HTTP 429 (Too Many Requests)

---

## 🎯 System Design: Rate Limiter

Both backends implement the **Token Bucket Algorithm**:

- **Max Tokens:** 10 per client
- **Refill Rate:** 1 token/second
- **Window:** 60 seconds
- **Client ID:** IP address
- **Algorithm:** Token Bucket (smooth rate limiting)

### Rate Limit Headers:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1745234567890
```

---

## 📁 Project Structure

```
.
├── server.ts                          # Node.js/Express backend
├── backend/                           # Spring Boot backend
│   ├── src/main/java/com/calendar/
│   │   ├── CalendarBackendApplication.java
│   │   ├── controller/
│   │   │   └── HealthController.java  # API endpoints
│   │   ├── config/
│   │   │   └── WebConfig.java         # CORS, static files
│   │   └── ratelimit/
│   │       ├── TokenBucket.java       # Token bucket implementation
│   │       └── RateLimiterInterceptor.java
│   └── pom.xml
├── src/                               # React frontend
│   ├── config.ts                      # Backend URL configuration
│   └── ...
└── .env                               # Environment variables
```

---

## 🔧 Configuration Files

### `.env` (Frontend)
```bash
# Switch between backends
VITE_API_URL=http://localhost:8081  # Spring Boot
# VITE_API_URL=http://localhost:3000  # Node.js
```

### `src/config.ts` (Frontend)
```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';
export const BACKEND_TYPE = 'spring'; // or 'node'
```

### `backend/src/main/resources/application.properties` (Spring Boot)
```properties
server.port=8081
cors.allowed.origins=http://localhost:3000,http://localhost:5173,http://localhost:8081
```

---

## 🚀 Production Deployment

### Node.js Backend:
```bash
npm run build
npm run preview
```

### Spring Boot Backend:
```bash
cd backend
.\mvnw.cmd clean package
java -jar target/calendar-backend-1.0.0.jar
```

---

## 🐛 Troubleshooting

### Port Already in Use

**Spring Boot (8081):**
```bash
# Windows
netstat -ano | findstr :8081
taskkill /PID <PID> /F
```

**Node.js (3000):**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### CORS Errors

Make sure the frontend URL is in the CORS allowed origins:
- **Spring Boot:** `backend/src/main/resources/application.properties`
- **Node.js:** `server.ts` (WebConfig)

### Rate Limiter Not Working

Check the rate limiter is enabled:
```bash
curl http://localhost:8081/api/health
# Should show: "rateLimiter": "enabled"
```

---

## ✨ Why Two Backends?

1. **Flexibility:** Choose the stack you're comfortable with
2. **Learning:** Compare Node.js vs Spring Boot implementations
3. **System Design:** Both implement the same rate limiting algorithm
4. **Production Ready:** Both are production-grade implementations

---

## 📚 Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Express.js Documentation](https://expressjs.com/)
- [Token Bucket Algorithm](https://en.wikipedia.org/wiki/Token_bucket)
- [Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)

---

**Current Configuration:** Using **Spring Boot** backend on port **8081** 🚀
