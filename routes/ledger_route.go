package routes

import (
	"net/http"
	"strconv"
	"gin-minimal/models"
	"gin-minimal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterLedgerRoutes(router *gin.Engine, db *gorm.DB) {
	acctService := services.NewAccountService(db)
	ledgerService := services.NewLedgerService(db, acctService)

	// Create or update ledger state
	router.POST("/api/v1/ledger/states", func(c *gin.Context) {
		var state models.LedgerState
		if err := c.ShouldBindJSON(&state); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		createdState, err := ledgerService.CreateOrUpdateLedgerState(&state)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, createdState)
	})

	// Get ledger state by hash
	router.GET("/api/v1/ledger/states/:state_hash", func(c *gin.Context) {
		stateHash := c.Param("state_hash")
		state, err := ledgerService.GetLedgerStateByHash(stateHash)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, state)
	})

	// Get ledger state by block number
	router.GET("/api/v1/ledger/blocks/:block_number", func(c *gin.Context) {
		blockNumberStr := c.Param("block_number")
		blockNumber, err := strconv.ParseUint(blockNumberStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid block number"})
			return
		}

		state, err := ledgerService.GetLedgerStateByBlockNumber(blockNumber)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, state)
	})

	// Get latest ledger state
	router.GET("/api/v1/ledger/latest", func(c *gin.Context) {
		state, err := ledgerService.GetLatestLedgerState()
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, state)
	})

	// Get all ledger states with pagination
	router.GET("/api/v1/ledger/states", func(c *gin.Context) {
		limitStr := c.DefaultQuery("limit", "10")
		offsetStr := c.DefaultQuery("offset", "0")

		limit, err := strconv.Atoi(limitStr)
		if err != nil || limit <= 0 {
			limit = 10
		}

		offset, err := strconv.Atoi(offsetStr)
		if err != nil || offset < 0 {
			offset = 0
		}

		states, total, err := ledgerService.GetAllLedgerStates(limit, offset)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"total":  total,
			"limit":  limit,
			"offset": offset,
			"data":   states,
		})
	})

	// Verify ledger state integrity
	router.POST("/api/v1/ledger/verify", func(c *gin.Context) {
		var req struct {
			StateHash string `json:"state_hash"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		isValid, err := ledgerService.VerifyLedgerIntegrity(req.StateHash)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"state_hash": req.StateHash,
			"is_valid":   isValid,
		})
	})
}
