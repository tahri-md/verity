package services

import (
	"gin-minimal/internal/crypto"
	"gin-minimal/models"
	"testing"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTransactionTestDB() *gorm.DB {
	db, _ := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	db.AutoMigrate(&models.Transaction{})
	return db
}

func TestCreateTransaction(t *testing.T) {
	db := setupTransactionTestDB()

	acctService := NewAccountService(db)
	txnService := NewTransactionService(db, acctService)
	txHash := crypto.Hash("test_transaction")
	transaction := &models.Transaction{
		TxnID:       "txn_1",
		FromAccount: "account_1",
		ToAccount:   "account_2",
		Amount:      100,
		Nonce:       1,
		Timestamp:   1234567890,
		Status:      "pending",
		Hash:        txHash,
	}

	createdTxn, err := txnService.CreateTransaction(transaction)
	if err != nil {
		t.Fatalf("Failed to create transaction: %v", err)
	}

	if createdTxn.TxnID != "txn_1" {
		t.Errorf("Expected transaction ID 'txn_1', got %s", createdTxn.TxnID)
	}

	if createdTxn.Amount != 100 {
		t.Errorf("Expected amount 100, got %d", createdTxn.Amount)
	}
}

func TestGetTransaction(t *testing.T) {
	db := setupTransactionTestDB()
	acctService := NewAccountService(db)
	txnService := NewTransactionService(db, acctService)
	txHash := crypto.Hash("test_transaction_2")
	transaction := &models.Transaction{
		TxnID:       "txn_2",
		FromAccount: "account_1",
		ToAccount:   "account_2",
		Amount:      200,
		Nonce:       1,
		Timestamp:   1234567890,
		Status:      "pending",
		Hash:        txHash,
	}
	txnService.CreateTransaction(transaction)

	retrieved, err := txnService.GetTransactionByID("txn_2")
	if err != nil {
		t.Fatalf("Failed to get transaction: %v", err)
	}

	if retrieved.Amount != 200 {
		t.Errorf("Expected amount 200, got %d", retrieved.Amount)
	}
}

func TestGetAllTransactions(t *testing.T) {
	db := setupTransactionTestDB()
	acctService := NewAccountService(db)
	txnService := NewTransactionService(db, acctService)
	txHash1 := crypto.Hash("test_txn_3")
	txHash2 := crypto.Hash("test_txn_4")

	txn1 := &models.Transaction{
		TxnID:       "txn_3",
		FromAccount: "account_1",
		ToAccount:   "account_2",
		Amount:      100,
		Hash:        txHash1,
		Status:      "pending",
	}

	txn2 := &models.Transaction{
		TxnID:       "txn_4",
		FromAccount: "account_2",
		ToAccount:   "account_3",
		Amount:      200,
		Hash:        txHash2,
		Status:      "pending",
	}

	txnService.CreateTransaction(txn1)
	txnService.CreateTransaction(txn2)

	transactions, err := txnService.GetAllTransactions()
	if err != nil {
		t.Fatalf("Failed to get all transactions: %v", err)
	}

	if len(transactions) != 2 {
		t.Errorf("Expected 2 transactions, got %d", len(transactions))
	}
}

func TestHashTransaction(t *testing.T) {
	txn := models.Transaction{
		FromAccount: "account_1",
		ToAccount:   "account_2",
		Amount:      100,
	}

	hash1 := crypto.HashTransaction(txn)
	hash2 := crypto.HashTransaction(txn)

	if hash1 != hash2 {
		t.Error("Expected same hash for same transaction")
	}

	if len(hash1) == 0 {
		t.Error("Expected non-empty hash")
	}
}
