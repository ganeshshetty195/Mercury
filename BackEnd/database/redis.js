const redis = require('redis');

// Redis Cache Client
const redisCache = redis.createClient();
redisCache.connect();

redisCache.on('error', (err) => {
  console.error('Redis Cache Error:', err);
});

redisCache.on('connect', () => {
  console.log('✅ Redis Cache connected');
});


module.exports = redisCache;
