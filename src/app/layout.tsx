import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import { ReactNode } from "react"

export const metadata = {
  title: "Bondly",
  description: "Bond with your partner, privately",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-postcard min-h-screen text-gray-900">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
