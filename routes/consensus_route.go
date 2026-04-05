package routes

import (
	"net/http"
	"strconv"
	"gin-minimal/models"
	"gin-minimal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterConsensusRoutes(router *gin.Engine, db *gorm.DB) {
	consensusService := services.NewConsensusService(db)

	// Get all consensus records
	router.GET("/api/v1/consensus", func(c *gin.Context) {
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

		states, total, err := consensusService.GetAllConsensusStates(limit, offset)
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

	// Create consensus state
	router.POST("/consensus", func(c *gin.Context) {
		var state models.ConsensusState
		if err := c.ShouldBindJSON(&state); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		createdState, err := consensusService.CreateConsensusState(&state)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, createdState)
	})

	// Get consensus state for a block
	router.GET("/consensus/:block_number", func(c *gin.Context) {
		blockNumberStr := c.Param("block_number")
		blockNumber, err := strconv.ParseUint(blockNumberStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid block number"})
			return
		}

		state, err := consensusService.GetConsensusState(blockNumber)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, state)
	})

	// Register vote
	router.POST("/consensus/:block_number/vote", func(c *gin.Context) {
		blockNumberStr := c.Param("block_number")
		blockNumber, err := strconv.ParseUint(blockNumberStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid block number"})
			return
		}

		var req struct {
			ValidatorID string `json:"validator_id"`
			Vote        string `json:"vote"` // yes or no
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := consensusService.RegisterVote(blockNumber, req.ValidatorID, req.Vote); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "vote registered"})
	})

	// Elect leader
	router.POST("/consensus/:block_number/elect-leader", func(c *gin.Context) {
		blockNumberStr := c.Param("block_number")
		blockNumber, err := strconv.ParseUint(blockNumberStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid block number"})
			return
		}

		var req struct {
			Validators []string `json:"validators"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		leader, err := consensusService.ElectLeader(blockNumber, req.Validators)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"block_number": blockNumber,
			"leader":       leader,
		})
	})

	// Get voting status
	router.GET("/consensus/:block_number/status", func(c *gin.Context) {
		blockNumberStr := c.Param("block_number")
		blockNumber, err := strconv.ParseUint(blockNumberStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid block number"})
			return
		}

		state, err := consensusService.GetVotingStatus(blockNumber)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"block_number": blockNumber,
			"yes_votes":    state.YesVotes,
			"no_votes":     state.NoVotes,
			"leader":       state.Leader,
			"is_finalized": state.IsFinalized,
		})
	})

	// Finalize block
	router.POST("/consensus/:block_number/finalize", func(c *gin.Context) {
		blockNumberStr := c.Param("block_number")
		blockNumber, err := strconv.ParseUint(blockNumberStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid block number"})
			return
		}

		if err := consensusService.FinalizeBlock(blockNumber); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"block_number": blockNumber,
			"finalized":    true,
		})
	})

	// Check if block is finalized
	router.GET("/consensus/:block_number/is-finalized", func(c *gin.Context) {
		blockNumberStr := c.Param("block_number")
		blockNumber, err := strconv.ParseUint(blockNumberStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid block number"})
			return
		}

		isFinalized, err := consensusService.IsBlockFinalized(blockNumber)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"block_number": blockNumber,
			"is_finalized": isFinalized,
		})
	})

	// Get latest consensus state
	router.GET("/consensus/latest", func(c *gin.Context) {
		state, err := consensusService.GetLatestConsensusState()
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, state)
	})
}
