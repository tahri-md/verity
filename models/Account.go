package models

import "time"

type Account struct {
	AccountID string    `gorm:"primaryKey" json:"account_id"`
	Balance   int64     `json:"balance"`
	Nonce     uint64    `json:"nonce"`
	PublicKey []byte    `json:"public_key"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
