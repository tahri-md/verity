package services

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"gin-minimal/models"
	"gorm.io/gorm"
	"golang.org/x/crypto/bcrypt"
	"regexp"
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

// SignupAccount creates a new account with email and password (for user registration)
func (s *AccountService) SignupAccount(email, name, password string) (*models.Account, error) {
	// Validate email format
	emailRegex := `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
	matched, _ := regexp.MatchString(emailRegex, email)
	if !matched {
		return nil, errors.New("invalid email format")
	}

	// Check if email already exists
	var existing models.Account
	if err := s.db.First(&existing, "email = ?", email).Error; err == nil {
		return nil, errors.New("email already registered")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	// Validate password  strength
	if len(password) < 8 {
		return nil, errors.New("password must be at least 8 characters")
	}

	// Hash password using bcrypt
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// Generate unique account ID
	accountID, err := generateAccountID()
	if err != nil {
		return nil, err
	}

	// Generate ECDSA key pair for blockchain operations
	publicKeyHex, err := generatePublicKey()
	if err != nil {
		return nil, errors.New("failed to generate cryptographic keys")
	}

	// Convert public key hex to bytes
	publicKeyBytes, err := hex.DecodeString(publicKeyHex)
	if err != nil {
		return nil, errors.New("failed to encode public key")
	}

	account := &models.Account{
		AccountID: accountID,
		Email:     email,
		Name:      name,
		Password:  string(hashedPassword),
		Balance:   0,
		Nonce:     0,
		PublicKey: publicKeyBytes,
	}

	if err := s.db.Create(account).Error; err != nil {
		return nil, err
	}

	// Return account without password field for security
	account.Password = ""
	return account, nil
}

// LoginAccount authenticates a user with email and password
func (s *AccountService) LoginAccount(email, password string) (*models.Account, error) {
	var account models.Account
	if err := s.db.First(&account, "email = ?", email).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("invalid email or password")
		}
		return nil, err
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(account.Password), []byte(password)); err != nil {
		return nil, errors.New("invalid email or password")
	}

	// Return account without password
	account.Password = ""
	return &account, nil
}

// GetAccountByEmail retrieves an account by email
func (s *AccountService) GetAccountByEmail(email string) (*models.Account, error) {
	var account models.Account
	if err := s.db.First(&account, "email = ?", email).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("account not found")
		}
		return nil, err
	}
	account.Password = ""
	return &account, nil
}

// generateAccountID creates a unique account ID
func generateAccountID() (string, error) {
	b := make([]byte, 8)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return "verity_" + hex.EncodeToString(b), nil
}

// generatePublicKey creates an ECDSA public key for the account
func generatePublicKey() (string, error) {
	privateKey, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		return "", err
	}

	// Encode public key as hex
	pubKeyBytes := elliptic.Marshal(elliptic.P256(), privateKey.PublicKey.X, privateKey.PublicKey.Y)
	return hex.EncodeToString(pubKeyBytes), nil
}
