package models

import "time"

type Block struct {
	BlockNumber uint64
	BlockHash   string
	ParentHash  string

	MerkleRoot string
	StateRoot  string

	Transactions []Transaction

	Producer  string
	Timestamp time.Time
	Finality  string // tentative | confirmed
}
