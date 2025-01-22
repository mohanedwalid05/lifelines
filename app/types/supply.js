/**
 * @typedef {Object} SupplyType
 * @property {string} id - Unique identifier for the supply type
 * @property {string} name - Name of the supply category (e.g., Food, Water, Medical)
 */

/**
 * @typedef {Object} ZoneSupply
 * @property {string} supplyTypeId - Reference to the supply type
 * @property {number} quantity - Current quantity available
 * @property {number} need - Required quantity
 * @property {Date} lastUpdated - Last update timestamp
 */

/**
 * @typedef {Object} Region
 * @property {string} id - Unique identifier for the region
 * @property {string} name - Name of the region (e.g., Gaza, Qatar)
 * @property {string} code - Country/region code
 * @property {number[]} center - [longitude, latitude]
 * @property {number} zoom - Default zoom level
 * @property {string[]} zoneRefs - Array of references to zone documents
 */

/**
 * @typedef {Object} Zone
 * @property {string} id - Unique identifier for the zone
 * @property {string} name - Name of the zone
 * @property {string} regionId - Reference to the parent region
 * @property {Object} boundaries - GeoJSON geometry data for the zone
 * @property {string} type - Type of the zone (e.g., municipality, district)
 * @property {ZoneSupply[]} supplies - List of supplies in the zone
 */

// This file serves as documentation for the data structures used in the application
// No exports needed as this is just for reference
