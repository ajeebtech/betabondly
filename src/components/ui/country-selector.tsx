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

// Comprehensive list of countries with flags and dial codes
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
  { code: "RU", name: "Russia", dialCode: "+7", flag: "🇷🇺" },
  { code: "IT", name: "Italy", dialCode: "+39", flag: "🇮🇹" },
  { code: "ES", name: "Spain", dialCode: "+34", flag: "🇪🇸" },
  { code: "KR", name: "South Korea", dialCode: "+82", flag: "🇰🇷" },
  { code: "MX", name: "Mexico", dialCode: "+52", flag: "🇲🇽" },
  { code: "ID", name: "Indonesia", dialCode: "+62", flag: "🇮🇩" },
  { code: "NL", name: "Netherlands", dialCode: "+31", flag: "🇳🇱" },
  { code: "TR", name: "Turkey", dialCode: "+90", flag: "🇹🇷" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", flag: "🇸🇦" },
  { code: "CH", name: "Switzerland", dialCode: "+41", flag: "🇨🇭" },
  { code: "SE", name: "Sweden", dialCode: "+46", flag: "🇸🇪" },
  { code: "NO", name: "Norway", dialCode: "+47", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", dialCode: "+45", flag: "🇩🇰" },
  { code: "FI", name: "Finland", dialCode: "+358", flag: "🇫🇮" },
  { code: "AT", name: "Austria", dialCode: "+43", flag: "🇦🇹" },
  { code: "BE", name: "Belgium", dialCode: "+32", flag: "🇧🇪" },
  { code: "PT", name: "Portugal", dialCode: "+351", flag: "🇵🇹" },
  { code: "PL", name: "Poland", dialCode: "+48", flag: "🇵🇱" },
  { code: "AR", name: "Argentina", dialCode: "+54", flag: "🇦🇷" },
  { code: "ZA", name: "South Africa", dialCode: "+27", flag: "🇿🇦" },
  { code: "EG", name: "Egypt", dialCode: "+20", flag: "🇪🇬" },
  { code: "NG", name: "Nigeria", dialCode: "+234", flag: "🇳🇬" },
  { code: "KE", name: "Kenya", dialCode: "+254", flag: "🇰🇪" },
  { code: "PK", name: "Pakistan", dialCode: "+92", flag: "🇵🇰" },
  { code: "BD", name: "Bangladesh", dialCode: "+880", flag: "🇧🇩" },
  { code: "PH", name: "Philippines", dialCode: "+63", flag: "🇵🇭" },
  { code: "VN", name: "Vietnam", dialCode: "+84", flag: "🇻🇳" },
  { code: "TH", name: "Thailand", dialCode: "+66", flag: "🇹🇭" },
  { code: "MY", name: "Malaysia", dialCode: "+60", flag: "🇲🇾" },
  { code: "SG", name: "Singapore", dialCode: "+65", flag: "🇸🇬" },
  { code: "NZ", name: "New Zealand", dialCode: "+64", flag: "🇳🇿" },
  { code: "IE", name: "Ireland", dialCode: "+353", flag: "🇮🇪" },
  { code: "GR", name: "Greece", dialCode: "+30", flag: "🇬🇷" },
  { code: "IL", name: "Israel", dialCode: "+972", flag: "🇮🇱" },
  { code: "AE", name: "UAE", dialCode: "+971", flag: "🇦🇪" },
  { code: "CO", name: "Colombia", dialCode: "+57", flag: "🇨🇴" },
  { code: "CL", name: "Chile", dialCode: "+56", flag: "🇨🇱" },
  { code: "PE", name: "Peru", dialCode: "+51", flag: "🇵🇪" },
  { code: "CZ", name: "Czech Republic", dialCode: "+420", flag: "🇨🇿" },
  { code: "HU", name: "Hungary", dialCode: "+36", flag: "🇭🇺" },
  { code: "RO", name: "Romania", dialCode: "+40", flag: "🇷🇴" },
  { code: "UA", name: "Ukraine", dialCode: "+380", flag: "🇺🇦" },
  { code: "KZ", name: "Kazakhstan", dialCode: "+7", flag: "🇰🇿" },
  { code: "KW", name: "Kuwait", dialCode: "+965", flag: "🇰🇼" },
  { code: "QA", name: "Qatar", dialCode: "+974", flag: "🇶🇦" },
  { code: "OM", name: "Oman", dialCode: "+968", flag: "🇴🇲" },
  { code: "BH", name: "Bahrain", dialCode: "+973", flag: "🇧🇭" }
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
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(prev => !prev)
  }, [])

  // Close on outside click or scroll
  React.useEffect(() => {
    if (!isOpen) return
    
    const handleClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleScroll = () => {
      setIsOpen(false)
    }

    // Use capture phase to ensure we catch the event before it bubbles up
    document.addEventListener('mousedown', handleClickOutside, true)
    document.addEventListener('scroll', handleScroll, true)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true)
      document.removeEventListener('scroll', handleScroll, true)
    }
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

  // Render dropdown with portal for better z-index handling
  const dropdownContent = isOpen ? (
    <div
      role="listbox"
      aria-activedescendant={`country-${COUNTRIES[activeIndex]?.code || ''}`}
      tabIndex={-1}
      className="absolute z-50 mt-1 w-full min-w-[240px] overflow-hidden rounded-md border border-input bg-popover shadow-lg outline-none animate-in fade-in-0 zoom-in-95"
      style={{
        top: '100%',
        left: 0,
      }}
      onMouseDown={(e) => {
        // Prevent the mousedown event from closing the dropdown
        e.preventDefault()
        e.stopPropagation()
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
        className="flex h-10 min-w-[120px] items-center justify-between gap-2 rounded-l-md border border-input bg-background px-3 text-sm hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-accent"
      >
        <span className="text-base leading-none" aria-hidden="true">
          {selectedCountry.flag}
        </span>
        <span className="sr-only">{selectedCountry.name}</span>
        <ChevronsUpDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </button>

      {/* Render dropdown directly under the button */}
      {isOpen && dropdownContent}
    </div>
  )
}
