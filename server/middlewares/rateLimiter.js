const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const redisClient = require('../config/redis');

/**
 * Custom Redis-based Rate Limiter
 * 
 * Key concept: Rate limiting counters are stored in Redis (not server memory)
 * This means all servers share the same rate limit quota
 */

// Create rate limiter with Redis store
const createRateLimiter = (options) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message || 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: ipKeyGenerator,
    skip: options.skip,
    handler: options.handler,
    // Custom store function for Redis
    store: {
      incr: async (key, cb) => {
        try {
          const fullKey = `${options.prefix}${key}`;
          const current = await redisClient.incr(fullKey);
          
          // Set expiry on first increment
          if (current === 1) {
            const ttlSeconds = Math.ceil(options.windowMs / 1000);
            await redisClient.expire(fullKey, ttlSeconds);
          }
          
          // Return just the count (express-rate-limit expects a number)
          return cb(null, current);
        } catch (error) {
          console.error('Redis rate limit error:', error.message);
          return cb(error);
        }
      },
      resetKey: async (key, cb) => {
        try {
          const fullKey = `${options.prefix}${key}`;
          await redisClient.del(fullKey);
          return cb();
        } catch (error) {
          console.error('Redis reset error:', error.message);
          return cb(error);
        }
      },
    },
  });
};

// General API rate limiter (10 requests per minute)
const apiLimiter = createRateLimiter({
  prefix: 'rl:api:',
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => {
    if (req.path === '/api/health') return true;
    return false;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests. Please wait before making more requests.',
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

// Stricter rate limiter for auth routes (5 requests per 15 minutes)
const authLimiter = createRateLimiter({
  prefix: 'rl:auth:',
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.',
});

// Very strict limiter for password reset (2 requests per 1 hour)
const passwordResetLimiter = createRateLimiter({
  prefix: 'rl:reset:',
  windowMs: 60 * 60 * 1000,
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
      const resetDate = resetTime ? new Date(resetTime) : null;
      const resetISO = resetDate && !isNaN(resetDate) ? resetDate.toISOString() : 'N/A';
      console.log(`Rate limit status - Current: ${current}/${limit}, Reset: ${resetISO}`);
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
