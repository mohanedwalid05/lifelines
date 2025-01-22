import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  arrayUnion,
} from "firebase/firestore";
import db from "../../database/firebase.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

// Collection names
const SUPPLY_TYPES_COLLECTION = "supply_types";
const ZONES_COLLECTION = "zones";
const REGIONS_COLLECTION = "regions";
const BOUNDARIES_COLLECTION = "boundaries";
const ORGANIZATIONS_COLLECTION = "organizations";
const DONATIONS_COLLECTION = "donations";

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
      return null;
    }
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    throw error;
  }
}

export async function getZonesForRegion(regionId) {
  try {
    const region = await getRegion(regionId);

    if (!region || !region.zoneRefs) {
      return [];
    }

    const zones = [];
    for (const zoneId of region.zoneRefs) {
      const zoneDoc = await getDoc(doc(db, ZONES_COLLECTION, zoneId));
      if (zoneDoc.exists()) {
        const zoneData = zoneDoc.data();

        const boundaryDoc = await getDoc(
          doc(db, BOUNDARIES_COLLECTION, zoneData.boundaryId)
        );
        if (boundaryDoc.exists()) {
          const boundaryData = boundaryDoc.data();
          try {
            const geometry = JSON.parse(boundaryData.geometry);
            zones.push({
              ...zoneData,
              boundaries: geometry,
            });
          } catch (parseError) {
            continue;
          }
        }
      }
    }
    return zones;
  } catch (error) {
    throw error;
  }
}

// Supply Types Functions
export async function initializeBasicSupplyTypes() {
  try {
    const collectionRef = collection(db, SUPPLY_TYPES_COLLECTION);
    for (const supplyType of BASIC_SUPPLY_TYPES) {
      await addDoc(collectionRef, supplyType);
    }
  } catch (error) {
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

// Organization Functions
export async function createOrganization(userData) {
  try {
    const auth = getAuth();
    // Create authentication account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );

    // Create organization document
    const organizationData = {
      id: userCredential.user.uid,
      name: userData.organizationName,
      email: userData.email,
      website: userData.website || null,
      contactPhone: userData.contactPhone || null,
      supplyTypes: userData.supplyTypes,
      countries: userData.countries,
      credibility: Math.floor(Math.random() * 5) + 1, // Random 1-5
      donations: [],
      createdAt: new Date(),
    };

    await setDoc(
      doc(db, ORGANIZATIONS_COLLECTION, userCredential.user.uid),
      organizationData
    );
    return organizationData;
  } catch (error) {
    throw error;
  }
}

export async function signInOrganization(email, password) {
  try {
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const organizationDoc = await getDoc(
      doc(db, ORGANIZATIONS_COLLECTION, userCredential.user.uid)
    );

    if (!organizationDoc.exists()) {
      throw new Error("Organization not found");
    }

    const organizationData = {
      id: organizationDoc.id,
      ...organizationDoc.data(),
    };
    return organizationData;
  } catch (error) {
    if (error.code === "auth/invalid-credential") {
      throw new Error("Invalid email or password");
    }
    throw error;
  }
}

export async function signOutOrganization() {
  try {
    const auth = getAuth();
    await signOut(auth);
  } catch (error) {
    throw error;
  }
}

export async function getOrganization(id) {
  try {
    const docRef = doc(db, ORGANIZATIONS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return null;
    }
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    throw error;
  }
}

export function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      reject
    );
  });
}

export function isLoggedIn() {
  const auth = getAuth();
  return auth.currentUser !== null;
}

export async function createDonation(donationData) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User must be logged in to make a donation");
    }

    // Create the donation document
    const donationRef = await addDoc(collection(db, DONATIONS_COLLECTION), {
      organizationId: user.uid,
      ...donationData,
      status: "delivered",
      createdAt: new Date(),
    });

    // Update the organization's lastDonationRegion
    const orgRef = doc(db, ORGANIZATIONS_COLLECTION, user.uid);
    await updateDoc(orgRef, {
      lastDonationRegion: donationData.regionCode,
      donations: arrayUnion(donationRef.id),
    });

    // Update zone supplies
    const zoneRef = doc(db, `zones/${donationData.zoneId}`);
    const zoneDoc = await getDoc(zoneRef);

    if (!zoneDoc.exists()) {
      throw new Error("Zone not found");
    }

    const zoneData = zoneDoc.data();
    const supplies = zoneData.supplies || [];

    // Find existing supply or create new one
    const supplyIndex = supplies.findIndex(
      (s) => s.supplyTypeId === donationData.supplyTypeId
    );

    if (supplyIndex >= 0) {
      supplies[supplyIndex].quantity += parseInt(donationData.quantity);
      supplies[supplyIndex].lastUpdated = new Date();
    } else {
      supplies.push({
        supplyTypeId: donationData.supplyTypeId,
        quantity: parseInt(donationData.quantity),
        lastUpdated: new Date(),
      });
    }

    await updateDoc(zoneRef, {
      supplies: supplies,
    });

    return donationRef.id;
  } catch (error) {
    throw error;
  }
}
