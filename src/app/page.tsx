"use client"

import { HeroSection } from "@/components/hero-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen">
      <main>
        <HeroSection />
      </main>
      <Footer />
    </div>
  )
}