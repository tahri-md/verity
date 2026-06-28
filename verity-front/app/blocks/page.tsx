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

  useEffect(() => { fetchBlocks() }, [])

  const fetchBlocks = async () => {
    try {
      setLoading(true)
      const response = await api.get('/blocks')
      setBlocks(Array.isArray(response.data) ? response.data : [])
    } catch {
      setError('Failed to load blocks')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PrivateLayout>
      <div className="section main-container">

        <div className="flex justify-between items-start md:items-center md:flex-row flex-col gap-4 mb-8">
          <div>
            <p className="font-mono text-[11px] text-foreground/30 uppercase tracking-widest mb-1">chain</p>
            <h1 className="text-xl font-bold tracking-tight">Blocks</h1>
          </div>
          <Link
            href="/blocks/new"
            className="px-4 py-2 rounded-md text-sm font-medium"
            style={{ background: '#7c5cfc', color: '#fff' }}
          >
            Add block
          </Link>
        </div>

        {error && (
          <div className="border-l-2 border-destructive pl-3 mb-6">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <div className="w-5 h-5 border border-border border-t-[#7c5cfc] rounded-full animate-spin" />
            <p className="font-mono text-[11px] text-foreground/30 uppercase tracking-widest">fetching</p>
          </div>
        ) : blocks.length > 0 ? (
          <div className="space-y-px">
            {blocks.map((block) => (
              <Link
                key={block.block_number}
                href={`/blocks/${block.block_number}`}
                className="flex items-center gap-6 px-4 py-4 border border-border/30 rounded-md hover:border-[#7c5cfc44] hover:bg-muted/20 transition-all group"
              >
                {/* Block number */}
                <span
                  className="font-mono text-xs tabular-nums w-10 text-right flex-shrink-0"
                  style={{ color: '#7c5cfc' }}
                >
                  #{block.block_number}
                </span>

                {/* Hashes */}
                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-1">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] text-foreground/25 uppercase tracking-widest mb-0.5">merkle</p>
                    <p className="font-mono text-xs text-foreground/45 truncate">{block.merkle_root?.substring(0, 28)}…</p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] text-foreground/25 uppercase tracking-widest mb-0.5">hash</p>
                    <p className="font-mono text-xs text-foreground/45 truncate">{block.block_hash?.substring(0, 28)}…</p>
                  </div>
                </div>

                {/* Tx count */}
                <div className="text-right flex-shrink-0">
                  <p className="font-mono text-sm font-semibold">{block.transactions?.length ?? 0}</p>
                  <p className="font-mono text-[10px] text-foreground/25 uppercase tracking-widest">txns</p>
                </div>

                {/* Date */}
                <div className="text-right flex-shrink-0 hidden md:block">
                  <p className="font-mono text-xs text-foreground/30">
                    {new Date(block.timestamp).toLocaleDateString()}
                  </p>
                  <p className="font-mono text-[10px] text-foreground/20">
                    {new Date(block.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <span className="font-mono text-[11px] text-foreground/20 group-hover:text-foreground/50 transition-colors flex-shrink-0">→</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="font-mono text-[11px] text-foreground/30 uppercase tracking-widest">no blocks</p>
          </div>
        )}
      </div>
    </PrivateLayout>
  )
}