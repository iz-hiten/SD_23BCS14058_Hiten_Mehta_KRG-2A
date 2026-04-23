import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// SYSTEM DESIGN: TOKEN BUCKET RATE LIMITER
// ============================================
interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

class RateLimiter {
  private buckets: Map<string, TokenBucket> = new Map();
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per second
  private readonly windowMs: number;

  constructor(maxTokens: number = 10, refillRate: number = 1, windowMs: number = 60000) {
    this.maxTokens = maxTokens;
    this.refillRate = refillRate;
    this.windowMs = windowMs;
    
    // Cleanup old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private getClientId(req: express.Request): string {
    // Use IP address as client identifier
    return req.ip || req.socket.remoteAddress || 'unknown';
  }

  private refillTokens(bucket: TokenBucket): void {
    const now = Date.now();
    const timePassed = (now - bucket.lastRefill) / 1000; // seconds
    const tokensToAdd = timePassed * this.refillRate;
    
    bucket.tokens = Math.min(this.maxTokens, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, bucket] of this.buckets.entries()) {
      if (now - bucket.lastRefill > this.windowMs) {
        this.buckets.delete(key);
      }
    }
  }

  public middleware() {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const clientId = this.getClientId(req);
      
      let bucket = this.buckets.get(clientId);
      if (!bucket) {
        bucket = { tokens: this.maxTokens, lastRefill: Date.now() };
        this.buckets.set(clientId, bucket);
      }

      this.refillTokens(bucket);

      if (bucket.tokens >= 1) {
        bucket.tokens -= 1;
        
        // Add rate limit headers
        res.setHeader('X-RateLimit-Limit', this.maxTokens.toString());
        res.setHeader('X-RateLimit-Remaining', Math.floor(bucket.tokens).toString());
        res.setHeader('X-RateLimit-Reset', new Date(bucket.lastRefill + this.windowMs).toISOString());
        
        next();
      } else {
        res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((1 - bucket.tokens) / this.refillRate),
          limit: this.maxTokens,
          remaining: 0
        });
      }
    };
  }

  public getStats(): { totalClients: number; buckets: Array<{ clientId: string; tokens: number }> } {
    return {
      totalClients: this.buckets.size,
      buckets: Array.from(this.buckets.entries()).map(([clientId, bucket]) => ({
        clientId,
        tokens: Math.floor(bucket.tokens)
      }))
    };
  }
}

// Initialize rate limiter: 10 requests per client, refill 1 token/second
const rateLimiter = new RateLimiter(10, 1, 60000);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Apply rate limiter to all API routes
  app.use('/api', rateLimiter.middleware());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok",
      timestamp: new Date().toISOString(),
      rateLimiter: "enabled"
    });
  });

  // Rate limiter stats endpoint (for testing)
  app.get("/api/rate-limit-stats", (req, res) => {
    res.json(rateLimiter.getStats());
  });

  // Test endpoint to trigger rate limiting
  app.get("/api/test", (req, res) => {
    res.json({ 
      message: "Test endpoint",
      timestamp: new Date().toISOString()
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
