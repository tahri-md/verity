package routes

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"gin-minimal/models"
	"gin-minimal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTestRouter() (*gin.Engine, *gorm.DB) {
	db, _ := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	db.AutoMigrate(
		&models.Transaction{},
		&models.Account{},
		&models.Block{},
		&models.ConsensusState{},
		&models.AuditEvent{},
		&models.LedgerState{},
	)

	router := gin.Default()
	RegisterAuthRoutes(router, db)
	RegisterTransactionRoutes(router, db)
	RegisterAccountRoutes(router, db)
	RegisterBlockRoutes(router, db)
	RegisterConsensusRoutes(router, db)
	RegisterAuditRoutes(router, db)
	RegisterLedgerRoutes(router, db)

	return router, db
}

func TestCreateAccountRoute(t *testing.T) {
	router, _ := setupTestRouter()

	account := models.Account{
		AccountID: "test_account",
		Balance:   1000,
	}

	body, _ := json.Marshal(account)

	req := httptest.NewRequest("POST", "/accounts", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusCreated && w.Code != http.StatusOK {
		t.Errorf("Expected status 201 or 200, got %d", w.Code)
	}
}

func TestGetAccountRoute(t *testing.T) {
	router, db := setupTestRouter()

	// Create account first
	accountService := services.NewAccountService(db)
	accountService.CreateAccount(&models.Account{
		AccountID: "test_account_2",
		Balance:   2000,
	})

	req := httptest.NewRequest("GET", "/accounts/test_account_2", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response models.Account
	_ = json.Unmarshal(w.Body.Bytes(), &response)
	if response.AccountID != "test_account_2" {
		t.Errorf("Expected account ID 'test_account_2', got %s", response.AccountID)
	}
}

func TestGetAllAccountsRoute(t *testing.T) {
	router, db := setupTestRouter()

	accountService := services.NewAccountService(db)
	accountService.CreateAccount(&models.Account{AccountID: "account_1", Balance: 1000})
	accountService.CreateAccount(&models.Account{AccountID: "account_2", Balance: 2000})

	req := httptest.NewRequest("GET", "/accounts", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}
}

func TestCreateTransactionRoute(t *testing.T) {
	router, _ := setupTestRouter()

	transaction := models.Transaction{
		TxnID:       "txn_1",
		FromAccount: "account_1",
		ToAccount:   "account_2",
		Amount:      100,
		Nonce:       1,
		Hash:        "test_hash",
		Status:      "pending",
	}

	body, _ := json.Marshal(transaction)

	req := httptest.NewRequest("POST", "/api/v1/transactions", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusCreated && w.Code != http.StatusOK {
		t.Errorf("Expected status 201 or 200, got %d", w.Code)
	}
}

func TestGetTransactionRoute(t *testing.T) {
	router, db := setupTestRouter()

	txnService := services.NewTransactionService(db)
	txnService.CreateTransaction(&models.Transaction{
		TxnID:       "txn_2",
		FromAccount: "account_1",
		ToAccount:   "account_2",
		Amount:      100,
		Hash:        "test_hash_2",
		Status:      "pending",
	})

	req := httptest.NewRequest("GET", "/api/v1/transactions/txn_2", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}
}

func TestGetAllTransactionsRoute(t *testing.T) {
	router, db := setupTestRouter()

	txnService := services.NewTransactionService(db)
	txnService.CreateTransaction(&models.Transaction{
		TxnID:  "txn_3",
		Hash:   "test_hash_3",
		Status: "pending",
	})
	txnService.CreateTransaction(&models.Transaction{
		TxnID:  "txn_4",
		Hash:   "test_hash_4",
		Status: "pending",
	})

	req := httptest.NewRequest("GET", "/api/v1/transactions", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}
}

func TestAuthLoginRoute(t *testing.T) {
	router, db := setupTestRouter()

	// Create account first
	accountService := services.NewAccountService(db)
	accountService.CreateAccount(&models.Account{
		AccountID: "test_user",
		Balance:   1000,
	})

	loginReq := map[string]string{
		"account_id": "test_user",
		"role":       "user",
	}

	body, _ := json.Marshal(loginReq)

	req := httptest.NewRequest("POST", "/auth/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response map[string]interface{}
	_ = json.Unmarshal(w.Body.Bytes(), &response)
	if _, ok := response["token"]; !ok {
		t.Error("Expected token in response")
	}
}
