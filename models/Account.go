package models

import "time"

type Account struct {
	AccountID string    `gorm:"primaryKey" json:"account_id"`
	Email     string    `gorm:"uniqueIndex" json:"email"`
	Password  string    `json:"-"` // Don't expose password in API responses
	Name      string    `json:"name"`
	Balance   int64     `json:"balance"`
	Nonce     uint64    `json:"nonce"`
	PublicKey []byte    `json:"public_key"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
