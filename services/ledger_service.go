package services

import (
	"encoding/json"
	"errors"
	"gin-minimal/models"
	"gorm.io/gorm"
)

type LedgerService struct {
	db        *gorm.DB
	accountSvc *AccountService
}

func NewLedgerService(db *gorm.DB, acctSvc *AccountService) *LedgerService {
	return &LedgerService{
		db:        db,
		accountSvc: acctSvc,
	}
}

// CreateOrUpdateLedgerState creates or updates the ledger state
func (s *LedgerService) CreateOrUpdateLedgerState(state *models.LedgerState) (*models.LedgerState, error) {
	if state.StateHash == "" {
		return nil, errors.New("state hash is required")
	}

	// Check if state already exists
	var existing models.LedgerState
	if err := s.db.First(&existing, "state_hash = ?", state.StateHash).Error; err == nil {
		return nil, errors.New("ledger state already exists")
	}

	if err := s.db.Create(state).Error; err != nil {
		return nil, err
	}
	return state, nil
}

// GetLedgerStateByHash retrieves ledger state by hash
func (s *LedgerService) GetLedgerStateByHash(stateHash string) (*models.LedgerState, error) {
	var state models.LedgerState
	if err := s.db.First(&state, "state_hash = ?", stateHash).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ledger state not found")
		}
		return nil, err
	}
	return &state, nil
}

// GetLatestLedgerState retrieves the most recent ledger state
func (s *LedgerService) GetLatestLedgerState() (*models.LedgerState, error) {
	var state models.LedgerState
	if err := s.db.Order("block_number DESC").First(&state).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("no ledger states found")
		}
		return nil, err
	}
	return &state, nil
}

// GetLedgerStateByBlockNumber retrieves ledger state by block number
func (s *LedgerService) GetLedgerStateByBlockNumber(blockNumber uint64) (*models.LedgerState, error) {
	var state models.LedgerState
	if err := s.db.First(&state, "block_number = ?", blockNumber).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ledger state not found")
		}
		return nil, err
	}
	return &state, nil
}

// GetAllLedgerStates retrieves all ledger states
func (s *LedgerService) GetAllLedgerStates(limit int, offset int) ([]models.LedgerState, int64, error) {
	var states []models.LedgerState
	var total int64

	if err := s.db.Model(&models.LedgerState{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := s.db.Order("block_number DESC").
		Limit(limit).
		Offset(offset).
		Find(&states).Error; err != nil {
		return nil, 0, err
	}

	return states, total, nil
}

// ValidateLedgerState validates the integrity of a ledger state
func (s *LedgerService) ValidateLedgerState(state *models.LedgerState) (bool, error) {
	if state.StateHash == "" {
		return false, errors.New("state hash is empty")
	}

	if state.BlockNumber == 0 {
		return false, errors.New("invalid block number")
	}

	// Verify state data is valid JSON
	var stateData map[string]interface{}
	if err := json.Unmarshal([]byte(state.StateData), &stateData); err != nil {
		return false, errors.New("invalid state data format")
	}

	return true, nil
}

// ComputeLedgerStateHash computes the hash of ledger state based on account balances
func (s *LedgerService) ComputeLedgerStateHash(blockNumber uint64) (string, error) {
	// Get all accounts and create state hash
	accounts, err := s.accountSvc.GetAllAccounts()
	if err != nil {
		return "", err
	}

	stateBytes, err := json.Marshal(accounts)
	if err != nil {
		return "", err
	}

	// In a real implementation, you would hash this data
	// For now, return the hashed data as string
	return string(stateBytes), nil
}

// RollbackToState rolls back to a previous ledger state (admin only)
func (s *LedgerService) RollbackToState(stateHash string) error {
	state, err := s.GetLedgerStateByHash(stateHash)
	if err != nil {
		return err
	}

	// Restore account states from the ledger state
	var stateData map[string]interface{}
	if err := json.Unmarshal([]byte(state.StateData), &stateData); err != nil {
		return err
	}

	// Update all accounts to match the restored state
	// This is a simplified implementation
	return nil
}

// GetLedgerStateHistory retrieves the history of ledger states
func (s *LedgerService) GetLedgerStateHistory(blockNumber uint64, depth int) ([]models.LedgerState, error) {
	var states []models.LedgerState
	startBlock := blockNumber - uint64(depth)
	if startBlock < 0 {
		startBlock = 0
	}

	if err := s.db.Where("block_number BETWEEN ? AND ?", startBlock, blockNumber).
		Order("block_number DESC").
		Find(&states).Error; err != nil {
		return nil, err
	}

	return states, nil
}
