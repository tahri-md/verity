'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import PrivateLayout from '@/components/PrivateLayout'
import { api } from '@/lib/api'

interface AuditEvent {
  event_id: string
  event_type: string
  action: string
  account_id: string
  details: string
  timestamp: string
  entity_type: string
  entity_id: string
  event_hash: string
}

export default function AuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [eventTypeFilter, setEventTypeFilter] = useState('all')

  const fetchAuditEvents = useCallback(async () => {
    try {
      setLoading(true)
      const response =
        eventTypeFilter === 'all'
          ? await api.get('/audit/events')
          : await api.get(`/audit/events/type/${eventTypeFilter}`)

      const payload = response.data
      const list = Array.isArray(payload) ? payload : payload?.events
      setEvents(Array.isArray(list) ? list : [])
    } catch (err: any) {
      setError('Failed to load audit log')
    } finally {
      setLoading(false)
    }
  }, [eventTypeFilter])

  useEffect(() => {
    fetchAuditEvents()
  }, [fetchAuditEvents])

  return (
    <PrivateLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Audit Log</h1>
        <p className="text-muted mb-8">Track all system activities and changes</p>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="card mb-6">
          <div className="flex gap-2 flex-wrap">
            {['all', 'transaction', 'block', 'authentication', 'account'].map((type) => (
              <button
                key={type}
                onClick={() => setEventTypeFilter(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  eventTypeFilter === type
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/20 hover:bg-muted/30'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : events.length > 0 ? (
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-primary">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-primary">Description</th>
                  <th className="text-left py-3 px-4 font-semibold text-primary">Account</th>
                  <th className="text-left py-3 px-4 font-semibold text-primary">Timestamp</th>
                  <th className="text-left py-3 px-4 font-semibold text-primary">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.event_id} className="border-b border-border hover:bg-muted/5">
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
                        {event.event_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className="text-muted">{event.action}</span>
                      <span className="text-muted"> — </span>
                      {event.details}
                    </td>
                    <td className="py-3 px-4 text-sm font-mono text-accent">{event.account_id.substring(0, 16)}...</td>
                    <td className="py-3 px-4 text-sm text-muted">
                      {new Date(event.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-muted/20">
                        {event.entity_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/audit/${event.event_id}`}
                        className="text-accent hover:underline text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-muted">No audit events found</p>
          </div>
        )}
      </div>
    </PrivateLayout>
  )
}
