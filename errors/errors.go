package errors

import "fmt"

// ErrorType defines different error categories
type ErrorType string

const (
	ErrValidation ErrorType = "VALIDATION_ERROR"
	ErrNotFound   ErrorType = "NOT_FOUND_ERROR"
	ErrUnauthorized ErrorType = "UNAUTHORIZED_ERROR"
	ErrForbidden  ErrorType = "FORBIDDEN_ERROR"
	ErrConflict   ErrorType = "CONFLICT_ERROR"
	ErrInternal   ErrorType = "INTERNAL_ERROR"
	ErrCrypto     ErrorType = "CRYPTO_ERROR"
	ErrDatabase   ErrorType = "DATABASE_ERROR"
)

// AppError represents an application-specific error
type AppError struct {
	Type       ErrorType
	Message    string
	StatusCode int
	Details    string
}

// Error implements the error interface
func (e *AppError) Error() string {
	if e.Details != "" {
		return fmt.Sprintf("[%s] %s: %s", e.Type, e.Message, e.Details)
	}
	return fmt.Sprintf("[%s] %s", e.Type, e.Message)
}

// NewValidationError creates a validation error
func NewValidationError(message, details string) *AppError {
	return &AppError{
		Type:       ErrValidation,
		Message:    message,
		StatusCode: 400,
		Details:    details,
	}
}

// NewNotFoundError creates a not found error
func NewNotFoundError(message, details string) *AppError {
	return &AppError{
		Type:       ErrNotFound,
		Message:    message,
		StatusCode: 404,
		Details:    details,
	}
}

// NewUnauthorizedError creates an unauthorized error
func NewUnauthorizedError(message, details string) *AppError {
	return &AppError{
		Type:       ErrUnauthorized,
		Message:    message,
		StatusCode: 401,
		Details:    details,
	}
}

// NewForbiddenError creates a forbidden error
func NewForbiddenError(message, details string) *AppError {
	return &AppError{
		Type:       ErrForbidden,
		Message:    message,
		StatusCode: 403,
		Details:    details,
	}
}

// NewConflictError creates a conflict error
func NewConflictError(message, details string) *AppError {
	return &AppError{
		Type:       ErrConflict,
		Message:    message,
		StatusCode: 409,
		Details:    details,
	}
}

// NewInternalError creates an internal server error
func NewInternalError(message, details string) *AppError {
	return &AppError{
		Type:       ErrInternal,
		Message:    message,
		StatusCode: 500,
		Details:    details,
	}
}

// NewCryptoError creates a cryptography error
func NewCryptoError(message, details string) *AppError {
	return &AppError{
		Type:       ErrCrypto,
		Message:    message,
		StatusCode: 400,
		Details:    details,
	}
}

// NewDatabaseError creates a database error
func NewDatabaseError(message, details string) *AppError {
	return &AppError{
		Type:       ErrDatabase,
		Message:    message,
		StatusCode: 500,
		Details:    details,
	}
}

// IsAppError checks if an error is an AppError
func IsAppError(err error) bool {
	_, ok := err.(*AppError)
	return ok
}

// GetAppError extracts AppError from error, or returns a generic internal error
func GetAppError(err error) *AppError {
	if appErr, ok := err.(*AppError); ok {
		return appErr
	}
	return NewInternalError("An error occurred", err.Error())
}
