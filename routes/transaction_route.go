package routes

import (
	"net/http"

	"gin-minimal/middleware"
	"gin-minimal/models"
	"gin-minimal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterTransactionRoutes(r *gin.Engine, db *gorm.DB) {

	transactionService := services.NewTransactionService(db)

	api := r.Group("/api/v1/transactions")
	api.GET("", func(c *gin.Context) {
		transactions, err := transactionService.GetAllTransactions()
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		c.JSON(200, transactions)
	})
	api.GET("/:id", func(c *gin.Context) {
		id := c.Param("id")
		transaction, err := transactionService.GetTransactionByID(id)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		c.JSON(200, transaction)
	})

	api.GET("/:id/proof", func(c *gin.Context) {
		id := c.Param("id")

		proof, err := transactionService.GetTransactionProof(id)
		if err != nil {
			c.JSON(404, gin.H{"error": err.Error()})
			return
		}

		c.JSON(200, proof)
	})
	r.POST("/api/v1/verify/transaction", func(c *gin.Context) {

		var request struct {
			Transaction models.Transaction `json:"transaction"`
			Proof       []models.ProofNode `json:"proof"`
		}

		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		_, err := transactionService.VerifyTransactionExternally(
			request.Transaction,
			request.Proof,
		)

		if err != nil {
			c.JSON(400, gin.H{
				"valid": false,
				"error": err.Error(),
			})
			return
		}

		c.JSON(200, gin.H{
			"valid": true,
		})
	})

	protected := r.Group("/api/v1/transactions")
	protected.Use(middleware.AuthMiddleware())
	protected.POST("", func(c *gin.Context) {
		var transaction models.Transaction
		if err := c.ShouldBindJSON(&transaction); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		accountID, err := middleware.GetAccountIDFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		// Enforce: the authenticated account is the transaction sender.
		// If the client provided from_account, it must match the JWT.
		if transaction.FromAccount != "" && transaction.FromAccount != accountID {
			c.JSON(http.StatusForbidden, gin.H{"error": "from_account must match authenticated account"})
			return
		}
		transaction.FromAccount = accountID

		created, err := transactionService.CreateTransaction(&transaction)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, created)
	})

}
