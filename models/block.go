package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

type Block struct {
	BlockNumber  uint64         `gorm:"primaryKey" json:"block_number"`
	BlockHash    string         `json:"block_hash"`
	ParentHash   string         `json:"parent_hash"`
	MerkleRoot   string         `json:"merkle_root"`
	StateRoot    string         `json:"state_root"`
	Transactions []Transaction  `gorm:"type:jsonb;serializer:json" json:"transactions"`
	Producer     string         `json:"producer"`
	Timestamp    time.Time      `json:"timestamp"`
	Finality     string         `json:"finality"` // tentative | confirmed
}

// Value implements the driver.Valuer interface for storing Transactions as JSON
func (b Block) Value() (driver.Value, error) {
	return json.Marshal(b.Transactions)
}

// Scan implements the sql.Scanner interface for reading Transactions from JSON
func (b *Block) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion failed")
	}
	return json.Unmarshal(bytes, &b.Transactions)
}
