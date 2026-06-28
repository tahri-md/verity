package services

import (
	"errors"
	"gin-minimal/internal/crypto"
	"gin-minimal/models"
	"gin-minimal/validators"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TransactionService struct {
	db             *gorm.DB
	accountService *AccountService
}

func NewTransactionService(db *gorm.DB, acx *AccountService) *TransactionService {
	return &TransactionService{db: db, accountService: acx}
}

func (s *TransactionService) CreateTransaction(txn *models.Transaction) (*models.Transaction, error) {
	if err := validators.ValidateTransaction(
		txn.FromAccount,
		txn.ToAccount,
		txn.Amount,
		txn.PublicKey,
	); err != nil {
		return nil, err
	}

	if _, err := s.accountService.GetAccount(txn.ToAccount); err != nil {
		return nil, errors.New("destination account does not exist")
	}

	fromAccount, err := s.accountService.GetAccount(txn.FromAccount)
	if err != nil {
		return nil, errors.New("source account does not exist")
	}

	if txn.Nonce != fromAccount.Nonce {
		return nil, errors.New("invalid nonce: expected next nonce for account")
	}

	now := time.Now().Unix()
	diff := now - txn.Timestamp
	if diff < -300 || diff > 300 {
		return nil, errors.New("transaction timestamp is too old or too far in the future")
	}

	expectedHash := crypto.HashTransaction(*txn)
	if txn.Hash != expectedHash {
		return nil, errors.New("transaction hash does not match transaction data")
	}

	if !crypto.VerifyTransactionSignature(txn) {
		return nil, errors.New("invalid transaction signature")
	}

	if fromAccount.Balance < txn.Amount {
		return nil, errors.New("insufficient balance")
	}

	var existing models.Transaction
	if err := s.db.Where("txn_id = ? OR hash = ?", txn.TxnID, txn.Hash).
		First(&existing).Error; err == nil {
		return nil, errors.New("duplicate transaction")
	}

	txn.TxnID = uuid.New().String()
	txn.Status = "pending"
	txn.BlockNumber = 0

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
	if err := s.db.First(&transaction, "txn_id = ?", id).Error; err != nil {
		return nil, err
	}
	return &transaction, nil
}

func (s *TransactionService) GetTransactionProof(txnID string) (*models.MerkleProof, error) {
	var transaction models.Transaction
	if err := s.db.First(&transaction, "txn_id = ?", txnID).Error; err != nil {
		return nil, err
	}
	var block models.Block
	if err := s.db.First(&block, "block_number = ?", transaction.BlockNumber).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("block not found")
		}
		return nil, err
	}

	var hashes []string
	for _, txn := range block.Transactions {
		hashes = append(hashes, txn.Hash)
	}

	proof, err := crypto.GenerateMerkleProof(hashes, transaction.Hash)
	if err != nil {
		return nil, err
	}

	proofNodes, err := crypto.GenerateMerkleProofNodes(hashes, transaction.Hash)
	if err != nil {
		return nil, err
	}

	root := crypto.BuildMerkleRoot(hashes)

	return &models.MerkleProof{
		TransactionID: transaction.TxnID,
		BlockNumber:   uint64(transaction.BlockNumber),
		Hashes:        proof,
		Positions: func() []string {
			positions := make([]string, 0, len(proofNodes))
			for _, n := range proofNodes {
				positions = append(positions, n.Position)
			}
			return positions
		}(),
		MerkleRoot: root,
	}, nil

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
	if err := s.db.First(&block, "block_number = ?", txn.BlockNumber).Error; err != nil {
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
