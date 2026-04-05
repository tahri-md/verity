package validators

import (
	"strings"
	"testing"
)

func TestValidateAccountID(t *testing.T) {
	tests := []struct {
		accountID string
		shouldErr bool
	}{
		{"valid_account_1", false},
		{"account-2", false},
		{"acc", false},
		{"a", true}, // Too short
		{"", true},  // Empty
		{"account@invalid", true}, // Invalid character
		{"account with spaces", true}, // Invalid character
	}

	for _, test := range tests {
		err := ValidateAccountID(test.accountID)
		if (err != nil) != test.shouldErr {
			t.Errorf("ValidateAccountID(%s) - expected error: %v, got: %v", test.accountID, test.shouldErr, err != nil)
		}
	}
}

func TestValidateAmount(t *testing.T) {
	tests := []struct {
		amount   int64
		shouldErr bool
	}{
		{100, false},
		{1000000, false},
		{0, true},
		{-100, true},
		{9999999999999999, false},
		{10000000000000000, true}, // Exceeds max
	}

	for _, test := range tests {
		err := ValidateAmount(test.amount)
		if (err != nil) != test.shouldErr {
			t.Errorf("ValidateAmount(%d) - expected error: %v, got: %v", test.amount, test.shouldErr, err != nil)
		}
	}
}

func TestValidateBalance(t *testing.T) {
	tests := []struct {
		balance   int64
		shouldErr bool
	}{
		{0, false},
		{1000, false},
		{-1, true},
		{-100, true},
	}

	for _, test := range tests {
		err := ValidateBalance(test.balance)
		if (err != nil) != test.shouldErr {
			t.Errorf("ValidateBalance(%d) - expected error: %v, got: %v", test.balance, test.shouldErr, err != nil)
		}
	}
}

func TestValidateNonce(t *testing.T) {
	tests := []struct {
		nonce     uint64
		shouldErr bool
	}{
		{0, false},
		{1, false},
		{999999, false},
	}

	for _, test := range tests {
		err := ValidateNonce(test.nonce)
		if (err != nil) != test.shouldErr {
			t.Errorf("ValidateNonce(%d) - expected error: %v, got: %v", test.nonce, test.shouldErr, err != nil)
		}
	}
}

func TestValidateBlockNumber(t *testing.T) {
	tests := []struct {
		blockNumber uint64
		shouldErr   bool
	}{
		{1, false},
		{1000, false},
		{0, true},
	}

	for _, test := range tests {
		err := ValidateBlockNumber(test.blockNumber)
		if (err != nil) != test.shouldErr {
			t.Errorf("ValidateBlockNumber(%d) - expected error: %v, got: %v", test.blockNumber, test.shouldErr, err != nil)
		}
	}
}

func TestValidateTransaction(t *testing.T) {
	validPubKey := "04" + strings.Repeat("0", 130)

	tests := []struct {
		from        string
		to          string
		amount      int64
		pubKey      string
		shouldErr   bool
	}{
		{"account_1", "account_2", 100, validPubKey, false},
		{"account_1", "account_1", 100, validPubKey, true}, // Same from and to
		{"", "account_2", 100, validPubKey, true},          // Empty from
		{"account_1", "account_2", 0, validPubKey, true},  // Zero amount
	}

	for _, test := range tests {
		err := ValidateTransaction(test.from, test.to, test.amount, test.pubKey)
		if (err != nil) != test.shouldErr {
			t.Errorf("ValidateTransaction - expected error: %v, got: %v", test.shouldErr, err != nil)
		}
	}
}

func TestValidatePaginationParams(t *testing.T) {
	tests := []struct {
		limit         int
		offset        int
		expectedLimit int
		expectedOffset int
	}{
		{10, 0, 10, 0},
		{0, 0, 10, 0}, // Default limit
		{2000, 0, 1000, 0}, // Capped limit
		{20, -5, 20, 0}, // Negative offset corrected
	}

	for _, test := range tests {
		limit, offset, _ := ValidatePaginationParams(test.limit, test.offset)
		if limit != test.expectedLimit || offset != test.expectedOffset {
			t.Errorf("ValidatePaginationParams(%d, %d) - got (%d, %d), expected (%d, %d)",
				test.limit, test.offset, limit, offset, test.expectedLimit, test.expectedOffset)
		}
	}
}
