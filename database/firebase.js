// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC9KFOr24pnzsisdw3YsIJ5QoXDi3oOn38",
  authDomain: "sos-lifelines.firebaseapp.com",
  projectId: "sos-lifelines",
  storageBucket: "sos-lifelines.firebasestorage.app",
  messagingSenderId: "594808527518",
  appId: "1:594808527518:web:632bf167a54bed0f82798f",
};

// Initialize Firebase
let app;
let db;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}

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
