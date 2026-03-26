package models

import "sync"

type LedgerState struct {
	mu sync.RWMutex

	Accounts     map[string]*Account
	Transactions map[string]*Transaction
	Blocks       map[uint64]*Block

	LatestBlock uint64
}

func NewLedgerState() *LedgerState {
	return &LedgerState{
		Accounts:     make(map[string]*Account),
		Transactions: make(map[string]*Transaction),
		Blocks:       make(map[uint64]*Block),
		LatestBlock:  0,
	}
}
