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

const FILTERS = ['all', 'transaction', 'block', 'authentication', 'account']

const TYPE_COLORS: Record<string, string> = {
  transaction: 'badge-primary',
  block: 'badge-success',
  authentication: 'badge-warning',
  account: 'badge-primary',
}

export default function AuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const r = filter === 'all' ? await api.get('/audit/events') : await api.get(`/audit/events/type/${filter}`)
      const list = Array.isArray(r.data) ? r.data : r.data?.events
      setEvents(Array.isArray(list) ? list : [])
    } catch {
      setError('Failed to load audit log')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetch() }, [fetch])

  return (
    <PrivateLayout>
      <div className="section main-container">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-foreground/30 font-medium mb-1">System</p>
          <h1 className="text-2xl font-bold">Audit log</h1>
          <p className="text-sm text-foreground/50 mt-1">All chain events, cryptographically hashed.</p>
        </div>

        {error && (
          <div className="card bg-destructive/5 border-destructive/20 mb-6">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-2 flex-wrap mb-6">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filter === f ? 'text-white' : 'bg-muted/50 text-foreground/60 hover:bg-muted/70'
              }`}
              style={filter === f ? { background: '#7c5cfc' } : {}}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
          </div>
        ) : events.length > 0 ? (
          <div className="card overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Action</th>
                  <th>Account</th>
                  <th>Timestamp</th>
                  <th>Event hash</th>
                  <th className="text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {events.map(ev => (
                  <tr key={ev.event_id}>
                    <td>
                      <span className={`badge text-xs ${TYPE_COLORS[ev.event_type] || 'badge-primary'}`}>
                        {ev.event_type}
                      </span>
                    </td>
                    <td className="text-sm text-foreground/70">{ev.action}</td>
                    <td>
                      <code className="hash-badge">{ev.account_id?.slice(0, 12)}…</code>
                    </td>
                    <td className="text-xs text-foreground/50">{new Date(ev.timestamp).toLocaleString()}</td>
                    <td>
                      <code className="hash-badge">{ev.event_hash?.slice(0, 12)}…</code>
                    </td>
                    <td className="text-right">
                      <Link href={`/audit/${ev.event_id}`} className="text-xs font-medium hover:underline" style={{ color: '#7c5cfc' }}>
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-foreground/40 text-sm">No audit events found</p>
          </div>
        )}
      </div>
    </PrivateLayout>
  )
}