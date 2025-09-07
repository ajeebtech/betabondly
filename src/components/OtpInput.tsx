import { useState, useRef, useEffect } from 'react';

interface OtpInputProps {
  length?: number;
  onChange: (otp: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

const OtpInput = ({
  length = 6,
  onChange,
  disabled = false,
  autoFocus = true,
  className = '',
}: OtpInputProps) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    
    // Only allow numbers
    if (value && !/^\d*$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take the last character if multiple are pasted
    setOtp(newOtp);
    onChange(newOtp.join(''));

    // Move to next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      // Move left with arrow key
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      // Move right with arrow key
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === ' ' || e.key === 'Spacebar') {
      // Prevent spacebar
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text/plain').replace(/\D/g, ''); // Get numbers only
    
    if (!pasteData) return;
    
    const newOtp = [...otp];
    let i = 0;
    
    // Fill the OTP array with the pasted data
    for (; i < Math.min(pasteData.length, length); i++) {
      newOtp[i] = pasteData[i];
    }
    
    setOtp(newOtp);
    onChange(newOtp.join(''));
    
    // Focus the next empty input or the last one
    const nextIndex = Math.min(i, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className={`flex space-x-2 ${className}`}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={otp[index]}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={index === 0 ? handlePaste : undefined} // Only handle paste on first input
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          disabled={disabled}
          className={`w-12 h-16 text-2xl text-center border rounded-md focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-colors ${
            disabled ? 'bg-gray-100' : 'bg-white'
          }`}
        />
      ))}
    </div>
  );
};

export default OtpInput;
