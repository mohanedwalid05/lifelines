import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import db from "../../database/firebase.js";

// Collection names
const SUPPLY_TYPES_COLLECTION = "supply_types";
const ZONES_COLLECTION = "zones";
const REGIONS_COLLECTION = "regions";
const BOUNDARIES_COLLECTION = "boundaries";

// Basic supply types
const BASIC_SUPPLY_TYPES = [
  { name: "Food" },
  { name: "Water" },
  { name: "Medical" },
  { name: "Shelter" },
  { name: "Hygiene" },
];

// Region Functions
export async function getRegion(regionId) {
  try {
    const docRef = doc(db, REGIONS_COLLECTION, regionId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      console.log("No region found with ID:", regionId);
      return null;
    }
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error("Error getting region:", error);
    throw error;
  }
}

export async function getZonesForRegion(regionId) {
  try {
    // First get the region to get zoneRefs
    const region = await getRegion(regionId);
    console.log("Region data:", region);

    if (!region || !region.zoneRefs) {
      console.log("No zones found for region:", regionId);
      return [];
    }

    // Fetch each zone and its boundary
    const zones = [];
    for (const zoneId of region.zoneRefs) {
      console.log("Processing zone:", zoneId);
      const zoneDoc = await getDoc(doc(db, ZONES_COLLECTION, zoneId));
      if (zoneDoc.exists()) {
        const zoneData = zoneDoc.data();
        console.log("Zone data:", zoneData);

        // Get the boundary data
        const boundaryDoc = await getDoc(
          doc(db, BOUNDARIES_COLLECTION, zoneData.boundaryId)
        );
        if (boundaryDoc.exists()) {
          const boundaryData = boundaryDoc.data();
          console.log("Raw boundary data:", boundaryData);

          try {
            // Parse the geometry string back to JSON
            const geometry = JSON.parse(boundaryData.geometry);
            console.log("Parsed geometry:", geometry);

            zones.push({
              ...zoneData,
              boundaries: geometry,
            });
          } catch (parseError) {
            console.error(
              "Error parsing geometry for zone:",
              zoneId,
              parseError
            );
            // Continue with next zone if parsing fails
            continue;
          }
        } else {
          console.log("No boundary found for zone:", zoneId);
        }
      } else {
        console.log("Zone not found:", zoneId);
      }
    }
    console.log("Final zones array:", zones);
    return zones;
  } catch (error) {
    console.error("Error getting zones for region:", error);
    throw error;
  }
}

// Supply Types Functions
export async function initializeBasicSupplyTypes() {
  try {
    console.log("Starting supply types initialization...");
    const collectionRef = collection(db, SUPPLY_TYPES_COLLECTION);

    for (const supplyType of BASIC_SUPPLY_TYPES) {
      console.log("Creating supply type:", supplyType);
      const docRef = await addDoc(collectionRef, supplyType);
      console.log("Created supply type with ID:", docRef.id);
    }

    console.log("All supply types initialized successfully");
  } catch (error) {
    console.error("Error initializing supply types:", error);
    throw error;
  }
}

export async function getAllSupplyTypes() {
  const querySnapshot = await getDocs(collection(db, SUPPLY_TYPES_COLLECTION));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getSupplyType(id) {
  const docRef = doc(db, SUPPLY_TYPES_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

// Zone Functions
export async function getZone(id) {
  const docRef = doc(db, ZONES_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

export async function updateZoneSupplies(zoneId, supplies) {
  const zoneRef = doc(db, ZONES_COLLECTION, zoneId);
  await updateDoc(zoneRef, { supplies });
}

export async function createOrUpdateZone(zone) {
  const zoneRef = doc(db, ZONES_COLLECTION, zone.id);
  await setDoc(zoneRef, zone);
}

// Helper function to initialize a zone with empty supplies
export async function initializeZoneSupplies(zoneId) {
  const supplyTypes = await getAllSupplyTypes();
  const supplies = supplyTypes.map((type) => ({
    supplyTypeId: type.id,
    quantity: 0,
    need: 0,
    lastUpdated: new Date(),
  }));

  await updateZoneSupplies(zoneId, supplies);
}
