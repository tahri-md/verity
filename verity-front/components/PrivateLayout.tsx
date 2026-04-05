'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SidebarNav from '@/components/SidebarNav'

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-border border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-foreground/60 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <SidebarNav />
      <main className="bg-background min-h-screen">
        {children}
      </main>
    </>
  )
}
