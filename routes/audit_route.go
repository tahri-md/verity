package routes

import (
	"net/http"
	"strconv"
	"time"
	"gin-minimal/middleware"
	"gin-minimal/models"
	"gin-minimal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterAuditRoutes(router *gin.Engine, db *gorm.DB) {
	auditService := services.NewAuditService(db)

	// Log audit event
	router.POST("/audit/events", middleware.AuthMiddleware(), func(c *gin.Context) {
		var event models.AuditEvent
		if err := c.ShouldBindJSON(&event); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Get account ID from context
		accountID, err := middleware.GetAccountIDFromContext(c)
		if err != nil {
			event.AccountID = "system"
		} else {
			event.AccountID = accountID
		}

		createdEvent, err := auditService.LogEvent(&event)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, createdEvent)
	})

	// Get audit events for account
	router.GET("/audit/accounts/:account_id/events", func(c *gin.Context) {
		accountID := c.Param("account_id")
		events, err := auditService.GetAuditEventsByAccount(accountID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, events)
	})

	// Get audit events by type
	router.GET("/audit/events/type/:event_type", func(c *gin.Context) {
		eventType := c.Param("event_type")
		events, err := auditService.GetAuditEventsByType(eventType)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, events)
	})

	// Get all audit events (paginated)
	router.GET("/audit/events", func(c *gin.Context) {
		limitStr := c.DefaultQuery("limit", "50")
		offsetStr := c.DefaultQuery("offset", "0")

		limit, err := strconv.Atoi(limitStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid limit"})
			return
		}

		offset, err := strconv.Atoi(offsetStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid offset"})
			return
		}

		events, total, err := auditService.GetAllAuditEvents(limit, offset)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"events": events,
			"total":  total,
			"limit":  limit,
			"offset": offset,
		})
	})

	// Get specific audit event
	router.GET("/audit/events/:event_id", func(c *gin.Context) {
		eventID := c.Param("event_id")
		event, err := auditService.GetAuditEventByID(eventID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, event)
	})

	// Get audit events by date range
	router.GET("/audit/events/range", func(c *gin.Context) {
		startTimeStr := c.Query("start_time")
		endTimeStr := c.Query("end_time")

		startTime, err := time.Parse(time.RFC3339, startTimeStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid start_time format"})
			return
		}

		endTime, err := time.Parse(time.RFC3339, endTimeStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid end_time format"})
			return
		}

		events, err := auditService.GetAuditEventsByDateRange(startTime, endTime)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, events)
	})

	// Delete old audit events (admin only)
	router.DELETE("/audit/events/cleanup", middleware.AuthMiddleware(), middleware.RoleMiddleware("admin"), func(c *gin.Context) {
		daysStr := c.DefaultQuery("days", "90")
		days, err := strconv.Atoi(daysStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid days parameter"})
			return
		}

		if err := auditService.DeleteOldAuditEvents(days); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "old audit events deleted",
			"days":    days,
		})
	})
}
