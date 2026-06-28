'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
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

export default function AuditDetailsPage() {
  const params = useParams()
  const [event, setEvent] = useState<AuditEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetch = useCallback(async () => {
    try {
      const r = await api.get(`/audit/events/${params.id}`)
      setEvent(r.data)
    } catch { setError('Failed to load audit event') }
    finally { setLoading(false) }
  }, [params.id])

  useEffect(() => { fetch() }, [fetch])

  if (loading) return (
    <PrivateLayout>
      <div className="section main-container flex justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin mt-12" />
      </div>
    </PrivateLayout>
  )

  if (error || !event) return (
    <PrivateLayout>
      <div className="section main-container">
        <div className="card bg-destructive/5 border-destructive/20 mb-4">
          <p className="text-destructive text-sm">{error || 'Event not found'}</p>
        </div>
        <Link href="/audit" className="btn btn-ghost btn-sm">← Back to audit log</Link>
      </div>
    </PrivateLayout>
  )

  return (
    <PrivateLayout>
      <div className="section main-container max-w-2xl">
        <Link href="/audit" className="text-xs text-foreground/40 hover:text-foreground/70 transition-colors mb-6 inline-block">
          ← audit log
        </Link>

        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-foreground/30 font-medium mb-1">Audit event</p>
            <h1 className="text-2xl font-bold">{event.action}</h1>
          </div>
          <span className="badge badge-primary text-xs">{event.event_type}</span>
        </div>

        <div className="card space-y-0">
          {[
            { label: 'Event ID',    value: event.event_id,    mono: true },
            { label: 'Account',     value: event.account_id,  mono: true },
            { label: 'Entity',      value: `${event.entity_type}${event.entity_id ? ' / ' + event.entity_id : ''}` },
            { label: 'Details',     value: event.details },
            { label: 'Timestamp',   value: new Date(event.timestamp).toLocaleString() },
            { label: 'Event hash',  value: event.event_hash,  mono: true },
          ].map(({ label, value, mono }) => (
            <div key={label} className="py-3 border-b border-border/40 last:border-0">
              <p className="text-xs uppercase tracking-wide font-medium text-foreground/40 mb-1">{label}</p>
              <p className={`text-sm break-all ${mono ? 'font-mono text-foreground/60' : 'text-foreground/80'}`}>{value || '—'}</p>
            </div>
          ))}
        </div>
      </div>
    </PrivateLayout>
  )
}