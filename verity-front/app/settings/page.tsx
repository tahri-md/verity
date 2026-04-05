'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  // Config lives in /profile; keep /settings as a compatibility redirect.
  const router = useRouter()

  useEffect(() => {
    router.replace('/profile')
  }, [router])

  return null
}
