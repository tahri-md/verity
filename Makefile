.PHONY: help build run test clean docker-up docker-down docs install-deps fmt lint

help:
	@echo "Verity - Blockchain Verification System"
	@echo ""
	@echo "Available targets:"
	@echo "  make install-deps    - Install Go dependencies"
	@echo "  make build           - Build the application"
	@echo "  make run             - Run the application"
	@echo "  make test            - Run all tests"
	@echo "  make test-coverage   - Run tests with coverage report"
	@echo "  make test-verbose    - Run tests with verbose output"
	@echo "  make clean           - Clean build artifacts"
	@echo "  make docker-up       - Start Docker containers (PostgreSQL, Redis)"
	@echo "  make docker-down     - Stop Docker containers"
	@echo "  make docker-logs     - Show Docker container logs"
	@echo "  make fmt             - Format code with gofmt"
	@echo "  make lint            - Run linter (golangci-lint)"
	@echo "  make vet             - Run go vet"
	@echo "  make dev             - Development mode (auto-reload on file changes)"
	@echo "  make docs            - Generate API documentation"

install-deps:
	@echo "Installing dependencies..."
	go mod download
	go mod tidy

build:
	@echo "Building application..."
	go build -v -o bin/verity

run: build
	@echo "Running application..."
	./bin/verity

test:
	@echo "Running tests..."
	go test -race -timeout 30s ./...

test-coverage:
	@echo "Running tests with coverage..."
	go test -race -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: coverage.html"

test-verbose:
	@echo "Running verbose tests..."
	go test -race -v -timeout 30s ./...

test-account:
	@echo "Running account service tests..."
	go test -v ./services -run TestAccount

test-transaction:
	@echo "Running transaction service tests..."
	go test -v ./services -run TestTransaction

test-crypto:
	@echo "Running crypto tests..."
	go test -v ./internal/crypto

test-validators:
	@echo "Running validator tests..."
	go test -v ./validators

test-routes:
	@echo "Running route integration tests..."
	go test -v ./routes

clean:
	@echo "Cleaning up..."
	rm -rf bin/
	rm -f coverage.out coverage.html
	go clean

docker-up:
	@echo "Starting Docker services..."
	docker-compose up -d
	@echo "Services started. PostgreSQL: localhost:5432, Redis: localhost:6379"

docker-down:
	@echo "Stopping Docker services..."
	docker-compose down

docker-logs:
	@echo "Showing Docker logs..."
	docker-compose logs -f

docker-clean:
	@echo "Removing Docker containers and volumes..."
	docker-compose down -v

fmt:
	@echo "Formatting code..."
	go fmt ./...

lint:
	@echo "Running linter..."
	@which golangci-lint > /dev/null || (echo "golangci-lint not found. Install it with: curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b \$$(go env GOPATH)/bin" && exit 1)
	golangci-lint run

vet:
	@echo "Running go vet..."
	go vet ./...

dev:
	@echo "Development mode - watching for changes..."
	@which air > /dev/null || (echo "air not found. Install it with: go install github.com/cosmtrek/air@latest" && exit 1)
	air

docs:
	@echo "Generating API documentation..."
	@which swag > /dev/null || (echo "swag not found. Install it with: go install github.com/swaggo/swag/cmd/swag@latest" && exit 1)
	swag init
	@echo "API docs generated in /docs"

bench:
	@echo "Running benchmarks..."
	go test -bench=. -benchmem ./...

deps-update:
	@echo "Updating dependencies..."
	go get -u ./...
	go mod tidy

security-check:
	@echo "Running security check..."
	@which gosec > /dev/null || (echo "gosec not found. Install it with: go install github.com/securego/gosec/v2/cmd/gosec@latest" && exit 1)
	gosec ./...

precommit: fmt vet test lint
	@echo "Pre-commit checks passed!"

.DEFAULT_GOAL := help
