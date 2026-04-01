package models

import "time"

type AuditEvent struct {
	EventID    string    `gorm:"primaryKey" json:"event_id"`
	AccountID  string    `json:"account_id"`
	EventType  string    `json:"event_type"` // transaction, block, authentication, account, etc.
	Action     string    `json:"action"`     // created, updated, verified, denied, etc.
	Details    string    `json:"details"`
	Timestamp  time.Time `json:"timestamp"`
	EntityType string    `json:"entity_type"`
	EntityID   string    `json:"entity_id"`
	EventHash  string    `json:"event_hash"`
}
