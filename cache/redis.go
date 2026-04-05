package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

// RedisClient wraps redis client with custom methods
type RedisClient struct {
	client *redis.Client
}

// NewRedisClient creates a new Redis client
func NewRedisClient(addr string) (*RedisClient, error) {
	client := redis.NewClient(&redis.Options{
		Addr: addr,
	})

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, err
	}

	return &RedisClient{client: client}, nil
}

// Set stores a key-value pair with expiration
func (rc *RedisClient) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}

	return rc.client.Set(ctx, key, data, expiration).Err()
}

// Get retrieves a value by key and unmarshals it
func (rc *RedisClient) Get(ctx context.Context, key string, dest interface{}) error {
	val, err := rc.client.Get(ctx, key).Result()
	if err != nil {
		return err
	}

	return json.Unmarshal([]byte(val), dest)
}

// GetString retrieves a string value by key
func (rc *RedisClient) GetString(ctx context.Context, key string) (string, error) {
	return rc.client.Get(ctx, key).Result()
}

// Delete removes one or more keys
func (rc *RedisClient) Delete(ctx context.Context, keys ...string) error {
	return rc.client.Del(ctx, keys...).Err()
}

// Exists checks if one or more keys exist
func (rc *RedisClient) Exists(ctx context.Context, keys ...string) (int64, error) {
	return rc.client.Exists(ctx, keys...).Result()
}

// Incr increments the value of a key
func (rc *RedisClient) Incr(ctx context.Context, key string) (int64, error) {
	return rc.client.Incr(ctx, key).Result()
}

// IncrBy increments the value of a key by decrement
func (rc *RedisClient) IncrBy(ctx context.Context, key string, increment int64) (int64, error) {
	return rc.client.IncrBy(ctx, key, increment).Result()
}

// Decr decrements the value of a key
func (rc *RedisClient) Decr(ctx context.Context, key string) (int64, error) {
	return rc.client.Decr(ctx, key).Result()
}

// Expire sets a timeout on a key
func (rc *RedisClient) Expire(ctx context.Context, key string, expiration time.Duration) error {
	return rc.client.Expire(ctx, key, expiration).Err()
}

// TTL gets the remaining time to live of a key
func (rc *RedisClient) TTL(ctx context.Context, key string) (time.Duration, error) {
	return rc.client.TTL(ctx, key).Result()
}

// CacheKey generates a cache key
func CacheKey(prefix string, id string) string {
	return fmt.Sprintf("%s:%s", prefix, id)
}

// CacheTransactionKey generates cache key for transactions
func CacheTransactionKey(txnID string) string {
	return CacheKey("transaction", txnID)
}

// CacheAccountKey generates cache key for accounts
func CacheAccountKey(accountID string) string {
	return CacheKey("account", accountID)
}

// CacheBlockKey generates cache key for blocks
func CacheBlockKey(blockNumber uint64) string {
	return CacheKey("block", fmt.Sprintf("%d", blockNumber))
}

// CloseConnection closes the Redis connection
func (rc *RedisClient) CloseConnection() error {
	return rc.client.Close()
}
