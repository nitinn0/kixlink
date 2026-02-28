const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redisClient = require('../config/redis');

/**
 * Distributed Rate Limiter using Redis
 * 
 * Key concept: Rate limiting counters are stored in Redis (not server memory)
 * This means all servers share the same rate limit quota
 * 
 * Without Redis: Server 1 allows 10 requests, Server 2 allows 10 requests = 20 total (BAD)
 * With Redis: Both servers share a single counter in Redis = 10 total (GOOD)
 */

// General API rate limiter (10 requests per minute)
const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:api:', // Redis key prefix for rate limit
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    if (req.path === '/api/health') return true;
    return false;
  },
  keyGenerator: (req) => {
    // Use IP address as the key
    return req.ip || req.connection.remoteAddress;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests. Please wait before making more requests.',
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

// Stricter rate limiter for auth routes (5 requests per 15 minutes)
const authLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:', // Different prefix for auth
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // For auth, also consider username to prevent user enumeration
    return `${req.ip}:${req.body?.email || 'unknown'}`;
  },
});

// Very strict limiter for password reset (2 requests per 1 hour)
const passwordResetLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:reset:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 2,
  message: 'Too many password reset attempts, please try again later.',
});

/**
 * Middleware that logs rate limit status
 * Useful for debugging and monitoring
 */
const logRateLimit = (req, res, next) => {
  res.on('finish', () => {
    if (req.rateLimit) {
      const { limit, current, resetTime } = req.rateLimit;
      console.log(`Rate limit status - Current: ${current}/${limit}, Reset: ${new Date(resetTime).toISOString()}`);
    }
  });
  next();
};

module.exports = {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  logRateLimit,
};
