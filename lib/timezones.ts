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
  // Canada - Eastern Time (UTC-5)
  { identifier: "America/Toronto", city: "Ontario", country: "Canada", displayName: "Ontario, Canada", utcOffset: "UTC-5" },
  { identifier: "America/Toronto", city: "Toronto", country: "Canada", displayName: "Toronto, Canada", utcOffset: "UTC-5" },
  { identifier: "America/Toronto", city: "Ottawa", country: "Canada", displayName: "Ottawa, Canada", utcOffset: "UTC-5" },
  { identifier: "America/Toronto", city: "Hamilton", country: "Canada", displayName: "Hamilton, Canada", utcOffset: "UTC-5" },
  { identifier: "America/Toronto", city: "London", country: "Canada", displayName: "London, Canada", utcOffset: "UTC-5" },
  { identifier: "America/Toronto", city: "Windsor", country: "Canada", displayName: "Windsor, Canada", utcOffset: "UTC-5" },
  { identifier: "America/Toronto", city: "Kitchener", country: "Canada", displayName: "Kitchener, Canada", utcOffset: "UTC-5" },
  { identifier: "America/Toronto", city: "Mississauga", country: "Canada", displayName: "Mississauga, Canada", utcOffset: "UTC-5" },
  { identifier: "America/Toronto", city: "Brampton", country: "Canada", displayName: "Brampton, Canada", utcOffset: "UTC-5" },
  { identifier: "America/Toronto", city: "Quebec", country: "Canada", displayName: "Quebec, Canada", utcOffset: "UTC-5" },
  { identifier: "America/Montreal", city: "Montreal", country: "Canada", displayName: "Montreal, Canada", utcOffset: "UTC-5" },
  { identifier: "America/Montreal", city: "Quebec City", country: "Canada", displayName: "Quebec City, Canada", utcOffset: "UTC-5" },
  { identifier: "America/Montreal", city: "Laval", country: "Canada", displayName: "Laval, Canada", utcOffset: "UTC-5" },
  { identifier: "America/Montreal", city: "Gatineau", country: "Canada", displayName: "Gatineau, Canada", utcOffset: "UTC-5" },
  { identifier: "America/Montreal", city: "Longueuil", country: "Canada", displayName: "Longueuil, Canada", utcOffset: "UTC-5" },
  { identifier: "America/Toronto", city: "New Brunswick", country: "Canada", displayName: "New Brunswick, Canada", utcOffset: "UTC-4" },
  { identifier: "America/Toronto", city: "Nova Scotia", country: "Canada", displayName: "Nova Scotia, Canada", utcOffset: "UTC-4" },
  { identifier: "America/Halifax", city: "Halifax", country: "Canada", displayName: "Halifax, Canada", utcOffset: "UTC-4" },
  { identifier: "America/Halifax", city: "Prince Edward Island", country: "Canada", displayName: "Prince Edward Island, Canada", utcOffset: "UTC-4" },
  { identifier: "America/Halifax", city: "Charlottetown", country: "Canada", displayName: "Charlottetown, Canada", utcOffset: "UTC-4" },
  { identifier: "America/St_Johns", city: "Newfoundland", country: "Canada", displayName: "Newfoundland, Canada", utcOffset: "UTC-3:30" },
  { identifier: "America/St_Johns", city: "St. John's", country: "Canada", displayName: "St. John's, Canada", utcOffset: "UTC-3:30" },

  // Canada - Central Time (UTC-6)
  { identifier: "America/Winnipeg", city: "Manitoba", country: "Canada", displayName: "Manitoba, Canada", utcOffset: "UTC-6" },
  { identifier: "America/Winnipeg", city: "Winnipeg", country: "Canada", displayName: "Winnipeg, Canada", utcOffset: "UTC-6" },
  { identifier: "America/Winnipeg", city: "Brandon", country: "Canada", displayName: "Brandon, Canada", utcOffset: "UTC-6" },
  { identifier: "America/Winnipeg", city: "Saskatchewan", country: "Canada", displayName: "Saskatchewan, Canada", utcOffset: "UTC-6" },
  { identifier: "America/Regina", city: "Regina", country: "Canada", displayName: "Regina, Canada", utcOffset: "UTC-6" },
  { identifier: "America/Swift_Current", city: "Swift Current", country: "Canada", displayName: "Swift Current, Canada", utcOffset: "UTC-6" },

  // Canada - Mountain Time (UTC-7)
  { identifier: "America/Edmonton", city: "Alberta", country: "Canada", displayName: "Alberta, Canada", utcOffset: "UTC-7" },
  { identifier: "America/Edmonton", city: "Edmonton", country: "Canada", displayName: "Edmonton, Canada", utcOffset: "UTC-7" },
  { identifier: "America/Calgary", city: "Calgary", country: "Canada", displayName: "Calgary, Canada", utcOffset: "UTC-7" },
  { identifier: "America/Edmonton", city: "Red Deer", country: "Canada", displayName: "Red Deer, Canada", utcOffset: "UTC-7" },
  { identifier: "America/Edmonton", city: "Lethbridge", country: "Canada", displayName: "Lethbridge, Canada", utcOffset: "UTC-7" },
  { identifier: "America/Edmonton", city: "Medicine Hat", country: "Canada", displayName: "Medicine Hat, Canada", utcOffset: "UTC-7" },
  { identifier: "America/Yellowknife", city: "Northwest Territories", country: "Canada", displayName: "Northwest Territories, Canada", utcOffset: "UTC-7" },
  { identifier: "America/Yellowknife", city: "Yellowknife", country: "Canada", displayName: "Yellowknife, Canada", utcOffset: "UTC-7" },

  // Canada - Pacific Time (UTC-8)
  { identifier: "America/Vancouver", city: "British Columbia", country: "Canada", displayName: "British Columbia, Canada", utcOffset: "UTC-8" },
  { identifier: "America/Vancouver", city: "Vancouver", country: "Canada", displayName: "Vancouver, Canada", utcOffset: "UTC-8" },
  { identifier: "America/Vancouver", city: "Victoria", country: "Canada", displayName: "Victoria, Canada", utcOffset: "UTC-8" },
  { identifier: "America/Vancouver", city: "Surrey", country: "Canada", displayName: "Surrey, Canada", utcOffset: "UTC-8" },
  { identifier: "America/Vancouver", city: "Burnaby", country: "Canada", displayName: "Burnaby, Canada", utcOffset: "UTC-8" },
  { identifier: "America/Vancouver", city: "Richmond", country: "Canada", displayName: "Richmond, Canada", utcOffset: "UTC-8" },
  { identifier: "America/Vancouver", city: "Kelowna", country: "Canada", displayName: "Kelowna, Canada", utcOffset: "UTC-8" },
  { identifier: "America/Vancouver", city: "Abbotsford", country: "Canada", displayName: "Abbotsford, Canada", utcOffset: "UTC-8" },
  { identifier: "America/Vancouver", city: "Nanaimo", country: "Canada", displayName: "Nanaimo, Canada", utcOffset: "UTC-8" },
  { identifier: "America/Whitehorse", city: "Yukon", country: "Canada", displayName: "Yukon, Canada", utcOffset: "UTC-8" },
  { identifier: "America/Whitehorse", city: "Whitehorse", country: "Canada", displayName: "Whitehorse, Canada", utcOffset: "UTC-8" },

  // United States - Eastern Time (UTC-5)
  { identifier: "America/New_York", city: "New York", country: "United States", displayName: "New York, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "New York City", country: "United States", displayName: "New York City, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "Ohio", country: "United States", displayName: "Ohio, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "Columbus", country: "United States", displayName: "Columbus, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "Cleveland", country: "United States", displayName: "Cleveland, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "Cincinnati", country: "United States", displayName: "Cincinnati, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "Florida", country: "United States", displayName: "Florida, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "Miami", country: "United States", displayName: "Miami, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "Tampa", country: "United States", displayName: "Tampa, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "Orlando", country: "United States", displayName: "Orlando, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "Jacksonville", country: "United States", displayName: "Jacksonville, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "Georgia", country: "United States", displayName: "Georgia, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "Atlanta", country: "United States", displayName: "Atlanta, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "Massachusetts", country: "United States", displayName: "Massachusetts, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "Boston", country: "United States", displayName: "Boston, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "Pennsylvania", country: "United States", displayName: "Pennsylvania, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "Philadelphia", country: "United States", displayName: "Philadelphia, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "Pittsburgh", country: "United States", displayName: "Pittsburgh, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "North Carolina", country: "United States", displayName: "North Carolina, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "Charlotte", country: "United States", displayName: "Charlotte, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "Raleigh", country: "United States", displayName: "Raleigh, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "South Carolina", country: "United States", displayName: "South Carolina, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "Charleston", country: "United States", displayName: "Charleston, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "Virginia", country: "United States", displayName: "Virginia, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "Richmond", country: "United States", displayName: "Richmond, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "Virginia Beach", country: "United States", displayName: "Virginia Beach, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "Maryland", country: "United States", displayName: "Maryland, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "Baltimore", country: "United States", displayName: "Baltimore, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "Delaware", country: "United States", displayName: "Delaware, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "New Jersey", country: "United States", displayName: "New Jersey, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "Newark", country: "United States", displayName: "Newark, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "Connecticut", country: "United States", displayName: "Connecticut, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "Hartford", country: "United States", displayName: "Hartford, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "Vermont", country: "United States", displayName: "Vermont, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "New Hampshire", country: "United States", displayName: "New Hampshire, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "Maine", country: "United States", displayName: "Maine, United States", utcOffset: "UTC-5" },
  { identifier: "America/New_York", city: "West Virginia", country: "United States", displayName: "West Virginia, United States", utcOffset: "UTC-5" },
  { identifier: "America/Detroit", city: "Michigan", country: "United States", displayName: "Michigan, United States", utcOffset: "UTC-5" },
  { identifier: "America/Detroit", city: "Detroit", country: "United States", displayName: "Detroit, United States", utcOffset: "UTC-5" },
  { identifier: "America/Detroit", city: "Grand Rapids", country: "United States", displayName: "Grand Rapids, United States", utcOffset: "UTC-5" },
  { identifier: "America/Indiana/Indianapolis", city: "Indiana", country: "United States", displayName: "Indiana, United States", utcOffset: "UTC-5" },
  { identifier: "America/Indiana/Indianapolis", city: "Indianapolis", country: "United States", displayName: "Indianapolis, United States", utcOffset: "UTC-5" },
  { identifier: "America/Indiana/Indianapolis", city: "Fort Wayne", country: "United States", displayName: "Fort Wayne, United States", utcOffset: "UTC-5" },
  { identifier: "America/Kentucky/Louisville", city: "Kentucky", country: "United States", displayName: "Kentucky, United States", utcOffset: "UTC-5" },
  { identifier: "America/Kentucky/Louisville", city: "Louisville", country: "United States", displayName: "Louisville, United States", utcOffset: "UTC-5" },
  { identifier: "America/Kentucky/Louisville", city: "Lexington", country: "United States", displayName: "Lexington, United States", utcOffset: "UTC-5" },
  { identifier: "America/Kentucky/Louisville", city: "Tennessee", country: "United States", displayName: "Tennessee, United States", utcOffset: "UTC-5" },
  { identifier: "America/Kentucky/Louisville", city: "Nashville", country: "United States", displayName: "Nashville, United States", utcOffset: "UTC-5" },
  { identifier: "America/Kentucky/Louisville", city: "Memphis", country: "United States", displayName: "Memphis, United States", utcOffset: "UTC-5" },

  // United States - Central Time (UTC-6)
  { identifier: "America/Chicago", city: "Illinois", country: "United States", displayName: "Illinois, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "Chicago", country: "United States", displayName: "Chicago, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "Texas", country: "United States", displayName: "Texas, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "Dallas", country: "United States", displayName: "Dallas, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "Houston", country: "United States", displayName: "Houston, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "San Antonio", country: "United States", displayName: "San Antonio, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "Austin", country: "United States", displayName: "Austin, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "Fort Worth", country: "United States", displayName: "Fort Worth, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "Wisconsin", country: "United States", displayName: "Wisconsin, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "Milwaukee", country: "United States", displayName: "Milwaukee, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "Missouri", country: "United States", displayName: "Missouri, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "Kansas City", country: "United States", displayName: "Kansas City, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "St. Louis", country: "United States", displayName: "St. Louis, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "Minnesota", country: "United States", displayName: "Minnesota, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "Minneapolis", country: "United States", displayName: "Minneapolis, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "Iowa", country: "United States", displayName: "Iowa, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "Des Moines", country: "United States", displayName: "Des Moines, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "Arkansas", country: "United States", displayName: "Arkansas, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "Little Rock", country: "United States", displayName: "Little Rock, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "Louisiana", country: "United States", displayName: "Louisiana, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "New Orleans", country: "United States", displayName: "New Orleans, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "Baton Rouge", country: "United States", displayName: "Baton Rouge, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "Mississippi", country: "United States", displayName: "Mississippi, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "Jackson", country: "United States", displayName: "Jackson, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "Alabama", country: "United States", displayName: "Alabama, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "Birmingham", country: "United States", displayName: "Birmingham, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "Montgomery", country: "United States", displayName: "Montgomery, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "Oklahoma", country: "United States", displayName: "Oklahoma, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "Oklahoma City", country: "United States", displayName: "Oklahoma City, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "Tulsa", country: "United States", displayName: "Tulsa, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "Kansas", country: "United States", displayName: "Kansas, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "Wichita", country: "United States", displayName: "Wichita, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "Nebraska", country: "United States", displayName: "Nebraska, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "Omaha", country: "United States", displayName: "Omaha, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "North Dakota", country: "United States", displayName: "North Dakota, United States", utcOffset: "UTC-6" },
  { identifier: "America/Chicago", city: "South Dakota", country: "United States", displayName: "South Dakota, United States", utcOffset: "UTC-6" },

  // United States - Mountain Time (UTC-7)
  { identifier: "America/Denver", city: "Colorado", country: "United States", displayName: "Colorado, United States", utcOffset: "UTC-7" },
  { identifier: "America/Denver", city: "Denver", country: "United States", displayName: "Denver, United States", utcOffset: "UTC-7" },
  { identifier: "America/Denver", city: "Colorado Springs", country: "United States", displayName: "Colorado Springs, United States", utcOffset: "UTC-7" },
  { identifier: "America/Denver", city: "Aurora", country: "United States", displayName: "Aurora, United States", utcOffset: "UTC-7" },
  { identifier: "America/Denver", city: "New Mexico", country: "United States", displayName: "New Mexico, United States", utcOffset: "UTC-7" },
  { identifier: "America/Denver", city: "Albuquerque", country: "United States", displayName: "Albuquerque, United States", utcOffset: "UTC-7" },
  { identifier: "America/Denver", city: "Montana", country: "United States", displayName: "Montana, United States", utcOffset: "UTC-7" },
  { identifier: "America/Denver", city: "Billings", country: "United States", displayName: "Billings, United States", utcOffset: "UTC-7" },
  { identifier: "America/Denver", city: "Wyoming", country: "United States", displayName: "Wyoming, United States", utcOffset: "UTC-7" },
  { identifier: "America/Denver", city: "Cheyenne", country: "United States", displayName: "Cheyenne, United States", utcOffset: "UTC-7" },
  { identifier: "America/Denver", city: "Utah", country: "United States", displayName: "Utah, United States", utcOffset: "UTC-7" },
  { identifier: "America/Denver", city: "Salt Lake City", country: "United States", displayName: "Salt Lake City, United States", utcOffset: "UTC-7" },
  { identifier: "America/Denver", city: "Idaho", country: "United States", displayName: "Idaho, United States", utcOffset: "UTC-7" },
  { identifier: "America/Denver", city: "Boise", country: "United States", displayName: "Boise, United States", utcOffset: "UTC-7" },
  { identifier: "America/Phoenix", city: "Arizona", country: "United States", displayName: "Arizona, United States", utcOffset: "UTC-7" },
  { identifier: "America/Phoenix", city: "Phoenix", country: "United States", displayName: "Phoenix, United States", utcOffset: "UTC-7" },
  { identifier: "America/Phoenix", city: "Tucson", country: "United States", displayName: "Tucson, United States", utcOffset: "UTC-7" },
  { identifier: "America/Phoenix", city: "Mesa", country: "United States", displayName: "Mesa, United States", utcOffset: "UTC-7" },

  // United States - Pacific Time (UTC-8)
  { identifier: "America/Los_Angeles", city: "California", country: "United States", displayName: "California, United States", utcOffset: "UTC-8" },
  { identifier: "America/Los_Angeles", city: "Los Angeles", country: "United States", displayName: "Los Angeles, United States", utcOffset: "UTC-8" },
  { identifier: "America/Los_Angeles", city: "San Francisco", country: "United States", displayName: "San Francisco, United States", utcOffset: "UTC-8" },
  { identifier: "America/Los_Angeles", city: "San Diego", country: "United States", displayName: "San Diego, United States", utcOffset: "UTC-8" },
  { identifier: "America/Los_Angeles", city: "San Jose", country: "United States", displayName: "San Jose, United States", utcOffset: "UTC-8" },
  { identifier: "America/Los_Angeles", city: "Sacramento", country: "United States", displayName: "Sacramento, United States", utcOffset: "UTC-8" },
  { identifier: "America/Los_Angeles", city: "Oakland", country: "United States", displayName: "Oakland, United States", utcOffset: "UTC-8" },
  { identifier: "America/Los_Angeles", city: "Fresno", country: "United States", displayName: "Fresno, United States", utcOffset: "UTC-8" },
  { identifier: "America/Los_Angeles", city: "Long Beach", country: "United States", displayName: "Long Beach, United States", utcOffset: "UTC-8" },
  { identifier: "America/Los_Angeles", city: "Washington", country: "United States", displayName: "Washington, United States", utcOffset: "UTC-8" },
  { identifier: "America/Los_Angeles", city: "Seattle", country: "United States", displayName: "Seattle, United States", utcOffset: "UTC-8" },
  { identifier: "America/Los_Angeles", city: "Spokane", country: "United States", displayName: "Spokane, United States", utcOffset: "UTC-8" },
  { identifier: "America/Los_Angeles", city: "Tacoma", country: "United States", displayName: "Tacoma, United States", utcOffset: "UTC-8" },
  { identifier: "America/Los_Angeles", city: "Oregon", country: "United States", displayName: "Oregon, United States", utcOffset: "UTC-8" },
  { identifier: "America/Los_Angeles", city: "Portland", country: "United States", displayName: "Portland, United States", utcOffset: "UTC-8" },
  { identifier: "America/Los_Angeles", city: "Eugene", country: "United States", displayName: "Eugene, United States", utcOffset: "UTC-8" },
  { identifier: "America/Los_Angeles", city: "Salem", country: "United States", displayName: "Salem, United States", utcOffset: "UTC-8" },
  { identifier: "America/Los_Angeles", city: "Nevada", country: "United States", displayName: "Nevada, United States", utcOffset: "UTC-8" },
  { identifier: "America/Los_Angeles", city: "Las Vegas", country: "United States", displayName: "Las Vegas, United States", utcOffset: "UTC-8" },
  { identifier: "America/Los_Angeles", city: "Reno", country: "United States", displayName: "Reno, United States", utcOffset: "UTC-8" },

  // United States - Alaska & Hawaii
  { identifier: "America/Anchorage", city: "Alaska", country: "United States", displayName: "Alaska, United States", utcOffset: "UTC-9" },
  { identifier: "America/Anchorage", city: "Anchorage", country: "United States", displayName: "Anchorage, United States", utcOffset: "UTC-9" },
  { identifier: "America/Anchorage", city: "Fairbanks", country: "United States", displayName: "Fairbanks, United States", utcOffset: "UTC-9" },
  { identifier: "Pacific/Honolulu", city: "Hawaii", country: "United States", displayName: "Hawaii, United States", utcOffset: "UTC-10" },
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

  // United Kingdom
  { identifier: "Europe/London", city: "England", country: "United Kingdom", displayName: "England, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "London", country: "United Kingdom", displayName: "London, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "Birmingham", country: "United Kingdom", displayName: "Birmingham, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "Manchester", country: "United Kingdom", displayName: "Manchester, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "Liverpool", country: "United Kingdom", displayName: "Liverpool, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "Leeds", country: "United Kingdom", displayName: "Leeds, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "Sheffield", country: "United Kingdom", displayName: "Sheffield, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "Bristol", country: "United Kingdom", displayName: "Bristol, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "Leicester", country: "United Kingdom", displayName: "Leicester, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "Coventry", country: "United Kingdom", displayName: "Coventry, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "Nottingham", country: "United Kingdom", displayName: "Nottingham, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "Newcastle", country: "United Kingdom", displayName: "Newcastle, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "Sunderland", country: "United Kingdom", displayName: "Sunderland, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "Portsmouth", country: "United Kingdom", displayName: "Portsmouth, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "Brighton", country: "United Kingdom", displayName: "Brighton, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "Reading", country: "United Kingdom", displayName: "Reading, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "Northampton", country: "United Kingdom", displayName: "Northampton, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "Luton", country: "United Kingdom", displayName: "Luton, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "Bolton", country: "United Kingdom", displayName: "Bolton, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "Plymouth", country: "United Kingdom", displayName: "Plymouth, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "Wales", country: "United Kingdom", displayName: "Wales, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "Cardiff", country: "United Kingdom", displayName: "Cardiff, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "Swansea", country: "United Kingdom", displayName: "Swansea, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "Newport", country: "United Kingdom", displayName: "Newport, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "Scotland", country: "United Kingdom", displayName: "Scotland, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "Edinburgh", country: "United Kingdom", displayName: "Edinburgh, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "Glasgow", country: "United Kingdom", displayName: "Glasgow, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "Aberdeen", country: "United Kingdom", displayName: "Aberdeen, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "Dundee", country: "United Kingdom", displayName: "Dundee, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "Inverness", country: "United Kingdom", displayName: "Inverness, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "Northern Ireland", country: "United Kingdom", displayName: "Northern Ireland, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "Belfast", country: "United Kingdom", displayName: "Belfast, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "Derry", country: "United Kingdom", displayName: "Derry, United Kingdom", utcOffset: "UTC+0" },
  { identifier: "Europe/London", city: "Lisburn", country: "United Kingdom", displayName: "Lisburn, United Kingdom", utcOffset: "UTC+0" },

  // France
  { identifier: "Europe/Paris", city: "Île-de-France", country: "France", displayName: "Île-de-France, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Paris", country: "France", displayName: "Paris, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Versailles", country: "France", displayName: "Versailles, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Boulogne-Billancourt", country: "France", displayName: "Boulogne-Billancourt, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Saint-Denis", country: "France", displayName: "Saint-Denis, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Auvergne-Rhône-Alpes", country: "France", displayName: "Auvergne-Rhône-Alpes, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Lyon", country: "France", displayName: "Lyon, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Grenoble", country: "France", displayName: "Grenoble, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Saint-Étienne", country: "France", displayName: "Saint-Étienne, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Clermont-Ferrand", country: "France", displayName: "Clermont-Ferrand, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Provence-Alpes-Côte d'Azur", country: "France", displayName: "Provence-Alpes-Côte d'Azur, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Marseille", country: "France", displayName: "Marseille, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Nice", country: "France", displayName: "Nice, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Toulon", country: "France", displayName: "Toulon, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Aix-en-Provence", country: "France", displayName: "Aix-en-Provence, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Occitanie", country: "France", displayName: "Occitanie, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Toulouse", country: "France", displayName: "Toulouse, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Montpellier", country: "France", displayName: "Montpellier, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Nîmes", country: "France", displayName: "Nîmes, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Perpignan", country: "France", displayName: "Perpignan, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Nouvelle-Aquitaine", country: "France", displayName: "Nouvelle-Aquitaine, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Bordeaux", country: "France", displayName: "Bordeaux, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Limoges", country: "France", displayName: "Limoges, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Poitiers", country: "France", displayName: "Poitiers, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Pays de la Loire", country: "France", displayName: "Pays de la Loire, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Nantes", country: "France", displayName: "Nantes, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Le Mans", country: "France", displayName: "Le Mans, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Angers", country: "France", displayName: "Angers, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Bretagne", country: "France", displayName: "Bretagne, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Rennes", country: "France", displayName: "Rennes, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Brest", country: "France", displayName: "Brest, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Quimper", country: "France", displayName: "Quimper, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Normandie", country: "France", displayName: "Normandie, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Rouen", country: "France", displayName: "Rouen, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Caen", country: "France", displayName: "Caen, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Le Havre", country: "France", displayName: "Le Havre, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Hauts-de-France", country: "France", displayName: "Hauts-de-France, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Lille", country: "France", displayName: "Lille, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Amiens", country: "France", displayName: "Amiens, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Valenciennes", country: "France", displayName: "Valenciennes, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Grand Est", country: "France", displayName: "Grand Est, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Strasbourg", country: "France", displayName: "Strasbourg, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Reims", country: "France", displayName: "Reims, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Metz", country: "France", displayName: "Metz, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Nancy", country: "France", displayName: "Nancy, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Bourgogne-Franche-Comté", country: "France", displayName: "Bourgogne-Franche-Comté, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Dijon", country: "France", displayName: "Dijon, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Besançon", country: "France", displayName: "Besançon, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Centre-Val de Loire", country: "France", displayName: "Centre-Val de Loire, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Orléans", country: "France", displayName: "Orléans, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Tours", country: "France", displayName: "Tours, France", utcOffset: "UTC+1" },
  { identifier: "Europe/Paris", city: "Bourges", country: "France", displayName: "Bourges, France", utcOffset: "UTC+1" },
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
