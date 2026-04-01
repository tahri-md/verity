package services

import (
	"errors"
	"gin-minimal/models"
	"gorm.io/gorm"
)

type ConsensusService struct {
	db *gorm.DB
}

func NewConsensusService(db *gorm.DB) *ConsensusService {
	return &ConsensusService{db: db}
}

// CreateConsensusState creates a new consensus state
func (s *ConsensusService) CreateConsensusState(state *models.ConsensusState) (*models.ConsensusState, error) {
	if state.BlockNumber == 0 {
		return nil, errors.New("invalid block number")
	}

	if err := s.db.Create(state).Error; err != nil {
		return nil, err
	}
	return state, nil
}

// GetConsensusState retrieves consensus state for a block
func (s *ConsensusService) GetConsensusState(blockNumber uint64) (*models.ConsensusState, error) {
	var state models.ConsensusState
	if err := s.db.First(&state, "block_number = ?", blockNumber).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("consensus state not found")
		}
		return nil, err
	}
	return &state, nil
}

// RegisterVote records a vote from a validator
func (s *ConsensusService) RegisterVote(blockNumber uint64, validatorID string, vote string) error {
	state, err := s.GetConsensusState(blockNumber)
	if err != nil {
		return err
	}

	if vote != "yes" && vote != "no" {
		return errors.New("invalid vote")
	}

	if vote == "yes" {
		state.YesVotes++
	} else {
		state.NoVotes++
	}

	if err := s.db.Save(state).Error; err != nil {
		return err
	}
	return nil
}

// ElectLeader performs leader election based on voting
func (s *ConsensusService) ElectLeader(blockNumber uint64, validators []string) (string, error) {
	state, err := s.GetConsensusState(blockNumber)
	if err != nil {
		return "", err
	}

	totalVotes := state.YesVotes + state.NoVotes
	if totalVotes == 0 {
		return "", errors.New("no votes cast")
	}

	// Simple majority-based election
	requiredVotes := (len(validators) / 2) + 1
	if state.YesVotes >= int64(requiredVotes) {
		if state.Leader == "" {
			state.Leader = validators[0]
			if err := s.db.Save(state).Error; err != nil {
				return "", err
			}
		}
		return state.Leader, nil
	}

	return "", errors.New("consensus not reached")
}

// GetVotingStatus returns current voting status
func (s *ConsensusService) GetVotingStatus(blockNumber uint64) (*models.ConsensusState, error) {
	return s.GetConsensusState(blockNumber)
}

// FinalizeBlock marks a block as finalized by consensus
func (s *ConsensusService) FinalizeBlock(blockNumber uint64) error {
	state, err := s.GetConsensusState(blockNumber)
	if err != nil {
		return err
	}

	state.IsFinalized = true
	if err := s.db.Save(state).Error; err != nil {
		return err
	}
	return nil
}

// IsBlockFinalized checks if a block has reached consensus finality
func (s *ConsensusService) IsBlockFinalized(blockNumber uint64) (bool, error) {
	state, err := s.GetConsensusState(blockNumber)
	if err != nil {
		return false, err
	}
	return state.IsFinalized, nil
}

// GetLatestConsensusState retrieves the most recent consensus state
func (s *ConsensusService) GetLatestConsensusState() (*models.ConsensusState, error) {
	var state models.ConsensusState
	if err := s.db.Order("block_number DESC").First(&state).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("no consensus states found")
		}
		return nil, err
	}
	return &state, nil
}
