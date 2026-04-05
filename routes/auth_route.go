package routes

import (
	"encoding/hex"
	"net/http"
	"gin-minimal/middleware"
	"gin-minimal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterAuthRoutes(router *gin.Engine, db *gorm.DB) {
	accountService := services.NewAccountService(db)

	// Signup - Create new account
	router.POST("/api/auth/signup", func(c *gin.Context) {
		var req struct {
			Name     string `json:"name" binding:"required"`
			Email    string `json:"email" binding:"required"`
			Password string `json:"password" binding:"required"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "invalid request data"})
			return
		}

		account, err := accountService.SignupAccount(req.Email, req.Name, req.Password)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message":     "account created successfully",
			"account_id":  account.AccountID,
			"email":       account.Email,
			"name":        account.Name,
			"public_key":  hex.EncodeToString(account.PublicKey),
			"balance":     account.Balance,
			"note":        "Use your account_id and public_key for blockchain operations",
		})
	})

	// Login/Generate token - supports both email/password and account_id/role
	router.POST("/api/auth/login", func(c *gin.Context) {
		var req struct {
			Email     string `json:"email"`
			Password  string `json:"password"`
			AccountID string `json:"account_id"`
			Role      string `json:"role"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "invalid request data"})
			return
		}

		var accountID string

		// Login with email and password
		if req.Email != "" && req.Password != "" {
			account, err := accountService.LoginAccount(req.Email, req.Password)
			if err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{"message": err.Error()})
				return
			}
			accountID = account.AccountID

			// Generate token with default "user" role
			token, err := middleware.GenerateToken(accountID, "user")
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
				return
			}

			c.JSON(http.StatusOK, gin.H{
				"message":    "login successful",
				"token":      token,
				"account_id": accountID,
				"user": gin.H{
					"account_id": accountID,
					"email":      account.Email,
					"name":       account.Name,
					"public_key": hex.EncodeToString(account.PublicKey),
					"balance":    account.Balance,
					"nonce":      account.Nonce,
				},
			})
			return
		}

		// Legacy login with account_id and role
		if req.AccountID != "" && req.Role != "" {
			// Verify account exists
			_, err := accountService.GetAccount(req.AccountID)
			if err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{"message": "account not found"})
				return
			}

			// Generate token
			token, err := middleware.GenerateToken(req.AccountID, req.Role)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
				return
			}

			c.JSON(http.StatusOK, gin.H{
				"message":    "login successful",
				"token":      token,
				"account_id": req.AccountID,
				"role":       req.Role,
			})
			return
		}

		c.JSON(http.StatusBadRequest, gin.H{"message": "provide either (email and password) or (account_id and role)"})
	})

	// Validate token
	router.POST("/auth/validate", func(c *gin.Context) {
		var req struct {
			Token string `json:"token"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		claims, err := middleware.ValidateToken(req.Token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"valid":      true,
			"account_id": claims.AccountID,
			"role":       claims.Role,
			"expires_at": claims.ExpiresAt,
		})
	})

	// Refresh token
	router.POST("/auth/refresh", middleware.AuthMiddleware(), func(c *gin.Context) {
		accountID, err := middleware.GetAccountIDFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		role, err := middleware.GetRoleFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		newToken, err := middleware.GenerateToken(accountID, role)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"token": newToken,
		})
	})
}
