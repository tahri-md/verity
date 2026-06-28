'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SidebarNav from '@/components/SidebarNav'

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    } else {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <main className="flex-1 min-w-0" style={{ marginLeft: 200 }}>
        {children}
      </main>
    </div>
  )
}