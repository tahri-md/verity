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

  const fetchEvent = useCallback(async () => {
    try {
      const response = await api.get(`/audit/events/${params.id}`)
      setEvent(response.data)
    } catch (err: any) {
      setError('Failed to load audit event')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchEvent()
  }, [fetchEvent])

  if (loading) {
    return (
      <PrivateLayout>
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </PrivateLayout>
    )
  }

  if (error || !event) {
    return (
      <PrivateLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
            {error || 'Audit event not found'}
          </div>
          <Link href="/audit" className="btn btn-primary mt-4">
            Back to Audit Log
          </Link>
        </div>
      </PrivateLayout>
    )
  }

  return (
    <PrivateLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/audit" className="text-accent hover:underline mb-4 inline-block">
          ← Back to Audit Log
        </Link>

        <div className="card border-2">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-primary">Audit Event</h1>
              <p className="text-muted text-sm mt-1">{event.event_id}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-muted/20">
              {event.action}
            </span>
          </div>

          <div className="space-y-6">
            <div className="border-b border-border pb-6">
              <p className="text-muted text-sm mb-2">Event Type</p>
              <p className="text-lg font-bold text-primary">{event.event_type}</p>
            </div>

            <div className="border-b border-border pb-6">
              <p className="text-muted text-sm mb-2">Details</p>
              <p className="text-foreground">{event.details}</p>
            </div>

            <div className="border-b border-border pb-6">
              <p className="text-muted text-sm mb-2">Account ID</p>
              <p className="text-sm font-mono text-accent break-all">{event.account_id}</p>
            </div>

            <div>
              <p className="text-muted text-sm mb-2">Timestamp</p>
              <p>{new Date(event.timestamp).toLocaleString()}</p>
            </div>

            <div className="border-t border-border pt-6 space-y-3">
              <div>
                <p className="text-muted text-sm mb-2">Entity</p>
                <p className="text-sm">{event.entity_type} / {event.entity_id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted text-sm mb-2">Event Hash</p>
                <p className="font-mono text-xs text-accent break-all bg-muted/10 p-3 rounded">{event.event_hash}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PrivateLayout>
  )
}
