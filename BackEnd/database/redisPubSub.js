const redis = require('redis');

const publisher = redis.createClient();
const subscriber = redis.createClient();

publisher.on('error', (err) => {
  console.error('Redis publisher error:', err);
});

subscriber.on('error', (err) => {
  console.error('Redis subscriber error:', err);
});

async function connectRedis() {
  if (!publisher.isOpen) await publisher.connect();
  if (!subscriber.isOpen) await subscriber.connect();
}

module.exports = {
  publisher,
  subscriber,
  connectRedis,
};