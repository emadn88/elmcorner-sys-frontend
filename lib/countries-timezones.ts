/**
 * Country and Timezone mappings
 */

export interface Country {
  code: string;
  name: string;
  timezone: string;
  currency: string;
}

export const COUNTRIES: Country[] = [
  { code: "SA", name: "Saudi Arabia", timezone: "Asia/Riyadh", currency: "SAR" },
  { code: "AE", name: "United Arab Emirates", timezone: "Asia/Dubai", currency: "AED" },
  { code: "KW", name: "Kuwait", timezone: "Asia/Kuwait", currency: "KWD" },
  { code: "QA", name: "Qatar", timezone: "Asia/Qatar", currency: "QAR" },
  { code: "BH", name: "Bahrain", timezone: "Asia/Bahrain", currency: "BHD" },
  { code: "OM", name: "Oman", timezone: "Asia/Muscat", currency: "OMR" },
  { code: "JO", name: "Jordan", timezone: "Asia/Amman", currency: "JOD" },
  { code: "LB", name: "Lebanon", timezone: "Asia/Beirut", currency: "LBP" },
  { code: "EG", name: "Egypt", timezone: "Africa/Cairo", currency: "EGP" },
  { code: "IQ", name: "Iraq", timezone: "Asia/Baghdad", currency: "IQD" },
  { code: "YE", name: "Yemen", timezone: "Asia/Aden", currency: "YER" },
  { code: "SY", name: "Syria", timezone: "Asia/Damascus", currency: "SYP" },
  { code: "PS", name: "Palestine", timezone: "Asia/Gaza", currency: "ILS" },
  { code: "US", name: "United States", timezone: "America/New_York", currency: "USD" },
  { code: "GB", name: "United Kingdom", timezone: "Europe/London", currency: "GBP" },
  { code: "CA", name: "Canada", timezone: "America/Toronto", currency: "CAD" },
  { code: "AU", name: "Australia", timezone: "Australia/Sydney", currency: "AUD" },
  { code: "FR", name: "France", timezone: "Europe/Paris", currency: "EUR" },
  { code: "DE", name: "Germany", timezone: "Europe/Berlin", currency: "EUR" },
  { code: "IT", name: "Italy", timezone: "Europe/Rome", currency: "EUR" },
  { code: "ES", name: "Spain", timezone: "Europe/Madrid", currency: "EUR" },
  { code: "NL", name: "Netherlands", timezone: "Europe/Amsterdam", currency: "EUR" },
  { code: "BE", name: "Belgium", timezone: "Europe/Brussels", currency: "EUR" },
  { code: "CH", name: "Switzerland", timezone: "Europe/Zurich", currency: "CHF" },
  { code: "AT", name: "Austria", timezone: "Europe/Vienna", currency: "EUR" },
  { code: "SE", name: "Sweden", timezone: "Europe/Stockholm", currency: "SEK" },
  { code: "NO", name: "Norway", timezone: "Europe/Oslo", currency: "NOK" },
  { code: "DK", name: "Denmark", timezone: "Europe/Copenhagen", currency: "DKK" },
  { code: "FI", name: "Finland", timezone: "Europe/Helsinki", currency: "EUR" },
  { code: "PL", name: "Poland", timezone: "Europe/Warsaw", currency: "PLN" },
  { code: "CZ", name: "Czech Republic", timezone: "Europe/Prague", currency: "CZK" },
  { code: "GR", name: "Greece", timezone: "Europe/Athens", currency: "EUR" },
  { code: "PT", name: "Portugal", timezone: "Europe/Lisbon", currency: "EUR" },
  { code: "IE", name: "Ireland", timezone: "Europe/Dublin", currency: "EUR" },
  { code: "TR", name: "Turkey", timezone: "Europe/Istanbul", currency: "TRY" },
  { code: "RU", name: "Russia", timezone: "Europe/Moscow", currency: "RUB" },
  { code: "CN", name: "China", timezone: "Asia/Shanghai", currency: "CNY" },
  { code: "JP", name: "Japan", timezone: "Asia/Tokyo", currency: "JPY" },
  { code: "KR", name: "South Korea", timezone: "Asia/Seoul", currency: "KRW" },
  { code: "IN", name: "India", timezone: "Asia/Kolkata", currency: "INR" },
  { code: "PK", name: "Pakistan", timezone: "Asia/Karachi", currency: "PKR" },
  { code: "BD", name: "Bangladesh", timezone: "Asia/Dhaka", currency: "BDT" },
  { code: "ID", name: "Indonesia", timezone: "Asia/Jakarta", currency: "IDR" },
  { code: "MY", name: "Malaysia", timezone: "Asia/Kuala_Lumpur", currency: "MYR" },
  { code: "SG", name: "Singapore", timezone: "Asia/Singapore", currency: "SGD" },
  { code: "TH", name: "Thailand", timezone: "Asia/Bangkok", currency: "THB" },
  { code: "VN", name: "Vietnam", timezone: "Asia/Ho_Chi_Minh", currency: "VND" },
  { code: "PH", name: "Philippines", timezone: "Asia/Manila", currency: "PHP" },
  { code: "NZ", name: "New Zealand", timezone: "Pacific/Auckland", currency: "NZD" },
  { code: "ZA", name: "South Africa", timezone: "Africa/Johannesburg", currency: "ZAR" },
  { code: "NG", name: "Nigeria", timezone: "Africa/Lagos", currency: "NGN" },
  { code: "KE", name: "Kenya", timezone: "Africa/Nairobi", currency: "KES" },
  { code: "BR", name: "Brazil", timezone: "America/Sao_Paulo", currency: "BRL" },
  { code: "MX", name: "Mexico", timezone: "America/Mexico_City", currency: "MXN" },
  { code: "AR", name: "Argentina", timezone: "America/Argentina/Buenos_Aires", currency: "ARS" },
  { code: "CL", name: "Chile", timezone: "America/Santiago", currency: "CLP" },
  { code: "CO", name: "Colombia", timezone: "America/Bogota", currency: "COP" },
  { code: "PE", name: "Peru", timezone: "America/Lima", currency: "PEN" },
];

/**
 * Get country by name or code
 */
export function getCountryByNameOrCode(nameOrCode: string): Country | undefined {
  return COUNTRIES.find(
    (country) =>
      country.name.toLowerCase() === nameOrCode.toLowerCase() ||
      country.code.toLowerCase() === nameOrCode.toLowerCase()
  );
}

/**
 * Get timezone for a country
 */
export function getTimezoneForCountry(countryNameOrCode: string): string {
  const country = getCountryByNameOrCode(countryNameOrCode);
  return country?.timezone || "UTC";
}

/**
 * Get currency for a country
 */
export function getCurrencyForCountry(countryNameOrCode: string): string {
  const country = getCountryByNameOrCode(countryNameOrCode);
  return country?.currency || "USD";
}
