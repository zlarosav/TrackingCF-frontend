'use client'

import { Suspense } from 'react'
import CompareContent from './CompareContent'

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" /></div>}>
      <CompareContent />
    </Suspense>
  )
}
