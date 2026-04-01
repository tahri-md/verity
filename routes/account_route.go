package routes

import (
	"net/http"
	"gin-minimal/models"
	"gin-minimal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterAccountRoutes(router *gin.Engine, db *gorm.DB) {
	accountService := services.NewAccountService(db)

	// Create account
	router.POST("/accounts", func(c *gin.Context) {
		var account models.Account
		if err := c.ShouldBindJSON(&account); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		createdAccount, err := accountService.CreateAccount(&account)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, createdAccount)
	})

	// Get account by ID
	router.GET("/accounts/:account_id", func(c *gin.Context) {
		accountID := c.Param("account_id")
		account, err := accountService.GetAccount(accountID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, account)
	})

	// Get all accounts
	router.GET("/accounts", func(c *gin.Context) {
		accounts, err := accountService.GetAllAccounts()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, accounts)
	})

	// Update balance
	router.PUT("/accounts/:account_id/balance", func(c *gin.Context) {
		accountID := c.Param("account_id")
		var req struct {
			Amount int64 `json:"amount"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		updatedAccount, err := accountService.UpdateBalance(accountID, req.Amount)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, updatedAccount)
	})

	// Delete account
	router.DELETE("/accounts/:account_id", func(c *gin.Context) {
		accountID := c.Param("account_id")
		if err := accountService.DeleteAccount(accountID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "account deleted"})
	})
}
