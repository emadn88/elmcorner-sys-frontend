/**
 * Comprehensive Timezone data with cities/districts organized by country
 * Each timezone includes: identifier, city/district name, country, and UTC offset
 */

export interface TimezoneOption {
  identifier: string; // IANA timezone identifier (e.g., "America/Toronto")
  city: string; // City or district name (e.g., "Toronto")
  country: string; // Country name (e.g., "Canada")
  displayName: string; // Display format: "City, Country"
  utcOffset: string; // UTC offset (e.g., "UTC-5")
}

export const TIMEZONES: TimezoneOption[] = [
  // Canada
  { identifier: "America/Toronto", city: "Toronto", country: "Canada", displayName: "Toronto, Canada", utcOffset: "UTC-5" },
  { identifier: "America/Vancouver", city: "Vancouver", country: "Canada", displayName: "Vancouver, Canada", utcOffset: "UTC-8" },
  { identifier: "America/Edmonton", city: "Edmonton", country: "Canada", displayName: "Edmonton, Canada", utcOffset: "UTC-7" },
  { identifier: "America/Winnipeg", city: "Winnipeg", country: "Canada", displayName: "Winnipeg, Canada", utcOffset: "UTC-6" },
  { identifier: "America/Halifax", city: "Halifax", country: "Canada", displayName: "Halifax, Canada", utcOffset: "UTC-4" },
  { identifier: "America/St_Johns", city: "St. John's", country: "Canada", displayName: "St. John's, Canada", utcOffset: "UTC-3:30" },
  { identifier: "America/Montreal", city: "Montreal", country: "Canada", displayName: "Montreal, Canada", utcOffset: "UTC-5" },
  { identifier: "America/Calgary", city: "Calgary", country: "Canada", displayName: "Calgary, Canada", utcOffset: "UTC-7" },
  { identifier: "America/Whitehorse", city: "Whitehorse", country: "Canada", displayName: "Whitehorse, Canada", utcOffset: "UTC-8" },
  { identifier: "America/Yellowknife", city: "Yellowknife", country: "Canada", displayName: "Yellowknife, Canada", utcOffset: "UTC-7" },

  // United States
  { identifier: "America/New_York", city: "New York", country: "United States", displayName: "New York, United States", utcOffset: "UTC-5" },
  { identifier: "America/Chicago", city: "Chicago", country: "United States", displayName: "Chicago, United States", utcOffset: "UTC-6" },
  { identifier: "America/Denver", city: "Denver", country: "United States", displayName: "Denver, United States", utcOffset: "UTC-7" },
  { identifier: "America/Los_Angeles", city: "Los Angeles", country: "United States", displayName: "Los Angeles, United States", utcOffset: "UTC-8" },
  { identifier: "America/Phoenix", city: "Phoenix", country: "United States", displayName: "Phoenix, United States", utcOffset: "UTC-7" },
  { identifier: "America/Detroit", city: "Detroit", country: "United States", displayName: "Detroit, United States", utcOffset: "UTC-5" },
  { identifier: "America/Indianapolis", city: "Indianapolis", country: "United States", displayName: "Indianapolis, United States", utcOffset: "UTC-5" },
  { identifier: "America/Atlanta", city: "Atlanta", country: "United States", displayName: "Atlanta, United States", utcOffset: "UTC-5" },
  { identifier: "America/Miami", city: "Miami", country: "United States", displayName: "Miami, United States", utcOffset: "UTC-5" },
  { identifier: "America/Dallas", city: "Dallas", country: "United States", displayName: "Dallas, United States", utcOffset: "UTC-6" },
  { identifier: "America/Seattle", city: "Seattle", country: "United States", displayName: "Seattle, United States", utcOffset: "UTC-8" },
  { identifier: "America/Portland", city: "Portland", country: "United States", displayName: "Portland, United States", utcOffset: "UTC-8" },
  { identifier: "America/Boston", city: "Boston", country: "United States", displayName: "Boston, United States", utcOffset: "UTC-5" },
  { identifier: "America/Anchorage", city: "Anchorage", country: "United States", displayName: "Anchorage, United States", utcOffset: "UTC-9" },
  { identifier: "Pacific/Honolulu", city: "Honolulu", country: "United States", displayName: "Honolulu, United States", utcOffset: "UTC-10" },

  // Middle East
  { identifier: "Asia/Riyadh", city: "Riyadh", country: "Saudi Arabia", displayName: "Riyadh, Saudi Arabia", utcOffset: "UTC+3" },
  { identifier: "Asia/Dubai", city: "Dubai", country: "United Arab Emirates", displayName: "Dubai, United Arab Emirates", utcOffset: "UTC+4" },
  { identifier: "Asia/Kuwait", city: "Kuwait City", country: "Kuwait", displayName: "Kuwait City, Kuwait", utcOffset: "UTC+3" },
  { identifier: "Asia/Qatar", city: "Doha", country: "Qatar", displayName: "Doha, Qatar", utcOffset: "UTC+3" },
  { identifier: "Asia/Bahrain", city: "Manama", country: "Bahrain", displayName: "Manama, Bahrain", utcOffset: "UTC+3" },
  { identifier: "Asia/Muscat", city: "Muscat", country: "Oman", displayName: "Muscat, Oman", utcOffset: "UTC+4" },
  { identifier: "Asia/Amman", city: "Amman", country: "Jordan", displayName: "Amman, Jordan", utcOffset: "UTC+2" },
  { identifier: "Asia/Beirut", city: "Beirut", country: "Lebanon", displayName: "Beirut, Lebanon", utcOffset: "UTC+2" },
  { identifier: "Africa/Cairo", city: "Cairo", country: "Egypt", displayName: "Cairo, Egypt", utcOffset: "UTC+2" },
  { identifier: "Asia/Baghdad", city: "Baghdad", country: "Iraq", displayName: "Baghdad, Iraq", utcOffset: "UTC+3" },
  { identifier: "Asia/Damascus", city: "Damascus", country: "Syria", displayName: "Damascus, Syria", utcOffset: "UTC+2" },
  { identifier: "Asia/Gaza", city: "Gaza", country: "Palestine", displayName: "Gaza, Palestine", utcOffset: "UTC+2" },

  // Europe
  { identifier: "Europe/London", city: "London", country: "United Kingdom", displayName: "London, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/Paris", city: "Paris", country: "France", displayName: "Paris, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Berlin", city: "Berlin", country: "Germany", displayName: "Berlin, Germany", utcOffset: "UTC+1" },
  { identifier: "Europe/Rome", city: "Rome", country: "Italy", displayName: "Rome, Italy", utcOffset: "UTC+1" },
  { identifier: "Europe/Madrid", city: "Madrid", country: "Spain", displayName: "Madrid, Spain", utcOffset: "UTC+1" },
  { identifier: "Europe/Amsterdam", city: "Amsterdam", country: "Netherlands", displayName: "Amsterdam, Netherlands", utcOffset: "UTC+1" },
  { identifier: "Europe/Brussels", city: "Brussels", country: "Belgium", displayName: "Brussels, Belgium", utcOffset: "UTC+1" },
  { identifier: "Europe/Zurich", city: "Zurich", country: "Switzerland", displayName: "Zurich, Switzerland", utcOffset: "UTC+1" },
  { identifier: "Europe/Vienna", city: "Vienna", country: "Austria", displayName: "Vienna, Austria", utcOffset: "UTC+1" },
  { identifier: "Europe/Stockholm", city: "Stockholm", country: "Sweden", displayName: "Stockholm, Sweden", utcOffset: "UTC+1" },
  { identifier: "Europe/Oslo", city: "Oslo", country: "Norway", displayName: "Oslo, Norway", utcOffset: "UTC+1" },
  { identifier: "Europe/Copenhagen", city: "Copenhagen", country: "Denmark", displayName: "Copenhagen, Denmark", utcOffset: "UTC+1" },
  { identifier: "Europe/Helsinki", city: "Helsinki", country: "Finland", displayName: "Helsinki, Finland", utcOffset: "UTC+2" },
  { identifier: "Europe/Warsaw", city: "Warsaw", country: "Poland", displayName: "Warsaw, Poland", utcOffset: "UTC+1" },
  { identifier: "Europe/Prague", city: "Prague", country: "Czech Republic", displayName: "Prague, Czech Republic", utcOffset: "UTC+1" },
  { identifier: "Europe/Athens", city: "Athens", country: "Greece", displayName: "Athens, Greece", utcOffset: "UTC+2" },
  { identifier: "Europe/Lisbon", city: "Lisbon", country: "Portugal", displayName: "Lisbon, Portugal", utcOffset: "UTC+0" },
  { identifier: "Europe/Dublin", city: "Dublin", country: "Ireland", displayName: "Dublin, Ireland", utcOffset: "UTC+0" },
  { identifier: "Europe/Istanbul", city: "Istanbul", country: "Turkey", displayName: "Istanbul, Turkey", utcOffset: "UTC+3" },
  { identifier: "Europe/Moscow", city: "Moscow", country: "Russia", displayName: "Moscow, Russia", utcOffset: "UTC+3" },

  // Asia
  { identifier: "Asia/Shanghai", city: "Shanghai", country: "China", displayName: "Shanghai, China", utcOffset: "UTC+8" },
  { identifier: "Asia/Tokyo", city: "Tokyo", country: "Japan", displayName: "Tokyo, Japan", utcOffset: "UTC+9" },
  { identifier: "Asia/Seoul", city: "Seoul", country: "South Korea", displayName: "Seoul, South Korea", utcOffset: "UTC+9" },
  { identifier: "Asia/Kolkata", city: "Mumbai", country: "India", displayName: "Mumbai, India", utcOffset: "UTC+5:30" },
  { identifier: "Asia/Kolkata", city: "Delhi", country: "India", displayName: "Delhi, India", utcOffset: "UTC+5:30" },
  { identifier: "Asia/Karachi", city: "Karachi", country: "Pakistan", displayName: "Karachi, Pakistan", utcOffset: "UTC+5" },
  { identifier: "Asia/Dhaka", city: "Dhaka", country: "Bangladesh", displayName: "Dhaka, Bangladesh", utcOffset: "UTC+6" },
  { identifier: "Asia/Jakarta", city: "Jakarta", country: "Indonesia", displayName: "Jakarta, Indonesia", utcOffset: "UTC+7" },
  { identifier: "Asia/Kuala_Lumpur", city: "Kuala Lumpur", country: "Malaysia", displayName: "Kuala Lumpur, Malaysia", utcOffset: "UTC+8" },
  { identifier: "Asia/Singapore", city: "Singapore", country: "Singapore", displayName: "Singapore, Singapore", utcOffset: "UTC+8" },
  { identifier: "Asia/Bangkok", city: "Bangkok", country: "Thailand", displayName: "Bangkok, Thailand", utcOffset: "UTC+7" },
  { identifier: "Asia/Ho_Chi_Minh", city: "Ho Chi Minh City", country: "Vietnam", displayName: "Ho Chi Minh City, Vietnam", utcOffset: "UTC+7" },
  { identifier: "Asia/Manila", city: "Manila", country: "Philippines", displayName: "Manila, Philippines", utcOffset: "UTC+8" },

  // Australia & Oceania
  { identifier: "Australia/Sydney", city: "Sydney", country: "Australia", displayName: "Sydney, Australia", utcOffset: "UTC+10" },
  { identifier: "Australia/Melbourne", city: "Melbourne", country: "Australia", displayName: "Melbourne, Australia", utcOffset: "UTC+10" },
  { identifier: "Australia/Brisbane", city: "Brisbane", country: "Australia", displayName: "Brisbane, Australia", utcOffset: "UTC+10" },
  { identifier: "Australia/Perth", city: "Perth", country: "Australia", displayName: "Perth, Australia", utcOffset: "UTC+8" },
  { identifier: "Australia/Adelaide", city: "Adelaide", country: "Australia", displayName: "Adelaide, Australia", utcOffset: "UTC+9:30" },
  { identifier: "Australia/Darwin", city: "Darwin", country: "Australia", displayName: "Darwin, Australia", utcOffset: "UTC+9:30" },
  { identifier: "Pacific/Auckland", city: "Auckland", country: "New Zealand", displayName: "Auckland, New Zealand", utcOffset: "UTC+12" },

  // Africa
  { identifier: "Africa/Johannesburg", city: "Johannesburg", country: "South Africa", displayName: "Johannesburg, South Africa", utcOffset: "UTC+2" },
  { identifier: "Africa/Lagos", city: "Lagos", country: "Nigeria", displayName: "Lagos, Nigeria", utcOffset: "UTC+1" },
  { identifier: "Africa/Nairobi", city: "Nairobi", country: "Kenya", displayName: "Nairobi, Kenya", utcOffset: "UTC+3" },
  { identifier: "Africa/Casablanca", city: "Casablanca", country: "Morocco", displayName: "Casablanca, Morocco", utcOffset: "UTC+1" },
  { identifier: "Africa/Tunis", city: "Tunis", country: "Tunisia", displayName: "Tunis, Tunisia", utcOffset: "UTC+1" },
  { identifier: "Africa/Algiers", city: "Algiers", country: "Algeria", displayName: "Algiers, Algeria", utcOffset: "UTC+1" },

  // Latin America
  { identifier: "America/Sao_Paulo", city: "São Paulo", country: "Brazil", displayName: "São Paulo, Brazil", utcOffset: "UTC-3" },
  { identifier: "America/Rio_Branco", city: "Rio de Janeiro", country: "Brazil", displayName: "Rio de Janeiro, Brazil", utcOffset: "UTC-3" },
  { identifier: "America/Mexico_City", city: "Mexico City", country: "Mexico", displayName: "Mexico City, Mexico", utcOffset: "UTC-6" },
  { identifier: "America/Argentina/Buenos_Aires", city: "Buenos Aires", country: "Argentina", displayName: "Buenos Aires, Argentina", utcOffset: "UTC-3" },
  { identifier: "America/Santiago", city: "Santiago", country: "Chile", displayName: "Santiago, Chile", utcOffset: "UTC-3" },
  { identifier: "America/Bogota", city: "Bogotá", country: "Colombia", displayName: "Bogotá, Colombia", utcOffset: "UTC-5" },
  { identifier: "America/Lima", city: "Lima", country: "Peru", displayName: "Lima, Peru", utcOffset: "UTC-5" },

  // UTC
  { identifier: "UTC", city: "UTC", country: "UTC", displayName: "UTC (Coordinated Universal Time)", utcOffset: "UTC+0" },
];

/**
 * Get timezone by identifier
 */
export function getTimezoneByIdentifier(identifier: string): TimezoneOption | undefined {
  return TIMEZONES.find((tz) => tz.identifier === identifier);
}

/**
 * Search timezones by city, country, or identifier
 */
export function searchTimezones(query: string): TimezoneOption[] {
  if (!query) return TIMEZONES;
  
  const lowerQuery = query.toLowerCase();
  return TIMEZONES.filter(
    (tz) =>
      tz.city.toLowerCase().includes(lowerQuery) ||
      tz.country.toLowerCase().includes(lowerQuery) ||
      tz.displayName.toLowerCase().includes(lowerQuery) ||
      tz.identifier.toLowerCase().includes(lowerQuery) ||
      tz.utcOffset.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get timezones by country
 */
export function getTimezonesByCountry(country: string): TimezoneOption[] {
  return TIMEZONES.filter((tz) => tz.country.toLowerCase() === country.toLowerCase());
}

/**
 * Get unique countries from timezones
 */
export function getCountries(): string[] {
  const countries = new Set(TIMEZONES.map((tz) => tz.country));
  return Array.from(countries).sort();
}
