const redisClient = require('../config/redis');

/**
 * Cache utility for Redis operations
 * 
 * This provides a clean interface for:
 * 1. Setting cache with automatic JSON serialization
 * 2. Getting cache with automatic JSON deserialization
 * 3. Deleting cache
 * 4. Cache invalidation patterns
 */

class CacheManager {
  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} - Parsed JSON value or null
   */
  async get(key) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error(`❌ Cache GET error for ${key}:`, err);
      return null; // Fail gracefully
    }
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache (will be JSON stringified)
   * @param {number} expirationSeconds - TTL in seconds (default: 15 min)
   */
  async set(key, value, expirationSeconds = 900) {
    try {
      await redisClient.setEx(
        key,
        expirationSeconds,
        JSON.stringify(value)
      );
      console.log(`✅ Cache SET: ${key} (expires in ${expirationSeconds}s)`);
    } catch (err) {
      console.error(`❌ Cache SET error for ${key}:`, err);
    }
  }

  /**
   * Delete cache key
   * @param {string} key - Cache key
   */
  async delete(key) {
    try {
      await redisClient.del(key);
      console.log(`✅ Cache DELETED: ${key}`);
    } catch (err) {
      console.error(`❌ Cache DELETE error for ${key}:`, err);
    }
  }

  /**
   * Delete multiple keys by pattern
   * @param {string} pattern - Redis pattern (e.g., "dashboard:*")
   */
  async deleteByPattern(pattern) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length === 0) return;
      
      await redisClient.del(keys);
      console.log(`✅ Cache DELETED pattern: ${pattern} (${keys.length} keys)`);
    } catch (err) {
      console.error(`❌ Cache pattern delete error for ${pattern}:`, err);
    }
  }

  /**
   * Invalidate all dashboard caches
   * Useful when matches/teams/arenas are updated
   */
  async invalidateDashboard() {
    await this.deleteByPattern('dashboard:*');
  }

  /**
   * Invalidate all arena caches
   */
  async invalidateArenas() {
    await this.deleteByPattern('arenas:*');
  }

  /**
   * Invalidate all team caches
   */
  async invalidateTeams() {
    await this.deleteByPattern('teams:*');
  }

  /**
   * Invalidate all match caches
   */
  async invalidateMatches() {
    await this.deleteByPattern('matches:*');
  }

  /**
   * Clear all cache (use with caution!)
   */
  async flushAll() {
    try {
      await redisClient.flushDb();
      console.log('⚠️  Cache FLUSHED: All keys deleted');
    } catch (err) {
      console.error('❌ Cache flush error:', err);
    }
  }
}

module.exports = new CacheManager();
