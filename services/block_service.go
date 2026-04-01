package services

import (
	"errors"
	"gin-minimal/internal/crypto"
	"gin-minimal/models"
	"time"
	"gorm.io/gorm"
)

type BlockService struct {
	db               *gorm.DB
	transactionSvc   *TransactionService
	accountSvc       *AccountService
}

func NewBlockService(db *gorm.DB, txnSvc *TransactionService, acctSvc *AccountService) *BlockService {
	return &BlockService{
		db:               db,
		transactionSvc:   txnSvc,
		accountSvc:       acctSvc,
	}
}

// CreateBlock creates a new block with validation
func (s *BlockService) CreateBlock(block *models.Block) (*models.Block, error) {
	if block.BlockNumber == 0 {
		return nil, errors.New("invalid block number")
	}

	if len(block.Transactions) == 0 {
		return nil, errors.New("block must contain at least one transaction")
	}

	// Validate all transactions and calculate merkle root
	var hashes []string
	for _, txn := range block.Transactions {
		// Update transaction status and block number
		txn.BlockNumber = int64(block.BlockNumber)
		txn.Status = "confirmed"
		hashes = append(hashes, txn.Hash)
	}

	// Build merkle root
	block.MerkleRoot = crypto.BuildMerkleRoot(hashes)
	block.Timestamp = time.Now()

	if err := s.db.Create(block).Error; err != nil {
		return nil, err
	}

	// Update all transactions in the block
	for _, txn := range block.Transactions {
		if err := s.db.Model(&txn).Updates(txn).Error; err != nil {
			return nil, err
		}
	}

	return block, nil
}

// GetBlock retrieves a block by number
func (s *BlockService) GetBlock(blockNumber uint64) (*models.Block, error) {
	var block models.Block
	if err := s.db.First(&block, "block_number = ?", blockNumber).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("block not found")
		}
		return nil, err
	}
	return &block, nil
}

// GetAllBlocks retrieves all blocks
func (s *BlockService) GetAllBlocks() ([]models.Block, error) {
	var blocks []models.Block
	if err := s.db.Find(&blocks).Error; err != nil {
		return nil, err
	}
	return blocks, nil
}

// GetBlockByHash retrieves a block by hash
func (s *BlockService) GetBlockByHash(hash string) (*models.Block, error) {
	var block models.Block
	if err := s.db.First(&block, "block_hash = ?", hash).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("block not found")
		}
		return nil, err
	}
	return &block, nil
}

// ValidateBlock validates a block structure and transactions
func (s *BlockService) ValidateBlock(block *models.Block) (bool, error) {
	if block.BlockNumber == 0 {
		return false, errors.New("invalid block number")
	}

	if len(block.Transactions) == 0 {
		return false, errors.New("block is empty")
	}

	// Verify merkle root
	var hashes []string
	for _, txn := range block.Transactions {
		hashes = append(hashes, txn.Hash)
	}

	calculatedRoot := crypto.BuildMerkleRoot(hashes)
	if calculatedRoot != block.MerkleRoot {
		return false, errors.New("merkle root mismatch")
	}

	// Validate each transaction
	for _, txn := range block.Transactions {
		if !crypto.VerifyTransactionSignature(&txn) {
			return false, errors.New("invalid transaction signature")
		}
	}

	return true, nil
}

// SetBlockFinality sets the finality status of a block
func (s *BlockService) SetBlockFinality(blockNumber uint64, finality string) (*models.Block, error) {
	block, err := s.GetBlock(blockNumber)
	if err != nil {
		return nil, err
	}

	if finality != "tentative" && finality != "confirmed" {
		return nil, errors.New("invalid finality status")
	}

	block.Finality = finality
	if err := s.db.Save(block).Error; err != nil {
		return nil, err
	}
	return block, nil
}

// GetLatestBlock retrieves the most recent block
func (s *BlockService) GetLatestBlock() (*models.Block, error) {
	var block models.Block
	if err := s.db.Order("block_number DESC").First(&block).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("no blocks found")
		}
		return nil, err
	}
	return &block, nil
}
