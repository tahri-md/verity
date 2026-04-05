'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
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
  details?: any
}

export default function AuditDetailsPage() {
  const params = useParams()
  const [event, setEvent] = useState<AuditEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEvent()
  }, [params.id])

  const fetchEvent = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`http://localhost:8080/api/audit/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setEvent(response.data)
    } catch (err: any) {
      setError('Failed to load audit event')
    } finally {
      setLoading(false)
    }
  }

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
              <p className="text-muted text-sm mt-1">{event.id}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              event.status === 'success'
                ? 'bg-green-500/10 text-green-500'
                : 'bg-primary/10 text-primary'
            }`}>
              {event.status}
            </span>
          </div>

          <div className="space-y-6">
            <div className="border-b border-border pb-6">
              <p className="text-muted text-sm mb-2">Event Type</p>
              <p className="text-lg font-bold text-primary">{event.eventType}</p>
            </div>

            <div className="border-b border-border pb-6">
              <p className="text-muted text-sm mb-2">Description</p>
              <p className="text-foreground">{event.description}</p>
            </div>

            <div className="border-b border-border pb-6">
              <p className="text-muted text-sm mb-2">Account ID</p>
              <p className="text-sm font-mono text-accent break-all">{event.accountId}</p>
            </div>

            <div>
              <p className="text-muted text-sm mb-2">Timestamp</p>
              <p>{new Date(event.timestamp).toLocaleString()}</p>
            </div>

            {event.details && (
              <div className="border-t border-border pt-6">
                <p className="text-muted text-sm mb-3">Additional Details</p>
                <pre className="bg-muted/10 p-4 rounded text-xs overflow-auto">
                  {JSON.stringify(event.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </PrivateLayout>
  )
}
