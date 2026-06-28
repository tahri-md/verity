package services

import (
	"errors"
	"gin-minimal/internal/crypto"
	"gin-minimal/models"
	"time"

	"gorm.io/gorm"
)

type BlockService struct {
	db             *gorm.DB
	transactionSvc *TransactionService
	accountSvc     *AccountService
}

func NewBlockService(db *gorm.DB, txnSvc *TransactionService, acctSvc *AccountService) *BlockService {
	return &BlockService{
		db:             db,
		transactionSvc: txnSvc,
		accountSvc:     acctSvc,
	}
}

func (s *BlockService) CreateBlock(block *models.Block) (*models.Block, error) {
	if len(block.Transactions) == 0 {
		return nil, errors.New("block must contain at least one transaction")
	}

	latest, err := s.GetLatestBlock()
	if err != nil && err.Error() != "no blocks found" {
		return nil, err
	}

	if err == nil {
		if block.BlockNumber != latest.BlockNumber+1 {
			return nil, errors.New("block number must be exactly one greater than the latest block")
		}
		if block.ParentHash != latest.BlockHash {
			return nil, errors.New("parent hash does not match the latest block hash")
		}
	} else {
		if block.BlockNumber != 1 {
			return nil, errors.New("first block must have block number 1")
		}
		if block.ParentHash != "" {
			return nil, errors.New("genesis block must have empty parent hash")
		}
	}

	seenSenders := make(map[string]int64)

	for i := range block.Transactions {
		txn := &block.Transactions[i]

		if txn.Status != "pending" {
			return nil, errors.New("transaction " + txn.TxnID + " is not in pending status")
		}

		if !crypto.VerifyTransactionSignature(txn) {
			return nil, errors.New("invalid signature on transaction " + txn.TxnID)
		}

		seenSenders[txn.FromAccount] += txn.Amount

		fromAccount, err := s.accountSvc.GetAccount(txn.FromAccount)
		if err != nil {
			return nil, errors.New("account not found for transaction " + txn.TxnID)
		}

		if seenSenders[txn.FromAccount] > fromAccount.Balance {
			return nil, errors.New("insufficient balance for account " + txn.FromAccount + " across block transactions")
		}
	}

	var hashes []string
	for _, txn := range block.Transactions {
		hashes = append(hashes, txn.Hash)
	}

	block.MerkleRoot = crypto.BuildMerkleRoot(hashes)
	block.BlockHash = crypto.Hash(block.ParentHash + block.MerkleRoot)
	block.Timestamp = time.Now()
	block.Finality = "tentative"

	if err := s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(block).Error; err != nil {
			return err
		}

		for i := range block.Transactions {
			txn := &block.Transactions[i]
			txn.BlockNumber = int64(block.BlockNumber)
			txn.Status = "confirmed"

			if err := tx.Model(txn).Updates(map[string]interface{}{
				"block_number": txn.BlockNumber,
				"status":       "confirmed",
			}).Error; err != nil {
				return err
			}

			if err := tx.Model(&models.Account{}).
				Where("account_id = ?", txn.FromAccount).
				UpdateColumn("balance", gorm.Expr("balance - ?", txn.Amount)).
				Error; err != nil {
				return err
			}

			if err := tx.Model(&models.Account{}).
				Where("account_id = ?", txn.ToAccount).
				UpdateColumn("balance", gorm.Expr("balance + ?", txn.Amount)).
				Error; err != nil {
				return err
			}

			if err := tx.Model(&models.Account{}).
				Where("account_id = ?", txn.FromAccount).
				UpdateColumn("nonce", gorm.Expr("nonce + 1")).
				Error; err != nil {
				return err
			}
		}

		return nil
	}); err != nil {
		return nil, err
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
