package routes

import (
	"net/http"
	"strconv"
	"gin-minimal/models"
	"gin-minimal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterBlockRoutes(router *gin.Engine, db *gorm.DB) {
	txnService := services.NewTransactionService(db)
	acctService := services.NewAccountService(db)
	blockService := services.NewBlockService(db, txnService, acctService)

	// Create block
	router.POST("/blocks", func(c *gin.Context) {
		var block models.Block
		if err := c.ShouldBindJSON(&block); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		createdBlock, err := blockService.CreateBlock(&block)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, createdBlock)
	})

	// Get block by number
	router.GET("/blocks/:block_number", func(c *gin.Context) {
		blockNumberStr := c.Param("block_number")
		blockNumber, err := strconv.ParseUint(blockNumberStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid block number"})
			return
		}

		block, err := blockService.GetBlock(blockNumber)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, block)
	})

	// Get all blocks
	router.GET("/blocks", func(c *gin.Context) {
		blocks, err := blockService.GetAllBlocks()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, blocks)
	})

	// Get block by hash
	router.GET("/blocks/hash/:block_hash", func(c *gin.Context) {
		blockHash := c.Param("block_hash")
		block, err := blockService.GetBlockByHash(blockHash)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, block)
	})

	// Validate block
	router.POST("/blocks/:block_number/validate", func(c *gin.Context) {
		blockNumberStr := c.Param("block_number")
		blockNumber, err := strconv.ParseUint(blockNumberStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid block number"})
			return
		}

		block, err := blockService.GetBlock(blockNumber)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}

		isValid, err := blockService.ValidateBlock(block)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"block_number": blockNumber,
			"is_valid":     isValid,
		})
	})

	// Set block finality
	router.PUT("/blocks/:block_number/finality", func(c *gin.Context) {
		blockNumberStr := c.Param("block_number")
		blockNumber, err := strconv.ParseUint(blockNumberStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid block number"})
			return
		}

		var req struct {
			Finality string `json:"finality"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		updatedBlock, err := blockService.SetBlockFinality(blockNumber, req.Finality)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, updatedBlock)
	})

	// Get latest block
	router.GET("/blocks/latest", func(c *gin.Context) {
		block, err := blockService.GetLatestBlock()
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, block)
	})
}
