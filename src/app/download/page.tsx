"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Apple, Smartphone } from 'lucide-react'

export default function AppDownloadsPage() {
  return (
    <div className="relative min-h-[70vh] flex items-center justify-center px-4 py-12">
      {/* subtle background accents */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-pink-200/40 blur-3xl" />
        <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-rose-200/40 blur-3xl" />
      </div>

      <div className="w-full max-w-lg">
        <div className="rounded-2xl border bg-white/60 backdrop-blur p-8 shadow-sm">
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">get the bondly app</h1>
            <p className="text-sm text-muted-foreground">Choose your platform to download</p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="https://apps.apple.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                <Apple className="h-5 w-5" />
                <span>Download for iOS</span>
              </Link>
            </Button>
            <Button size="lg" variant="secondary" className="w-full sm:w-auto" asChild>
              <Link href="https://play.google.com/store" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                <span>Download for Android</span>
              </Link>
            </Button>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">coming soon.</p>
        </div>
      </div>
    </div>
  )
}


