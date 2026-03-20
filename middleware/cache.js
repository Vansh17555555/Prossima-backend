const redis = require('../lib/redis');

/**
 * Middleware to cache API responses in Redis.
 * TTL is determined by CACHE_TTL environment variable.
 */
const cacheMiddleware = async (req, res, next) => {
  if (req.method !== 'GET') return next();

  const key = `api:cache:${req.originalUrl}`;
  const ttl = parseInt(process.env.CACHE_TTL) || 60;

  try {
    const cachedData = await redis.get(key);
    if (cachedData) {
      console.log(`[Cache Hit] Key: ${key}`);
      return res.status(200).json(JSON.parse(cachedData));
    }

    // Intercept res.json to cache the data before sending it
    const originalJson = res.json;
    res.json = (body) => {
      redis.setex(key, ttl, JSON.stringify(body)).catch(err => {
        console.error('Redis cache set error:', err);
      });
      return originalJson.call(res, body);
    };

    next();
  } catch (err) {
    console.error('Cache middleware error:', err);
    next();
  }
};

module.exports = cacheMiddleware;
