package validators

import (
	"regexp"
	"gin-minimal/errors"
)

// ValidateAccountID validates the account ID format
func ValidateAccountID(accountID string) error {
	if accountID == "" {
		return errors.NewValidationError("account ID is required", "")
	}

	if len(accountID) < 3 || len(accountID) > 100 {
		return errors.NewValidationError("account ID must be between 3 and 100 characters", "")
	}

	// Allow alphanumeric, hyphens, and underscores
	matched, _ := regexp.MatchString(`^[a-zA-Z0-9_-]+$`, accountID)
	if !matched {
		return errors.NewValidationError("account ID contains invalid characters", "allowed: alphanumeric, hyphens, underscores")
	}

	return nil
}

// ValidateAmount validates transaction amount
func ValidateAmount(amount int64) error {
	if amount <= 0 {
		return errors.NewValidationError("amount must be greater than zero", "")
	}

	if amount > 9999999999999999 { // reasonable upper limit
		return errors.NewValidationError("amount exceeds maximum allowed", "")
	}

	return nil
}

// ValidateBalance validates account balance
func ValidateBalance(balance int64) error {
	if balance < 0 {
		return errors.NewValidationError("balance cannot be negative", "")
	}

	return nil
}

// ValidatePublicKey validates the public key format
func ValidatePublicKey(publicKey string) error {
	if publicKey == "" {
		return errors.NewValidationError("public key is required", "")
	}

	if len(publicKey) != 132 { // ECDSA P-256 public key hex length
		return errors.NewValidationError("invalid public key format", "expected 132 character hex string")
	}

	// Check if it's valid hex
	matched, _ := regexp.MatchString(`^[0-9a-fA-F]+$`, publicKey)
	if !matched {
		return errors.NewValidationError("public key must be valid hex", "")
	}

	return nil
}

// ValidateSignature validates the signature format
func ValidateSignature(signature string) error {
	if signature == "" {
		return errors.NewValidationError("signature is required", "")
	}

	// Check if it's valid hex
	matched, _ := regexp.MatchString(`^[0-9a-fA-F]+$`, signature)
	if !matched {
		return errors.NewValidationError("signature must be valid hex", "")
	}

	return nil
}

// ValidateNonce validates the nonce value
func ValidateNonce(nonce uint64) error {
	if nonce < 0 {
		return errors.NewValidationError("nonce cannot be negative", "")
	}

	return nil
}

// ValidateBlockNumber validates the block number
func ValidateBlockNumber(blockNumber uint64) error {
	if blockNumber == 0 {
		return errors.NewValidationError("block number must be greater than zero", "")
	}

	return nil
}

// ValidateTransaction validates a complete transaction
func ValidateTransaction(fromAccount, toAccount string, amount int64, publicKey string) error {
	if err := ValidateAccountID(fromAccount); err != nil {
		return err
	}

	if err := ValidateAccountID(toAccount); err != nil {
		return err
	}

	if fromAccount == toAccount {
		return errors.NewValidationError("from account and to account cannot be the same", "")
	}

	if err := ValidateAmount(amount); err != nil {
		return err
	}

	if err := ValidatePublicKey(publicKey); err != nil {
		return err
	}

	return nil
}

// ValidateEmail validates email format (optional for account creation)
func ValidateEmail(email string) error {
	if email == "" {
		return nil // Optional field
	}

	pattern := `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
	matched, _ := regexp.MatchString(pattern, email)
	if !matched {
		return errors.NewValidationError("invalid email format", "")
	}

	return nil
}

// ValidatePaginationParams validates limit and offset
func ValidatePaginationParams(limit, offset int) (int, int, error) {
	if limit <= 0 {
		limit = 10
	}

	if limit > 1000 {
		limit = 1000 // Cap maximum limit
	}

	if offset < 0 {
		offset = 0
	}

	return limit, offset, nil
}
