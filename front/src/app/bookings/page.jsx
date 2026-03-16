// app/bookings/page.jsx
"use client"

import { Suspense } from 'react'
import BookingContent from './BookingContent'
import { Loader2 } from 'lucide-react'

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 size={28} className="animate-spin text-gray-300" />
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  )
}