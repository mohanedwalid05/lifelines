/**
 * @typedef {Object} Organization
 * @property {string} id - Unique identifier
 * @property {string} name - Organization name
 * @property {string} email - Organization email
 * @property {string} website - Organization website (optional)
 * @property {string} contactPhone - Contact phone number (optional)
 * @property {string[]} supplyTypes - Array of supply type IDs they can provide
 * @property {string[]} countries - Array of country codes they can operate in
 * @property {number} credibility - Rating from 1-5
 * @property {Donation[]} donations - Array of donations made by the organization
 */

/**
 * @typedef {Object} Donation
 * @property {string} id - Unique identifier
 * @property {string} organizationId - Reference to the organization
 * @property {string} zoneId - Reference to the zone
 * @property {string} supplyTypeId - Reference to the supply type
 * @property {number} quantity - Amount donated
 * @property {'pending' | 'approved' | 'delivered'} status - Current status of the donation
 * @property {Date} createdAt - When the donation was made
 * @property {Date} updatedAt - When the donation status was last updated
 */

// This file serves as documentation for the data structures
// No exports needed as this is just for reference
