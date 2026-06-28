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
		return errors.New("invalid vote: must be 'yes' or 'no'")
	}

	// Check if this validator already voted
	for _, v := range state.Voters {
		if v == validatorID {
			return errors.New("validator has already voted on this block")
		}
	}

	state.Voters = append(state.Voters, validatorID)
	if vote == "yes" {
		state.YesVotes++
	} else {
		state.NoVotes++
	}

	return s.db.Save(state).Error
}

// ElectLeader performs leader election based on voting
func (s *ConsensusService) ElectLeader(blockNumber uint64, validators []string) (string, error) {
	if len(validators) == 0 {
		return "", errors.New("validator list is empty")
	}

	state, err := s.GetConsensusState(blockNumber)
	if err != nil {
		return "", err
	}

	totalVotes := state.YesVotes + state.NoVotes
	if totalVotes == 0 {
		return "", errors.New("no votes cast")
	}

	requiredVotes := (len(validators) / 2) + 1
	if state.YesVotes < int64(requiredVotes) {
		return "", errors.New("consensus not reached")
	}

	if state.Leader == "" {
		// Round-robin: deterministic, fair, not biased toward index 0
		state.Leader = validators[blockNumber%uint64(len(validators))] // ← was: validators[0]
		if err := s.db.Save(state).Error; err != nil {
			return "", err
		}
	}

	return state.Leader, nil
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

// GetAllConsensusStates retrieves all consensus states with pagination
func (s *ConsensusService) GetAllConsensusStates(limit, offset int) ([]models.ConsensusState, int64, error) {
	var states []models.ConsensusState
	var total int64

	if err := s.db.Model(&models.ConsensusState{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := s.db.Order("block_number DESC").Limit(limit).Offset(offset).Find(&states).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return []models.ConsensusState{}, 0, nil
		}
		return nil, 0, err
	}

	return states, total, nil
}
