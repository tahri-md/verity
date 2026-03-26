package models

type ProofNode struct {
	Hash     string `json:"hash"`
	Position string `json:"position"` // left or right
}
