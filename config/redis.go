package config

import (
	"gin-minimal/cache"
)

func InitRedis(addr string) (*cache.RedisClient, error) {
	return cache.NewRedisClient(addr)
}
