package models

type MerkleProof struct {
	TransactionID string   `json:"transaction_id"`
	BlockNumber   uint64   `json:"block_number"`
	Hashes        []string `json:"hashes"`
	Positions     []string `json:"positions"`
	MerkleRoot    string   `json:"merkle_root"`
}
