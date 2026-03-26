package services

import (
	"errors"
	"gin-minimal/internal/crypto"
	"gin-minimal/models"

	"gorm.io/gorm"
)

type TransactionService struct {
	db *gorm.DB
}

func NewTransactionService(db *gorm.DB) *TransactionService {
	return &TransactionService{db: db}
}
func (s *TransactionService) CreateTransaction(txn *models.Transaction) (*models.Transaction, error) {
	if err := s.db.Create(txn).Error; err != nil {
		return nil, err
	}
	return txn, nil
}
func (s *TransactionService) GetAllTransactions() ([]models.Transaction, error) {
	var transactions []models.Transaction
	if err := s.db.Find(&transactions).Error; err != nil {
		return nil, err
	}
	return transactions, nil
}
func (s *TransactionService) GetTransactionByID(id string) (*models.Transaction, error) {
	var transaction models.Transaction
	if err := s.db.First(&transaction, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &transaction, nil
}

func (s *TransactionService) GetTransactionProof(txnID string) (*models.MerkleProof, error) {
	var transaction models.Transaction
	if err := s.db.First(&transaction, "id = ?", txnID).Error; err != nil {
		return nil, err
	}
	var blocks []models.Block
	if err := s.db.Find(&blocks, "number = ?", transaction.BlockNumber).Error; err != nil {
		return nil, err
	}
	if len(blocks) == 0 {
		return nil, errors.New("block not found")
	}
	block := blocks[0]

	var hashes []string
	for _, txn := range block.Transactions {
		hashes = append(hashes, txn.Hash)
	}

	proof, err := crypto.GenerateMerkleProof(hashes, transaction.Hash)
	if err != nil {
		return nil, err
	}

	root := crypto.BuildMerkleRoot(hashes)

	return proof, root, nil

}

func (s *TransactionService) VerifyTransactionExternally(
	txn models.Transaction,
	proof []models.ProofNode,
) (bool, error) {

	// 1️⃣ Recompute transaction hash
	recomputedHash := crypto.HashTransaction(txn)

	if recomputedHash != txn.Hash {
		return false, errors.New("transaction hash mismatch")
	}

	// 2️⃣ Verify digital signature
	if !crypto.VerifySignature(txn.PublicKey, txn.Signature, txn.Hash) {
		return false, errors.New("invalid signature")
	}

	// 3️⃣ Load block
	var block models.Block
	if err := s.db.First(&block, "number = ?", txn.BlockNumber).Error; err != nil {
		return false, errors.New("block not found")
	}

	// 4️⃣ Verify Merkle proof
	if !crypto.VerifyMerkleProof(txn.Hash, proof, block.MerkleRoot) {
		return false, errors.New("invalid merkle proof")
	}

	// 5️⃣ (Optional but strong) verify block hash integrity
	expectedBlockHash := crypto.Hash(block.ParentHash + block.MerkleRoot)
	if expectedBlockHash != block.BlockHash {
		return false, errors.New("block integrity compromised")
	}

	return true, nil
}
