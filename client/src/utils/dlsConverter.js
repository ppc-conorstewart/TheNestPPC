// src/utils/dlsConverter.js

// Alberta DLS to Lat/Lon conversion function.
// This is based on standard Alberta Township Grid conversions.
// NOTE: This approach uses an approximate projection, fine for most field-level visualizations.
// For survey-grade precision, you would use official survey GIS data.

export const convertDLS = (lsd, projectionOptions = {}) => {
  try {
    const match = lsd.match(/^(\d{2})-(\d{2})-(\d{3})-(\d{2})W(\d)M?$/i)
    if (!match) return null

    const [_, lsdNum, section, township, range, meridian] = match.map(Number)

    const LSD_SIZE_MILES = 0.25
    const SECTION_SIZE_MILES = 1
    const TOWNSHIP_SIZE_MILES = 6

    const originLat = 49.0
    const originLng = -110.0 - (meridian - 4) * 4

    const milesNorth = (township - 1) * TOWNSHIP_SIZE_MILES + ((section - 1) % 6) * SECTION_SIZE_MILES + ((lsdNum - 1) % 4) * LSD_SIZE_MILES
    const milesWest = (range - 1) * TOWNSHIP_SIZE_MILES

    const lat = originLat + (milesNorth / 69) // 69 miles ~ 1 degree
    const lng = originLng - (milesWest / 54.6) // 54.6 miles ~ 1 degree longitude near 54N

    return [lat, lng]
  } catch {
    return null
  }
}
