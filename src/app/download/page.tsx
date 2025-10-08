"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Apple, Smartphone } from 'lucide-react'
import { Footer } from '@/components/footer'

export default function AppDownloadsPage() {
  return (
    <>
      <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 pt-24">
        {/* subtle background accents */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-10 -left-10 h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-pink-200/40 blur-3xl" />
          <div className="absolute -bottom-10 -right-10 h-40 w-40 sm:h-48 sm:w-48 rounded-full bg-rose-200/40 blur-3xl" />
        </div>

        <div className="w-full max-w-md sm:max-w-lg mx-auto">
          <div className="rounded-2xl border bg-white/60 backdrop-blur p-6 sm:p-8 shadow-sm">
            <div className="text-center space-y-3 sm:space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                get the bondly app
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Choose your platform to download
              </p>
            </div>

            <div className="mt-8 sm:mt-6 flex flex-col gap-4 sm:gap-3">
              <Button size="lg" className="w-full h-12 sm:h-auto" asChild>
                <Link href="https://apps.apple.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3">
                  <Apple className="h-6 w-6 sm:h-5 sm:w-5" />
                  <span className="text-base sm:text-sm font-medium">Download for iOS</span>
                </Link>
              </Button>
              <Button size="lg" variant="secondary" className="w-full h-12 sm:h-auto" asChild>
                <Link href="https://play.google.com/store" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3">
                  <Smartphone className="h-6 w-6 sm:h-5 sm:w-5" />
                  <span className="text-base sm:text-sm font-medium">Download for Android</span>
                </Link>
              </Button>
            </div>

            <p className="mt-8 sm:mt-6 text-center text-xs sm:text-sm text-muted-foreground">
              coming soon.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}


