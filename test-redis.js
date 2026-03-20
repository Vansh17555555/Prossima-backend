const redis = require('./lib/redis');

async function testRedis() {
  try {
    console.log('Testing Redis connection...');
    await redis.set('test_key', 'IREPS_READY');
    const val = await redis.get('test_key');
    console.log('Redis read/write successful. Value:', val);
    process.exit(0);
  } catch (err) {
    console.error('Redis test failed:', err);
    process.exit(1);
  }
}

testRedis();
