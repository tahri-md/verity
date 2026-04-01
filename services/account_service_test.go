package services

import (
	"testing"
	"gin-minimal/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// setupTestDB creates an in-memory SQLite database for testing
func setupTestDB() *gorm.DB {
	db, _ := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	db.AutoMigrate(&models.Account{})
	return db
}

func TestCreateAccount(t *testing.T) {
	db := setupTestDB()
	service := NewAccountService(db)

	account := &models.Account{
		AccountID: "test_account",
		Balance:   1000,
		Nonce:     0,
	}

	createdAccount, err := service.CreateAccount(account)
	if err != nil {
		t.Fatalf("Failed to create account: %v", err)
	}

	if createdAccount.AccountID != "test_account" {
		t.Errorf("Expected account ID 'test_account', got %s", createdAccount.AccountID)
	}

	if createdAccount.Balance != 1000 {
		t.Errorf("Expected balance 1000, got %d", createdAccount.Balance)
	}
}

func TestGetAccount(t *testing.T) {
	db := setupTestDB()
	service := NewAccountService(db)

	account := &models.Account{
		AccountID: "test_account_2",
		Balance:   2000,
		Nonce:     0,
	}
	service.CreateAccount(account)

	retrievedAccount, err := service.GetAccount("test_account_2")
	if err != nil {
		t.Fatalf("Failed to get account: %v", err)
	}

	if retrievedAccount.Balance != 2000 {
		t.Errorf("Expected balance 2000, got %d", retrievedAccount.Balance)
	}
}

func TestUpdateBalance(t *testing.T) {
	db := setupTestDB()
	service := NewAccountService(db)

	account := &models.Account{
		AccountID: "test_account_3",
		Balance:   1000,
	}
	service.CreateAccount(account)

	updated, err := service.UpdateBalance("test_account_3", 500)
	if err != nil {
		t.Fatalf("Failed to update balance: %v", err)
	}

	if updated.Balance != 1500 {
		t.Errorf("Expected balance 1500, got %d", updated.Balance)
	}
}

func TestIncrementNonce(t *testing.T) {
	db := setupTestDB()
	service := NewAccountService(db)

	account := &models.Account{
		AccountID: "test_account_4",
		Balance:   1000,
		Nonce:     0,
	}
	service.CreateAccount(account)

	err := service.IncrementNonce("test_account_4")
	if err != nil {
		t.Fatalf("Failed to increment nonce: %v", err)
	}

	retrieved, _ := service.GetAccount("test_account_4")
	if retrieved.Nonce != 1 {
		t.Errorf("Expected nonce 1, got %d", retrieved.Nonce)
	}
}

func TestValidateNonce(t *testing.T) {
	db := setupTestDB()
	service := NewAccountService(db)

	account := &models.Account{
		AccountID: "test_account_5",
		Balance:   1000,
		Nonce:     5,
	}
	service.CreateAccount(account)

	isValid := service.ValidateNonce("test_account_5", 5)
	if !isValid {
		t.Error("Expected nonce validation to pass")
	}

	isValid = service.ValidateNonce("test_account_5", 6)
	if isValid {
		t.Error("Expected nonce validation to fail")
	}
}

func TestDeleteAccount(t *testing.T) {
	db := setupTestDB()
	service := NewAccountService(db)

	account := &models.Account{
		AccountID: "test_account_6",
		Balance:   1000,
	}
	service.CreateAccount(account)

	err := service.DeleteAccount("test_account_6")
	if err != nil {
		t.Fatalf("Failed to delete account: %v", err)
	}

	_, err = service.GetAccount("test_account_6")
	if err == nil {
		t.Error("Expected account to be deleted, but it still exists")
	}
}
