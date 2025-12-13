import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 86400, checkperiod: 600 });  // 24h TTL, check every 10 min

// Generic cache wrapper
export async function cachedCall(key, fn, ...args) {
  let data = cache.get(key);
  if (data) {
    console.log(`Cache hit: ${key}`);
    return data;
  }
  data = await fn(...args);
  cache.set(key, data);
  console.log(`Cache set: ${key}`);
  return data;
}
