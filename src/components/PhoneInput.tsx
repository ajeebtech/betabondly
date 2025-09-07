import { useState, useEffect } from 'react';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  // Accept string but we'll coerce to the library's expected type at usage time
  defaultCountry?: string;
}

const CustomPhoneInput = ({
  value,
  onChange,
  disabled = false,
  className = '',
  placeholder = 'Enter phone number',
  defaultCountry = 'US',
  ...props
}: PhoneInputProps) => {
  const [mounted, setMounted] = useState(false);

  // Only render on client to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`${className} bg-gray-100 rounded-md h-12 animate-pulse`} />
    );
  }

  return (
    <div className={className}>
      <PhoneInput
        international
        // Coerce defaultCountry to the expected Country type
        defaultCountry={defaultCountry as unknown as any}
        // The lib expects Value | undefined; map empty string to undefined
        value={value || undefined}
        // Map library's Value | undefined back to string for our consumers
        onChange={(v) => onChange((v as string) || "")}
        disabled={disabled}
        placeholder={placeholder}
        className="border border-gray-300 rounded-md p3 w-full h-12 px-4 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        numberInputProps={{
          className: '!border-none !ring-0 !outline-none !focus:ring-0',
        }}
        countrySelectProps={{
          className: '!border-none !ring-0 !outline-none',
        }}
        {...props}
      />
    </div>
  );
};

export default CustomPhoneInput;
