/**
 * WhatsApp Number Validator
 * Validates and formats WhatsApp numbers in E.164 format
 */

export interface CountryCode {
  code: string;
  name: string;
  dialCode: string;
  pattern: RegExp;
}

// Import country list to sync country codes
import { COUNTRIES } from "./countries-timezones";

// Common country codes with WhatsApp support
export const COUNTRY_CODES: Record<string, CountryCode> = {
  "Saudi Arabia": { code: "SA", name: "Saudi Arabia", dialCode: "+966", pattern: /^\+966[0-9]{9}$/ },
  "United Arab Emirates": { code: "AE", name: "United Arab Emirates", dialCode: "+971", pattern: /^\+971[0-9]{9}$/ },
  "Kuwait": { code: "KW", name: "Kuwait", dialCode: "+965", pattern: /^\+965[0-9]{8}$/ },
  "Qatar": { code: "QA", name: "Qatar", dialCode: "+974", pattern: /^\+974[0-9]{8}$/ },
  "Bahrain": { code: "BH", name: "Bahrain", dialCode: "+973", pattern: /^\+973[0-9]{8}$/ },
  "Oman": { code: "OM", name: "Oman", dialCode: "+968", pattern: /^\+968[0-9]{8}$/ },
  "Jordan": { code: "JO", name: "Jordan", dialCode: "+962", pattern: /^\+962[0-9]{9}$/ },
  "Lebanon": { code: "LB", name: "Lebanon", dialCode: "+961", pattern: /^\+961[0-9]{8}$/ },
  "Egypt": { code: "EG", name: "Egypt", dialCode: "+20", pattern: /^\+20[0-9]{10}$/ },
  "Iraq": { code: "IQ", name: "Iraq", dialCode: "+964", pattern: /^\+964[0-9]{10}$/ },
  "Yemen": { code: "YE", name: "Yemen", dialCode: "+967", pattern: /^\+967[0-9]{9}$/ },
  "Syria": { code: "SY", name: "Syria", dialCode: "+963", pattern: /^\+963[0-9]{9}$/ },
  "Palestine": { code: "PS", name: "Palestine", dialCode: "+970", pattern: /^\+970[0-9]{9}$/ },
  "United States": { code: "US", name: "United States", dialCode: "+1", pattern: /^\+1[0-9]{10}$/ },
  "United Kingdom": { code: "GB", name: "United Kingdom", dialCode: "+44", pattern: /^\+44[0-9]{10}$/ },
  "Canada": { code: "CA", name: "Canada", dialCode: "+1", pattern: /^\+1[0-9]{10}$/ },
  "Australia": { code: "AU", name: "Australia", dialCode: "+61", pattern: /^\+61[0-9]{9}$/ },
  "France": { code: "FR", name: "France", dialCode: "+33", pattern: /^\+33[0-9]{9}$/ },
  "Germany": { code: "DE", name: "Germany", dialCode: "+49", pattern: /^\+49[0-9]{10,11}$/ },
  "Italy": { code: "IT", name: "Italy", dialCode: "+39", pattern: /^\+39[0-9]{9,10}$/ },
  "Spain": { code: "ES", name: "Spain", dialCode: "+34", pattern: /^\+34[0-9]{9}$/ },
  "Netherlands": { code: "NL", name: "Netherlands", dialCode: "+31", pattern: /^\+31[0-9]{9}$/ },
  "Belgium": { code: "BE", name: "Belgium", dialCode: "+32", pattern: /^\+32[0-9]{9}$/ },
  "Switzerland": { code: "CH", name: "Switzerland", dialCode: "+41", pattern: /^\+41[0-9]{9}$/ },
  "Austria": { code: "AT", name: "Austria", dialCode: "+43", pattern: /^\+43[0-9]{10,11}$/ },
  "Sweden": { code: "SE", name: "Sweden", dialCode: "+46", pattern: /^\+46[0-9]{9}$/ },
  "Norway": { code: "NO", name: "Norway", dialCode: "+47", pattern: /^\+47[0-9]{8}$/ },
  "Denmark": { code: "DK", name: "Denmark", dialCode: "+45", pattern: /^\+45[0-9]{8}$/ },
  "Finland": { code: "FI", name: "Finland", dialCode: "+358", pattern: /^\+358[0-9]{9,10}$/ },
  "Poland": { code: "PL", name: "Poland", dialCode: "+48", pattern: /^\+48[0-9]{9}$/ },
  "Czech Republic": { code: "CZ", name: "Czech Republic", dialCode: "+420", pattern: /^\+420[0-9]{9}$/ },
  "Greece": { code: "GR", name: "Greece", dialCode: "+30", pattern: /^\+30[0-9]{10}$/ },
  "Portugal": { code: "PT", name: "Portugal", dialCode: "+351", pattern: /^\+351[0-9]{9}$/ },
  "Ireland": { code: "IE", name: "Ireland", dialCode: "+353", pattern: /^\+353[0-9]{9}$/ },
  "Turkey": { code: "TR", name: "Turkey", dialCode: "+90", pattern: /^\+90[0-9]{10}$/ },
  "Russia": { code: "RU", name: "Russia", dialCode: "+7", pattern: /^\+7[0-9]{10}$/ },
  "China": { code: "CN", name: "China", dialCode: "+86", pattern: /^\+86[0-9]{11}$/ },
  "Japan": { code: "JP", name: "Japan", dialCode: "+81", pattern: /^\+81[0-9]{10,11}$/ },
  "South Korea": { code: "KR", name: "South Korea", dialCode: "+82", pattern: /^\+82[0-9]{9,10}$/ },
  "India": { code: "IN", name: "India", dialCode: "+91", pattern: /^\+91[0-9]{10}$/ },
  "Pakistan": { code: "PK", name: "Pakistan", dialCode: "+92", pattern: /^\+92[0-9]{10}$/ },
  "Bangladesh": { code: "BD", name: "Bangladesh", dialCode: "+880", pattern: /^\+880[0-9]{10}$/ },
  "Indonesia": { code: "ID", name: "Indonesia", dialCode: "+62", pattern: /^\+62[0-9]{9,11}$/ },
  "Malaysia": { code: "MY", name: "Malaysia", dialCode: "+60", pattern: /^\+60[0-9]{9,10}$/ },
  "Singapore": { code: "SG", name: "Singapore", dialCode: "+65", pattern: /^\+65[0-9]{8}$/ },
  "Thailand": { code: "TH", name: "Thailand", dialCode: "+66", pattern: /^\+66[0-9]{9}$/ },
  "Vietnam": { code: "VN", name: "Vietnam", dialCode: "+84", pattern: /^\+84[0-9]{9,10}$/ },
  "Philippines": { code: "PH", name: "Philippines", dialCode: "+63", pattern: /^\+63[0-9]{10}$/ },
  "New Zealand": { code: "NZ", name: "New Zealand", dialCode: "+64", pattern: /^\+64[0-9]{8,9}$/ },
  "South Africa": { code: "ZA", name: "South Africa", dialCode: "+27", pattern: /^\+27[0-9]{9}$/ },
  "Nigeria": { code: "NG", name: "Nigeria", dialCode: "+234", pattern: /^\+234[0-9]{10}$/ },
  "Kenya": { code: "KE", name: "Kenya", dialCode: "+254", pattern: /^\+254[0-9]{9}$/ },
  "Brazil": { code: "BR", name: "Brazil", dialCode: "+55", pattern: /^\+55[0-9]{10,11}$/ },
  "Mexico": { code: "MX", name: "Mexico", dialCode: "+52", pattern: /^\+52[0-9]{10}$/ },
  "Argentina": { code: "AR", name: "Argentina", dialCode: "+54", pattern: /^\+54[0-9]{10}$/ },
  "Chile": { code: "CL", name: "Chile", dialCode: "+56", pattern: /^\+56[0-9]{9}$/ },
  "Colombia": { code: "CO", name: "Colombia", dialCode: "+57", pattern: /^\+57[0-9]{10}$/ },
  "Peru": { code: "PE", name: "Peru", dialCode: "+51", pattern: /^\+51[0-9]{9}$/ },
};

/**
 * Get country code info by country name
 */
export function getCountryCode(countryName: string): CountryCode | null {
  return COUNTRY_CODES[countryName] || null;
}

/**
 * Format phone number to E.164 format
 * Removes all non-digit characters except leading +
 */
export function formatToE164(phone: string): string {
  // Remove all spaces, dashes, parentheses
  let cleaned = phone.replace(/[\s\-\(\)]/g, "");
  
  // If it doesn't start with +, add it if it starts with a digit
  if (!cleaned.startsWith("+")) {
    // If it starts with 00, replace with +
    if (cleaned.startsWith("00")) {
      cleaned = "+" + cleaned.substring(2);
    } else if (/^[0-9]/.test(cleaned)) {
      cleaned = "+" + cleaned;
    }
  }
  
  // Remove any remaining non-digit characters except the leading +
  cleaned = cleaned.replace(/[^+\d]/g, "");
  
  return cleaned;
}

/**
 * Validate WhatsApp number format
 */
export interface ValidationResult {
  isValid: boolean;
  formatted: string;
  message: string;
  whatsappLink?: string;
}

export function validateWhatsAppNumber(
  phone: string,
  countryName?: string
): ValidationResult {
  if (!phone || phone.trim() === "") {
    return {
      isValid: false,
      formatted: "",
      message: "Phone number is required",
    };
  }

  // Format to E.164
  let formatted = formatToE164(phone);

  // Basic E.164 validation (starts with +, followed by 7-15 digits)
  const e164Pattern = /^\+[1-9]\d{6,14}$/;
  if (!e164Pattern.test(formatted)) {
    return {
      isValid: false,
      formatted,
      message: "Invalid phone number format. Must be in E.164 format (e.g., +966501234567)",
    };
  }

  // If country is provided, validate against country-specific pattern
  if (countryName) {
    const countryCode = getCountryCode(countryName);
    if (countryCode) {
      // Check if the number starts with the country's dial code
      if (!formatted.startsWith(countryCode.dialCode)) {
        return {
          isValid: false,
          formatted,
          message: `Number should start with ${countryCode.dialCode} for ${countryName}`,
        };
      }

      // Validate against country-specific pattern
      if (!countryCode.pattern.test(formatted)) {
        return {
          isValid: false,
          formatted,
          message: `Invalid ${countryName} phone number format. Expected format: ${countryCode.dialCode}XXXXXXXXX`,
        };
      }
    }
  }

  // Generate WhatsApp link
  const whatsappLink = `https://wa.me/${formatted.replace(/\+/g, "")}`;

  return {
    isValid: true,
    formatted,
    message: "Valid WhatsApp number",
    whatsappLink,
  };
}

/**
 * Auto-format phone number as user types
 */
export function autoFormatPhoneNumber(
  value: string,
  countryName?: string
): string {
  if (!value) return "";

  // Remove all non-digit characters
  let digits = value.replace(/\D/g, "");

  // If country is provided, add country code
  if (countryName) {
    const countryCode = getCountryCode(countryName);
    if (countryCode && digits.length > 0) {
      const dialCode = countryCode.dialCode.replace("+", "");
      
      // If number doesn't start with country code, add it
      if (!digits.startsWith(dialCode)) {
        // Remove leading zeros
        digits = digits.replace(/^0+/, "");
        digits = dialCode + digits;
      }
    }
  }

  // Add + prefix
  if (digits && !digits.startsWith("+")) {
    // If starts with 00, replace with +
    if (digits.startsWith("00")) {
      digits = digits.substring(2);
    }
    return "+" + digits;
  }

  return digits.startsWith("+") ? digits : "+" + digits;
}
