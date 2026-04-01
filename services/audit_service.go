package services

import (
	"errors"
	"gin-minimal/models"
	"time"
	"gorm.io/gorm"
)

type AuditService struct {
	db *gorm.DB
}

func NewAuditService(db *gorm.DB) *AuditService {
	return &AuditService{db: db}
}

// LogEvent creates a new audit event
func (s *AuditService) LogEvent(event *models.AuditEvent) (*models.AuditEvent, error) {
	if event.EventType == "" {
		return nil, errors.New("event type is required")
	}

	event.Timestamp = time.Now()

	if err := s.db.Create(event).Error; err != nil {
		return nil, err
	}
	return event, nil
}

// GetAuditEventsByAccount retrieves all audit events for a specific account
func (s *AuditService) GetAuditEventsByAccount(accountID string) ([]models.AuditEvent, error) {
	var events []models.AuditEvent
	if err := s.db.Where("account_id = ?", accountID).
		Order("timestamp DESC").
		Find(&events).Error; err != nil {
		return nil, err
	}
	return events, nil
}

// GetAuditEventsByType retrieves all audit events of a specific type
func (s *AuditService) GetAuditEventsByType(eventType string) ([]models.AuditEvent, error) {
	var events []models.AuditEvent
	if err := s.db.Where("event_type = ?", eventType).
		Order("timestamp DESC").
		Find(&events).Error; err != nil {
		return nil, err
	}
	return events, nil
}

// GetAllAuditEvents retrieves all audit events
func (s *AuditService) GetAllAuditEvents(limit int, offset int) ([]models.AuditEvent, int64, error) {
	var events []models.AuditEvent
	var total int64

	// Get total count
	if err := s.db.Model(&models.AuditEvent{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results
	if err := s.db.Order("timestamp DESC").
		Limit(limit).
		Offset(offset).
		Find(&events).Error; err != nil {
		return nil, 0, err
	}

	return events, total, nil
}

// GetAuditEventByID retrieves an audit event by ID
func (s *AuditService) GetAuditEventByID(eventID string) (*models.AuditEvent, error) {
	var event models.AuditEvent
	if err := s.db.First(&event, "event_id = ?", eventID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("audit event not found")
		}
		return nil, err
	}
	return &event, nil
}

// GetAuditEventsByDateRange retrieves audit events within a date range
func (s *AuditService) GetAuditEventsByDateRange(startTime, endTime time.Time) ([]models.AuditEvent, error) {
	var events []models.AuditEvent
	if err := s.db.Where("timestamp BETWEEN ? AND ?", startTime, endTime).
		Order("timestamp DESC").
		Find(&events).Error; err != nil {
		return nil, err
	}
	return events, nil
}

// DeleteOldAuditEvents deletes audit events older than a specified duration
func (s *AuditService) DeleteOldAuditEvents(days int) error {
	cutoffTime := time.Now().AddDate(0, 0, -days)
	if err := s.db.Where("timestamp < ?", cutoffTime).
		Delete(&models.AuditEvent{}).Error; err != nil {
		return err
	}
	return nil
}

// LogTransactionEvent logs an audit event for a transaction
func (s *AuditService) LogTransactionEvent(accountID string, txnID string, action string, details string) (*models.AuditEvent, error) {
	event := &models.AuditEvent{
		EventID:   txnID, // Use transaction ID as event ID
		AccountID: accountID,
		EventType: "transaction",
		Action:    action,
		Details:   details,
	}
	return s.LogEvent(event)
}

// LogBlockEvent logs an audit event for a block
func (s *AuditService) LogBlockEvent(blockNumber uint64, action string, details string) (*models.AuditEvent, error) {
	event := &models.AuditEvent{
		EventID:   "block_" + string(rune(blockNumber)),
		AccountID: "",
		EventType: "block",
		Action:    action,
		Details:   details,
	}
	return s.LogEvent(event)
}

// LogAuthEvent logs an audit event for authentication
func (s *AuditService) LogAuthEvent(accountID string, action string, ipAddress string) (*models.AuditEvent, error) {
	event := &models.AuditEvent{
		EventID:   accountID + "_" + action,
		AccountID: accountID,
		EventType: "authentication",
		Action:    action,
		Details:   "IP: " + ipAddress,
	}
	return s.LogEvent(event)
}
