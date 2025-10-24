"use client"

import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center -space-x-1">
              <Image
                src="/images/pinkbonddd.png"
                alt="Ondly Logo"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <span className="text-xl font-semibold">ondly</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your private corner of the internet, designed for two.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Downloads</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/download" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  download the app
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="https://x.com/kashvitech" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2025 bondly. made with love for couples everywhere.</p>
        </div>
      </div>
    </footer>
  )
}
