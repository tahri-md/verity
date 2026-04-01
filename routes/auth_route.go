package routes

import (
	"net/http"
	"gin-minimal/middleware"
	"gin-minimal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterAuthRoutes(router *gin.Engine, db *gorm.DB) {
	accountService := services.NewAccountService(db)

	// Login/Generate token
	router.POST("/auth/login", func(c *gin.Context) {
		var req struct {
			AccountID string `json:"account_id"`
			Role      string `json:"role"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Verify account exists
		_, err := accountService.GetAccount(req.AccountID)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "account not found"})
			return
		}

		// Generate token
		token, err := middleware.GenerateToken(req.AccountID, req.Role)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"token":      token,
			"account_id": req.AccountID,
			"role":       req.Role,
		})
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
