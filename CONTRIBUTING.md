# Contributing to Verity

Thank you for your interest in contributing to Verity! This document outlines guidelines and procedures for contributing.

## Code of Conduct

- Be respectful and constructive in all interactions
- Follow the principle of "assume good intent"
- Focus on the code, not the person
- Help create a welcoming environment for all contributors

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/verity.git
   cd verity
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Set up development environment**:
   ```bash
   make install-deps
   make docker-up
   ```

## Development Workflow

### Running Tests
```bash
# Run all tests
make test

# Run with coverage
make test-coverage

# Run specific package tests
make test-account
make test-crypto
make test-validators
```

### Code Quality
```bash
# Format code
make fmt

# Run linter
make lint

# Run vet
make vet

# Pre-commit checks
make precommit
```

### Building & Running
```bash
# Build
make build

# Run
make run

# Development mode with auto-reload
make dev
```

## Commit Guidelines

Follow conventional commits format:

```
feat: add new feature
fix: fix bug in module
docs: update documentation
test: add unit tests
refactor: restructure code
perf: improve performance
chore: update dependencies
```

Examples:
```bash
git commit -m "feat: implement user authentication with JWT"
git commit -m "fix: resolve race condition in transaction service"
git commit -m "test: add comprehensive unit tests for crypto module"
git commit -m "docs: update API documentation with examples"
```

## Pull Request Process

1. **Ensure tests pass**:
   ```bash
   make test
   ```

2. **Update documentation** if needed:
   - Update README.md for new features
   - Update API documentation
   - Add code comments for complex logic

3. **Create descriptive PR title** following conventional commits

4. **In PR description, explain**:
   - What changes were made
   - Why the changes were made
   - How to test the changes
   - Related issues (use `Fixes #issue-number`)

5. **Request review** from maintainers

6. **Address review comments** and update PR

## Code Standards

### Go Code Style
- Follow Go language conventions: https://golang.org/doc/effective_go
- Use `go fmt` for formatting
- Keep functions focused and short
- Write clear, meaningful variable names

### Package Structure
- Services: Business logic and data operations
- Routes: HTTP handlers and API endpoints
- Models: Data structures and database models
- Middleware: Request/response processing
- Utils/Helpers: Shared utility functions

### Error Handling
- Use custom error types from `errors` package
- Provide meaningful error messages
- Always check and handle errors
- Return specific error types for different scenarios

### Testing Requirements
- Write tests for new features
- Maintain or improve code coverage
- Use table-driven tests for multiple cases
- Mock external dependencies

Example test structure:
```go
func TestFeature(t *testing.T) {
    tests := []struct {
        name    string
        input   interface{}
        want    interface{}
        wantErr bool
    }{
        {
            name:  "valid input",
            input: "test",
            want:  "expected",
        },
        {
            name:    "invalid input",
            input:   "",
            wantErr: true,
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            // Test implementation
        })
    }
}
```

## Documentation

- **Code comments**: Write clear comments for exported functions and complex logic
- **README**: Update README.md for new features
- **API docs**: Document new endpoints with examples
- **Commit messages**: Write descriptive commit messages

## Areas for Contribution

### High Priority
- [ ] Performance optimization
- [ ] Security enhancements
- [ ] Bug fixes
- [ ] Test coverage improvements

### Medium Priority
- [ ] Documentation improvements
- [ ] Code refactoring
- [ ] New features
- [ ] Error handling improvements

### Nice to Have
- [ ] Code style improvements
- [ ] Dependency updates
- [ ] Infrastructure improvements
- [ ] Tool integrations

## Reporting Bugs

1. **Check existing issues** to avoid duplicates
2. **Create detailed bug report** including:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (Go version, OS, etc.)
   - Error messages and logs
3. **Provide code examples** if applicable

## Requesting Features

1. **Check existing issues** and discussions
2. **Create feature request** with:
   - Clear use case
   - Proposed solution
   - Alternative approaches considered
   - Expected benefits
3. **Be open to discussion** on implementation details

## Licensing

By contributing to Verity, you agree that your contributions will be licensed under its MIT License.

## Questions?

- Open a discussion on GitHub
- Check existing documentation
- Review pull requests and code
- Ask in code comments on issues

## Review Process

All submissions go through:
1. **Automated checks**: Tests, linting, formatting
2. **Code review**: At least one maintainer review
3. **Security review**: For security-related changes
4. **Integration testing**: Before merge

## Recognition

We appreciate all contributions! Contributors will be:
- Acknowledged in commit messages
- Listed in project CONTRIBUTORS file
- Credited in release notes

Thank you for helping make Verity better! 🚀
