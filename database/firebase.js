// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test function to verify connection and configuration
export async function testConnection() {
  try {
    // Log the configuration (without sensitive data)
    console.log("Firebase Config:", {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      storageBucket: firebaseConfig.storageBucket,
    });

    // Test database connection by trying to list collections
    const testCollection = collection(db, "users");
    const snapshot = await getDocs(testCollection);

    return {
      success: true,
      message: "Firebase connection successful",
      details: {
        documentsCount: snapshot.size,
        collections: ["users"],
        app: app.name,
        databaseInstance: !!db,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "Firebase connection failed",
      error: error.message,
      details: {
        code: error.code,
        stack: error.stack,
      },
    };
  }
}

export default db;
