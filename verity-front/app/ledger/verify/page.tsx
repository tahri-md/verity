import { Suspense } from 'react'
import LedgerVerifyClient from './verify-client'

export default function LedgerVerifyPage() {
  return (
    <Suspense fallback={null}>
      <LedgerVerifyClient />
    </Suspense>
  )
}
