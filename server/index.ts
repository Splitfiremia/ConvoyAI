import express, { type Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { recordRequest } from "./metrics";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { getPrometheusMetrics } from "./metrics";
import { verifyJwt } from "./auth";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple in-memory rate limiter for /api
const rateBuckets = new Map<string, { tokens: number; lastRefill: number }>();
const RATE_LIMIT = Number(process.env.RATE_LIMIT_TOKENS || 60); // tokens per window
const RATE_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000); // 1 min
const RATE_REFILL_RATE = RATE_LIMIT / RATE_WINDOW_MS; // tokens per ms

app.use((req, res, next) => {
	if (!req.path.startsWith('/api')) return next();
	// Allow health and metrics
	if (req.path === '/api/health' || req.path === '/api/readiness' || req.path === '/api/metrics') return next();
	const key = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
	const now = Date.now();
	const bucket = rateBuckets.get(key) || { tokens: RATE_LIMIT, lastRefill: now };
	// Refill tokens
	const elapsed = now - bucket.lastRefill;
	bucket.tokens = Math.min(RATE_LIMIT, bucket.tokens + elapsed * RATE_REFILL_RATE);
	bucket.lastRefill = now;
	if (bucket.tokens < 1) {
		res.setHeader('Retry-After', Math.ceil((1 - bucket.tokens) / RATE_REFILL_RATE / 1000).toString());
		return res.status(429).json({ message: 'Too Many Requests' });
	}
	bucket.tokens -= 1;
	rateBuckets.set(key, bucket);
	next();
});

app.use((req, res, next) => {
	const start = Date.now();
	const path = req.path;
	let capturedJsonResponse: Record<string, any> | undefined = undefined;

	const originalResJson = res.json;
	res.json = function (bodyJson, ...args) {
		capturedJsonResponse = bodyJson;
		return originalResJson.apply(res, [bodyJson, ...args]);
	};

	res.on("finish", () => {
		const duration = Date.now() - start;
		if (path.startsWith("/api")) {
			let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
			if (capturedJsonResponse) {
				logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
			}

			if (logLine.length > 80) {
				logLine = logLine.slice(0, 79) + "…";
			}

			log(logLine);
			recordRequest(req.method, path, res.statusCode, duration);
		}
	});

	next();
});

// Basic CORS and security headers
app.use((req, res, next) => {
	const allowOrigin = process.env.CORS_ORIGIN || "*";
	res.setHeader("Access-Control-Allow-Origin", allowOrigin);
	res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key");
	res.setHeader("X-Content-Type-Options", "nosniff");
	res.setHeader("X-Frame-Options", "SAMEORIGIN");
	res.setHeader("X-XSS-Protection", "0");
	if (req.method === "OPTIONS") return res.sendStatus(204);
	next();
});

// Auth middleware for /api (skip health/readiness/metrics): allow JWT OR API key
app.use((req, res, next) => {
	if (!req.path.startsWith("/api")) return next();
	if (req.path === "/api/health" || req.path === "/api/readiness" || req.path === "/api/metrics") return next();

	const authz = req.header("authorization") || "";
	const bearer = authz.replace(/^Bearer\s+/i, "").trim();
	const xApiKey = (req.header("x-api-key") || "").trim();
	const configuredKey = process.env.API_KEY?.trim();

	// Try JWT first
	const jwtPayload = bearer ? verifyJwt(bearer) : null;
	if (jwtPayload) {
		(req as any).user = jwtPayload;
		return next();
	}

	// Fallback to API key
	if (configuredKey) {
		const providedBuf = Buffer.from(xApiKey || bearer);
		const configuredBuf = Buffer.from(configuredKey);
		if (providedBuf.length !== configuredBuf.length) {
			return res.status(403).json({ message: "Invalid API key" });
		}
		const ok = crypto.timingSafeEqual(providedBuf, configuredBuf);
		if (!ok) return res.status(403).json({ message: "Invalid API key" });
		return next();
	}

	return res.status(401).json({ message: "Unauthorized" });
});

(async () => {
	const server = await registerRoutes(app);

	// Metrics endpoint (unauthenticated)
	app.get('/api/metrics', (_req: Request, res: Response) => {
		res.setHeader('Content-Type', 'text/plain; version=0.0.4');
		res.send(getPrometheusMetrics());
	});

	app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
		const status = Number(err.status || err.statusCode || 500);
		const message = typeof err.message === 'string' ? err.message : 'Internal Server Error';

		// Avoid leaking internals; log minimal safe metadata
		log(`${_req.method} ${_req.path} -> ${status} ${message}`);
		if (app.get('env') !== 'production') {
			// Attach limited debug info in non-production
			return res.status(status).json({ message, error: { name: err.name, stack: err.stack } });
		}
		return res.status(status).json({ message });
	});

	// importantly only setup vite in development and after
	// setting up all the other routes so the catch-all route
	// doesn't interfere with the other routes
	if (app.get("env") === "development") {
		await setupVite(app, server);
	} else {
		serveStatic(app);
	}

	// ALWAYS serve the app on the port specified in the environment variable PORT
	// Other ports are firewalled. Default to 5000 if not specified.
	// this serves both the API and the client.
	// It is the only port that is not firewalled.
	const port = parseInt(process.env.PORT || '5000', 10);
	server.listen({
		port,
		host: "0.0.0.0",
		reusePort: true,
	}, () => {
		log(`serving on port ${port}`);
	});
})();
