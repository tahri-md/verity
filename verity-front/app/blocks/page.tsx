'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PrivateLayout from '@/components/PrivateLayout'
import { api } from '@/lib/api'

interface Block {
  block_number: number
  block_hash: string
  merkle_root: string
  timestamp: string
  transactions?: any[]
}

export default function BlocksPage() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBlocks()
  }, [])

  const fetchBlocks = async () => {
    try {
      setLoading(true)
      const response = await api.get('/blocks')
      setBlocks(Array.isArray(response.data) ? response.data : [])
    } catch (err: any) {
      setError('Failed to load blocks')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PrivateLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Blocks</h1>
          <p className="text-muted">View and verify blockchain blocks</p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mt-6 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 mt-6">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : blocks.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-4">
            {blocks.map((block) => (
              <Link
                key={block.block_number}
                href={`/blocks/${block.block_number}`}
                className="card hover:border-primary transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                        {block.block_number}
                      </div>
                      <div>
                        <h3 className="font-bold text-primary">Block #{block.block_number}</h3>
                        <p className="text-xs text-muted">{new Date(block.timestamp).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-muted mb-1">Merkle Root</p>
                        <p className="font-mono text-xs text-accent break-all">{block.merkle_root?.substring(0, 32)}...</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted mb-1">Hash</p>
                        <p className="font-mono text-xs text-accent break-all">{block.block_hash?.substring(0, 32)}...</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-primary">{block.transactions?.length ?? 0}</p>
                    <p className="text-xs text-muted">transactions</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12 mt-6">
            <p className="text-muted">No blocks found</p>
          </div>
        )}
      </div>
    </PrivateLayout>
  )
}
