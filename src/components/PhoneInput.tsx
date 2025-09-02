import { useState, useEffect } from 'react';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { useIntl } from 'react-intl';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
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
  const intl = useIntl();

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
        defaultCountry={defaultCountry}
        value={value}
        onChange={onChange}
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
