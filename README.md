# Verity - Blockchain Verification System

A comprehensive Go-based blockchain verification system built with Gin, GORM, and advanced cryptographic features. Verity provides digital signatures, Merkle proofs, consensus mechanisms, and audit trails for secure transaction management.

## Features

### Core Blockchain Components
- **Digital Signatures**: ECDSA P-256 curve for secure transaction signing and verification
- **Merkle Tree**: Efficient proof generation and verification for transaction inclusion
- **Block Management**: Create, validate, and manage blockchain blocks
- **Consensus Protocol**: Voting-based consensus mechanism with leader election
- **Ledger State**: Persistent state management and integrity verification

### Account Management
- Full CRUD operations for accounts
- Balance management with transaction validation
- Nonce-based replay attack protection
- Account-specific audit trails

### Crypto & Security
- ECDSA P-256 key pair generation
- Transaction signing and verification
- SHA-256 hashing
- Merkle proof generation and validation
- Auth middleware with JWT token support

### Audit & Compliance
- Complete audit event logging
- Event tracking by account, type, and date range
- Immutable audit trail
- Configurable retention policies

### Performance & Caching
- Redis integration for caching
- Transaction, account, and block caching layers
- Configurable TTL and expiration

### Input Validation & Error Handling
- Comprehensive input validation
- Type-safe custom error responses
- Detailed error messages for debugging
- Pagination support with validation

## Project Structure

```
verity/
├── main.go                          # Entry point
├── go.mod                           # Go module file
├── docker-compose.yml               # Docker services
├── config/
│   ├── db.go                       # Database initialization
│   └── redis.go                    # Redis configuration
├── middleware/
│   ├── auth_middleware.go          # JWT auth & role-based access
│   └── error_middleware.go         # Error handling middleware
├── models/
│   ├── Account.go                  # Account structure
│   ├── Block.go                    # Block structure
│   ├── Transaction.go              # Transaction structure
│   ├── ConsensusState.go           # Consensus mechanism
│   ├── AuditEvent.go               # Audit logging
│   ├── LedgerState.go              # Ledger state
│   ├── MerkleProof.go              # Merkle proof structure
│   └── ProofNode.go                # Merkle tree node
├── services/
│   ├── account_service.go          # Account business logic
│   ├── block_service.go            # Block operations
│   ├── transaction_service.go      # Transaction handling
│   ├── consensus_service.go        # Consensus logic
│   ├── audit_service.go            # Audit event logging
│   ├── ledger_service.go           # Ledger state management
│   └── *_test.go                   # Service unit tests
├── routes/
│   ├── account_route.go            # Account endpoints
│   ├── block_route.go              # Block endpoints
│   ├── transaction_route.go        # Transaction endpoints
│   ├── auth_route.go               # Authentication endpoints
│   ├── consensus_route.go          # Consensus endpoints
│   ├── audit_route.go              # Audit endpoints
│   ├── ledger_route.go             # Ledger endpoints
│   └── routes_integration_test.go  # Integration tests
├── internal/crypto/
│   ├── merkle.go                   # Crypto utilities
│   └── merkle_test.go              # Crypto tests
├── validators/
│   ├── validators.go               # Input validation
│   └── validators_test.go          # Validator tests
├── cache/
│   └── redis.go                    # Redis client wrapper
└── errors/
    └── errors.go                   # Custom error types
```

## API Endpoints

### Authentication
```
POST   /auth/login                  # Login and get JWT token
POST   /auth/validate               # Validate JWT token
POST   /auth/refresh                # Refresh token
```

### Accounts
```
POST   /accounts                    # Create account
GET    /accounts                    # Get all accounts
GET    /accounts/{account_id}       # Get account by ID
PUT    /accounts/{account_id}/balance  # Update balance
DELETE /accounts/{account_id}       # Delete account
```

### Transactions
```
POST   /api/v1/transactions         # Create transaction
GET    /api/v1/transactions         # Get all transactions
GET    /api/v1/transactions/{id}    # Get transaction by ID
GET    /api/v1/transactions/{id}/proof  # Get Merkle proof
POST   /api/v1/verify/transaction   # Verify transaction
```

### Blocks
```
POST   /blocks                      # Create block
GET    /blocks                      # Get all blocks
GET    /blocks/{block_number}       # Get block by number
GET    /blocks/hash/{block_hash}    # Get block by hash
POST   /blocks/{block_number}/validate  # Validate block
PUT    /blocks/{block_number}/finality  # Set block finality
```

### Consensus
```
POST   /api/v1/consensus/states     # Create consensus state
GET    /api/v1/consensus/states/{block_number}  # Get consensus state
POST   /api/v1/consensus/vote       # Register vote
POST   /api/v1/consensus/elect      # Elect leader
```

### Audit
```
GET    /api/v1/audit/events         # Get all audit events
GET    /api/v1/audit/events/{event_id}  # Get event by ID
GET    /api/v1/audit/accounts/{account_id}  # Get account events
GET    /api/v1/audit/types/{event_type}    # Get events by type
```

### Ledger
```
POST   /api/v1/ledger/states        # Create ledger state
GET    /api/v1/ledger/states        # Get all states (paginated)
GET    /api/v1/ledger/states/{state_hash}  # Get by hash
GET    /api/v1/ledger/blocks/{block_number}  # Get by block
GET    /api/v1/ledger/latest        # Get latest state
POST   /api/v1/ledger/verify        # Verify state integrity
```

## Prerequisites

- Go 1.20+
- PostgreSQL 12+
- Redis 6.0+
- Docker & Docker Compose (optional)

## Environment Setup

### Using Docker Compose

```bash
docker-compose up -d
```

This starts:
- PostgreSQL on `localhost:5432` (user: `postgres`, password: `password`)
- Redis on `localhost:6379`

### Manual Setup

1. Install PostgreSQL and create database:
```sql
CREATE DATABASE verity;
```

2. Install Redis:
```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis
```

## Installation & Running

```bash
# Clone repository
git clone <repo-url>
cd verity

# Install dependencies
go mod download

# Run application
go run main.go

# Server starts on http://localhost:8080
```

## Running Tests

```bash
# Run all tests
go test ./...

# Run with coverage
go test -cover ./...

# Run specific package tests
go test ./services -v
go test ./validators -v
go test ./internal/crypto -v
```

## Example Usage

### 1. Create Account
```bash
curl -X POST http://localhost:8080/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "account_id": "user1",
    "balance": 10000,
    "public_key": "<your-public-key-here>"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "account_id": "user1",
    "role": "user"
  }'
```

### 3. Create Transaction
```bash
curl -X POST http://localhost:8080/api/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "txn_id": "txn_001",
    "from_account": "user1",
    "to_account": "user2",
    "amount": 100,
    "nonce": 1,
    "signature": "<transaction-signature>",
    "public_key": "<sender-public-key>"
  }'
```

### 4. Generate Key Pair (Programmatic)

```go
package main

import (
    "fmt"
    "gin-minimal/internal/crypto"
)

func main() {
    privKey, pubKey, err := crypto.GenerateKeyPair()
    if err != nil {
        panic(err)
    }
    fmt.Printf("Private Key: %s\n", privKey)
    fmt.Printf("Public Key: %s\n", pubKey)
}
```

## Configuration

### Database Configuration
Edit `config/db.go`:
```go
dsn := fmt.Sprintf(
    "host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
    "localhost",
    "postgres",
    "password",
    "verity",
    "5432",
)
```

### Redis Configuration
Edit `main.go`:
```go
redisClient, err := config.InitRedis("localhost:6379")
```

### JWT Configuration
Edit `middleware/auth_middleware.go`:
```go
const JWTSecret = "your-secret-key-change-in-production"
const TokenExpiry = 24 * time.Hour
```

## Error Handling

The system returns standardized error responses:

```json
{
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "amount must be greater than zero",
    "details": "invalid transaction amount"
  }
}
```

Error types:
- `VALIDATION_ERROR` (400)
- `NOT_FOUND_ERROR` (404)
- `UNAUTHORIZED_ERROR` (401)
- `FORBIDDEN_ERROR` (403)
- `CONFLICT_ERROR` (409)
- `INTERNAL_ERROR` (500)
- `CRYPTO_ERROR` (400)
- `DATABASE_ERROR` (500)

## Security Considerations

1. **Private Keys**: Never transmit private keys over the network
2. **JWT Secret**: Change the default JWT secret in production
3. **Database**: Use strong passwords for database credentials
4. **HTTPS**: Always use HTTPS in production
5. **Rate Limiting**: Implement rate limiting for API endpoints
6. **Input Validation**: All inputs are validated before processing

## Performance Tips

1. **Caching**: Use Redis for transaction and account caching
2. **Database Indexes**: Add indexes to frequently queried columns
3. **Batch Operations**: Batch transaction creation for blocks
4. **Connection Pooling**: Configure appropriate connection pool sizes

## License

MIT License

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Support

For issues and questions, please open an Issue on the GitHub repository.

## Roadmap

- [ ] WebSocket support for real-time updates
- [ ] Advanced consensus protocols (PBFT, Tendermint)
- [ ] Sharding and layer 2 solutions
- [ ] GraphQL API support
- [ ] Enhanced monitoring and metrics
- [ ] Smart contract support
