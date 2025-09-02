"use client"

import * as React from "react"
import { CountrySelector, COUNTRIES } from "./country-selector"

type PhoneInputProps = {
  value?: string
  onChange?: (value: string) => void
  country?: string
  onCountryChange?: (country: string) => void
  className?: string
  placeholder?: string
  autoFocus?: boolean
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({
    value = '',
    onChange,
    country = 'US',
    onCountryChange,
    className = '',
    placeholder = '123 456 7890',
    autoFocus = false,
    ...props
  }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [selectedCountry, setSelectedCountry] = React.useState(country)

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value
      // Allow only numbers, spaces, and common phone number characters
      const formattedInput = input.replace(/[^0-9\s\-()]/g, '')
      onChange?.(formattedInput)
    }

    const handleCountryChange = (newCountry: string) => {
      setSelectedCountry(newCountry)
      onCountryChange?.(newCountry)
      // Focus the input after country selection
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }

    // Combine refs
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

    // Get dial code for the selected country
    const dialCode = React.useMemo(() => {
      const countryData = COUNTRIES.find(c => c.code === selectedCountry)
      return countryData?.dialCode || '+1'
    }, [selectedCountry])

    return (
      <div className={`relative flex items-center ${className}`}>
        <div className="flex-shrink-0">
          <CountrySelector
            value={selectedCountry}
            onChange={handleCountryChange}
            buttonAriaLabel="Select country code"
          />
        </div>
        <div className="relative flex-1">
          <input
            type="tel"
            value={value}
            onChange={handlePhoneChange}
            className="w-full h-10 px-3 py-2 border-l-0 rounded-r-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder={placeholder}
            autoFocus={autoFocus}
            ref={inputRef}
            {...props}
          />
        </div>
      </div>
    )
  }
)
PhoneInput.displayName = "PhoneInput"

export { PhoneInput }
