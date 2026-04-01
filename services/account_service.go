package services

import (
	"errors"
	"gin-minimal/models"
	"gorm.io/gorm"
)

type AccountService struct {
	db *gorm.DB
}

func NewAccountService(db *gorm.DB) *AccountService {
	return &AccountService{db: db}
}

// CreateAccount creates a new account
func (s *AccountService) CreateAccount(account *models.Account) (*models.Account, error) {
	// Check if account already exists
	var existing models.Account
	if err := s.db.First(&existing, "account_id = ?", account.AccountID).Error; err == nil {
		return nil, errors.New("account already exists")
	}

	// Set default values
	if account.Balance == 0 {
		account.Balance = 0 // Can be initialized to a default amount
	}
	account.Nonce = 0

	if err := s.db.Create(account).Error; err != nil {
		return nil, err
	}
	return account, nil
}

// GetAccount retrieves an account by ID
func (s *AccountService) GetAccount(accountID string) (*models.Account, error) {
	var account models.Account
	if err := s.db.First(&account, "account_id = ?", accountID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("account not found")
		}
		return nil, err
	}
	return &account, nil
}

// GetAllAccounts retrieves all accounts
func (s *AccountService) GetAllAccounts() ([]models.Account, error) {
	var accounts []models.Account
	if err := s.db.Find(&accounts).Error; err != nil {
		return nil, err
	}
	return accounts, nil
}

// UpdateBalance updates an account's balance
func (s *AccountService) UpdateBalance(accountID string, amount int64) (*models.Account, error) {
	account, err := s.GetAccount(accountID)
	if err != nil {
		return nil, err
	}

	account.Balance += amount
	if account.Balance < 0 {
		return nil, errors.New("insufficient balance")
	}

	if err := s.db.Save(account).Error; err != nil {
		return nil, err
	}
	return account, nil
}

// IncrementNonce increments the nonce for replay protection
func (s *AccountService) IncrementNonce(accountID string) error {
	account, err := s.GetAccount(accountID)
	if err != nil {
		return err
	}

	account.Nonce++
	if err := s.db.Save(account).Error; err != nil {
		return err
	}
	return nil
}

// ValidateNonce checks if the provided nonce is the next expected nonce
func (s *AccountService) ValidateNonce(accountID string, nonce uint64) bool {
	account, err := s.GetAccount(accountID)
	if err != nil {
		return false
	}
	return account.Nonce == nonce
}

// DeleteAccount deletes an account
func (s *AccountService) DeleteAccount(accountID string) error {
	if err := s.db.Delete(&models.Account{}, "account_id = ?", accountID).Error; err != nil {
		return err
	}
	return nil
}
