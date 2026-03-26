package models

type ConsensusState struct {
	ViewNumber    uint64
	CurrentLeader string
	PendingBlock  *Block
	Votes         map[string]*Vote
	NetworkHealth string // healthy | degraded | partitioned
}

// Vote represents a vote in the consensus process.
type Vote struct {
	VoterID   string
	Signature string
	Decision  string // e.g., "approve", "reject"
}
