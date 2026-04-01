package models

import "time"

type ConsensusState struct {
	BlockNumber   uint64    `gorm:"primaryKey" json:"block_number"`
	ViewNumber    uint64    `json:"view_number"`
	Leader        string    `json:"leader"`
	YesVotes      int64     `json:"yes_votes"`
	NoVotes       int64     `json:"no_votes"`
	IsFinalized   bool      `json:"is_finalized"`
	NetworkHealth string    `json:"network_health"` // healthy | degraded | partitioned
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// Vote represents a vote in the consensus process.
type Vote struct {
	VoterID   string `json:"voter_id"`
	Signature string `json:"signature"`
	Decision  string `json:"decision"` // e.g., "approve", "reject"
}
