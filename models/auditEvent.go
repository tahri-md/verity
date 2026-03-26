package models

type AuditEvent struct {
	EventID      string `json:"event_id"`
	EventType    string `json:"event_type"`
	EntityType   string `json:"entity_type"`
	EntityID     string `json:"entity_id"`
	EventHash    string `json:"event_hash"`
	PreviousHash string `json:"previous_hash"`
	Timestamp    int64  `json:"timestamp"`
}
