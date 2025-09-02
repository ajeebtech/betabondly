import * as RPNInput from 'react-phone-number-input';

declare module 'react-phone-number-input' {
  export interface FlagProps {
    country: string;
    countryName: string;
    title?: string;
  }

  export interface CountrySelectProps {
    value?: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    disabled?: boolean;
  }

  export function getCountries(): string[];
  export function getCountryCallingCode(country: string): string;
  export function isSupportedCountry(country: string): boolean;
  export function parsePhoneNumber(text: string, defaultCountry?: string): any;
  export function formatPhoneNumber(value: string): string;
  export function isValidPhoneNumber(phoneNumber: string, defaultCountry?: string): boolean;
}
