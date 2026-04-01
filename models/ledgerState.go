package models

import "time"

type LedgerState struct {
	StateHash    string    `gorm:"primaryKey" json:"state_hash"`
	BlockNumber  uint64    `json:"block_number"`
	StateData    string    `gorm:"type:jsonb" json:"state_data"`     // JSON-encoded state
	RootHash     string    `json:"root_hash"`
	Timestamp    time.Time `json:"timestamp"`
	IsValid      bool      `json:"is_valid"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
	}
}
