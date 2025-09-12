import { ReactNode } from "react"

interface PostsLayoutProps {
  children: ReactNode
  className?: string
}

export function PostsLayout({ children, className = "" }: PostsLayoutProps) {
  return (
    <div className={`w-full py-8 ${className}`}>
      <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  )
}
