"use client"

import * as React from "react"
import { ChevronsUpDown } from "lucide-react"
import { createPortal } from "react-dom"

type Country = {
  code: string
  name: string
  dialCode: string
  flag: string
}

// Common country codes with flags and dial codes
export const COUNTRIES: Country[] = [
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺" },
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳" },
  { code: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵" },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪" },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷" },
  { code: "BR", name: "Brazil", dialCode: "+55", flag: "🇧🇷" },
  { code: "CN", name: "China", dialCode: "+86", flag: "🇨🇳" },
]

export interface CountrySelectorProps {
  value: string // ISO country code, e.g., "US"
  onChange: (value: string) => void
  className?: string
  buttonAriaLabel?: string
}

export function CountrySelector({
  value,
  onChange,
  className = "",
  buttonAriaLabel = "Select country",
}: CountrySelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState<number>(0)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  const selectedIndex = React.useMemo(
    () =>
      Math.max(
        0,
        COUNTRIES.findIndex((c) => c.code === value),
      ),
    [value],
  )
  const selectedCountry = COUNTRIES[selectedIndex] ?? COUNTRIES[0]

  React.useEffect(() => {
    setActiveIndex(selectedIndex)
  }, [selectedIndex])

  // Toggle dropdown
  const toggleDropdown = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(prev => !prev)
  }, [])

  // Close on outside click
  React.useEffect(() => {
    if (!isOpen) return
    
    const handleClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Keyboard support
  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault()
      setIsOpen(true)
      return
    }
    if (!isOpen) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % COUNTRIES.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + COUNTRIES.length) % COUNTRIES.length)
    } else if (e.key === "Enter") {
      e.preventDefault()
      const c = COUNTRIES[activeIndex]
      if (c) {
        onChange(c.code)
        setIsOpen(false)
      }
    } else if (e.key === "Escape" || e.key === "Tab") {
      setIsOpen(false)
    }
  }

  // Scroll active item into view
  React.useEffect(() => {
    if (!isOpen) return
    const container = listRef.current
    const item = container?.querySelector<HTMLButtonElement>(`[data-index="${activeIndex}"]`)
    if (container && item) {
      const itemTop = item.offsetTop
      const itemBottom = itemTop + item.offsetHeight
      const viewTop = container.scrollTop
      const viewBottom = viewTop + container.clientHeight
      if (itemTop < viewTop) container.scrollTop = itemTop
      else if (itemBottom > viewBottom) container.scrollTop = itemBottom - container.clientHeight
    }
  }, [isOpen, activeIndex])

  // Get button position for dropdown placement
  const [buttonRect, setButtonRect] = React.useState<DOMRect | null>(null)
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  // Update button position when dropdown opens
  React.useEffect(() => {
    if (isOpen && buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect())
    }
  }, [isOpen])

  // Render dropdown in a portal to avoid z-index issues
  const dropdownContent = isOpen && buttonRect ? (
    <div
      role="listbox"
      aria-activedescendant={`country-${COUNTRIES[activeIndex].code}`}
      tabIndex={-1}
      className="fixed z-[100] w-64 overflow-hidden rounded-md border border-input bg-popover shadow-lg outline-none animate-in fade-in-0 zoom-in-95"
      style={{
        top: `${buttonRect.bottom + window.scrollY + 4}px`,
        left: `${buttonRect.left + window.scrollX}px`,
      }}
    >
      <div ref={listRef} className="max-h-60 overflow-auto py-1">
        {COUNTRIES.map((country, idx) => {
          const selected = country.code === value
          const active = idx === activeIndex
          return (
            <button
              key={country.code}
              id={`country-${country.code}`}
              role="option"
              aria-selected={selected}
              data-index={idx}
              type="button"
              onMouseEnter={() => setActiveIndex(idx)}
              onClick={() => {
                onChange(country.code)
                setIsOpen(false)
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent ${
                active ? "bg-accent" : ""
              } ${selected ? "font-medium" : "font-normal"}`}
            >
              <span className="text-base" aria-hidden="true">
                {country.flag}
              </span>
              <span className="flex-1">{country.name}</span>
              <span className="text-muted-foreground">{country.dialCode}</span>
            </button>
          )
        })}
      </div>
    </div>
  ) : null

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={buttonAriaLabel}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        className="flex h-10 items-center gap-2 rounded-l-md border border-input bg-background px-2 text-sm hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-accent"
      >
        <span className="text-base leading-none" aria-hidden="true">
          {selectedCountry.flag}
        </span>
        <span className="sr-only">{selectedCountry.name}</span>
        <ChevronsUpDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </button>

      {/* Render dropdown in portal */}
      {typeof document !== 'undefined' ? createPortal(dropdownContent, document.body) : null}
    </div>
  )
}
