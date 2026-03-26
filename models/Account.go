package models

import "time"

type Account struct {
	AccountID string
	Balance   int64
	Nonce     uint64
	PublicKey []byte
	CreatedAt time.Time
	UpdatedAt time.Time
}
