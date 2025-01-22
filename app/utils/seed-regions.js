import { doc, setDoc } from "firebase/firestore";
import db from "../../database/firebase.js";
import { COUNTRIES } from "../data/countries.js";
import { initializeBasicSupplyTypes } from "./firebase-utils.js";

// Collection names
const REGIONS_COLLECTION = "regions";
const ZONES_COLLECTION = "zones";
const BOUNDARIES_COLLECTION = "boundaries";

async function fetchBoundaries(country) {
  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/boundaries/consists-of?id=${country.placeId}&geometry=geometry_1000&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch boundaries for ${country.name}`);
    }

    const data = await response.json();
    return data.features;
  } catch (error) {
    console.error(`Error fetching boundaries for ${country.name}:`, error);
    return null;
  }
}

async function seedRegionAndZones(country) {
  try {
    const features = await fetchBoundaries(country);
    if (!features) return;

    // Create zone documents and collect their references
    const zoneRefs = [];
    for (const feature of features) {
      const zoneName = feature.properties.name;
      const zoneId = `${country.code}-${zoneName
        .replace(/\s+/g, "-")
        .toLowerCase()}`;

      // Store boundaries separately with stringified geometry
      const boundaryId = `boundary-${zoneId}`;
      await setDoc(doc(db, BOUNDARIES_COLLECTION, boundaryId), {
        geometry: JSON.stringify(feature.geometry),
        zoneId: zoneId,
      });

      const zone = {
        id: zoneId,
        name: zoneName,
        regionId: country.code,
        type: feature.properties.type || "Region",
        boundaryId: boundaryId,
        supplies: [],
      };

      await setDoc(doc(db, ZONES_COLLECTION, zoneId), zone);
      zoneRefs.push(zoneId);
      console.log(`Created zone: ${zoneName}`);
    }

    // Create region document
    const region = {
      id: country.code,
      name: country.name,
      code: country.code,
      center: country.center.map(Number),
      zoom: Number(country.zoom),
      zoneRefs,
    };

    await setDoc(doc(db, REGIONS_COLLECTION, country.code), region);
    console.log(`Seeded ${country.name} with ${zoneRefs.length} zones`);
  } catch (error) {
    console.error(`Error seeding ${country.name}:`, error);
  }
}

export async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Initialize supply types first
    await initializeBasicSupplyTypes();
    console.log("Supply types initialized");

    // Seed each country/region
    for (const country of COUNTRIES) {
      await seedRegionAndZones(country);
    }

    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Uncomment and run this function to seed the database
// seedDatabase();
