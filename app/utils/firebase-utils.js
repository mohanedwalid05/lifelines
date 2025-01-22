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

// Basic supply types
const BASIC_SUPPLY_TYPES = [
  { name: "Food" },
  { name: "Water" },
  { name: "Medical" },
  { name: "Shelter" },
  { name: "Hygiene" },
];

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
