package config

import (
	"fmt"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func InitDB() (*gorm.DB, error) {
	// Use SQLite for local development if environment variable is set
	if os.Getenv("USE_SQLITE") == "true" {
		db, err := gorm.Open(sqlite.Open("verity.db"), &gorm.Config{})
		if err != nil {
			return nil, err
		}
		return db, nil
	}

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		"localhost",
		"postgres",
		"password",
		"verity",
		"5432",
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	return db, nil
}
