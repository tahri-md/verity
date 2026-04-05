package models

type Transaction struct {
	TxnID       string `gorm:"primaryKey" json:"txn_id"`
	FromAccount string `json:"from_account"`
	ToAccount   string `json:"to_account"`
	Amount      int64  `json:"amount"`
	Nonce       uint64 `json:"nonce"`
	Timestamp   int64  `json:"timestamp"`
	Signature   string `json:"signature"`
	PublicKey   string `json:"public_key"`
	Status      string `json:"status"`
	BlockNumber int64  `json:"block_number,omitempty"`
	Hash        string `json:"hash"` // Add this line
}
