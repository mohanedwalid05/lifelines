import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { seedDatabase } from "../app/utils/seed-regions.js";
import { testConnection } from "../database/firebase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, "../.env.local");

config({ path: envPath });

// Log environment variables (without sensitive values)
console.log("Environment check:", {
  hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  hasAuthDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
});

console.log("Testing Firebase connection...");
testConnection()
  .then(async (result) => {
    if (result.success) {
      console.log("Firebase connection successful:", result);
      console.log("Starting the seeding process...");
      await seedDatabase();
    } else {
      console.error("Firebase connection failed:", result);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
