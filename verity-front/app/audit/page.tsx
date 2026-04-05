'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PrivateLayout from '@/components/PrivateLayout'
import axios from 'axios'

interface AuditEvent {
  id: string
  eventType: string
  accountId: string
  description: string
  timestamp: string
  status: string
}

export default function AuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [eventTypeFilter, setEventTypeFilter] = useState('all')

  useEffect(() => {
    fetchAuditEvents()
  }, [eventTypeFilter])

  const fetchAuditEvents = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:8080/audit/events')
      setEvents(response.data?.events || [])
    } catch (err: any) {
      setError('Failed to load audit log')
    } finally {
      setLoading(false)
    }
  }

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
            {['all', 'create', 'update', 'delete', 'verify'].map((type) => (
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
                  <tr key={event.id} className="border-b border-border hover:bg-muted/5">
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
                        {event.eventType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">{event.description}</td>
                    <td className="py-3 px-4 text-sm font-mono text-accent">{event.accountId.substring(0, 16)}...</td>
                    <td className="py-3 px-4 text-sm text-muted">
                      {new Date(event.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        event.status === 'success'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/audit/${event.id}`}
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
