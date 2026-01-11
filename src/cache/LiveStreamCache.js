/**
 * LiveStreamCache - In-memory cache for YouTube live stream detection
 *
 * This cache reduces YouTube API quota usage by storing recent lookups
 * for a configurable TTL (Time To Live) period.
 *
 * @class LiveStreamCache
 * @example
 * const cache = new LiveStreamCache(5); // 5 minute TTL
 * cache.set('channelId', { videoId: '123', title: 'Live Stream' });
 * const data = cache.get('channelId');
 */
class LiveStreamCache {
  /**
   * Initialize a new LiveStreamCache instance
   * @param {number} ttlMinutes - Time to live in minutes (default: 5)
   */
  constructor(ttlMinutes = 5) {
    this.cache = new Map();
    this.ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds
    console.log(`💾 Cache initialized with ${ttlMinutes} minute TTL`);
  }

  /**
   * Retrieve cached value if it exists and hasn't expired
   * @param {string} key - Cache key (typically channel ID)
   * @returns {Object|null} Cached data or null if not found/expired
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }

    const now = Date.now();
    const age = now - item.timestamp;

    // Check if cache entry has expired
    if (age > this.ttl) {
      this.cache.delete(key);
      console.log(`🗑️  Cache expired for ${key}`);
      return null;
    }

    const ageSeconds = Math.round(age / 1000);
    console.log(`✅ Cache hit for ${key} (age: ${ageSeconds}s)`);
    return item.data;
  }

  /**
   * Store a value in the cache with current timestamp
   * @param {string} key - Cache key (typically channel ID)
   * @param {Object} data - Data to cache
   */
  set(key, data) {
    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
    console.log(`💾 Cached result for ${key}`);
  }

  /**
   * Remove all entries from the cache
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`🗑️  Cache cleared (removed ${size} entries)`);
  }

  /**
   * Get cache statistics and metadata
   * @returns {Object} Cache statistics including size and all keys
   */
  getStats() {
    const entries = [];
    const now = Date.now();

    for (const [key, item] of this.cache.entries()) {
      const age = now - item.timestamp;
      const expiresIn = this.ttl - age;

      entries.push({
        key: key,
        ageSeconds: Math.round(age / 1000),
        expiresInSeconds: Math.round(expiresIn / 1000)
      });
    }

    return {
      size: this.cache.size,
      ttlMinutes: this.ttl / 60000,
      entries: entries
    };
  }

  /**
   * Check if a key exists in the cache (regardless of expiration)
   * @param {string} key - Cache key to check
   * @returns {boolean} True if key exists
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Remove a specific entry from the cache
   * @param {string} key - Cache key to remove
   * @returns {boolean} True if item was removed
   */
  delete(key) {
    const existed = this.cache.delete(key);
    if (existed) {
      console.log(`🗑️  Removed cache entry for ${key}`);
    }
    return existed;
  }
}

module.exports = LiveStreamCache;

