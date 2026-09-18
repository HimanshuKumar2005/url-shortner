export function createCache(redis, ttlSeconds) {
  return {
    async get(shortKey) {
      return redis.get(`url-shortner:url:${shortKey}`);
    },
    async set(shortKey, longUrl) {
      await redis.set(`url-shortner:url:${shortKey}`, longUrl, { EX: ttlSeconds });
    },
  };
}
