"use client";

import Image from "next/image";
import db from "../../database/firebase.js";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";

export default function Test() {
  const [userData, setUserData] = useState(null);

  const getFirebaseData = async () => {
    try {
      console.log(db);
      const data = await getDoc(doc(db, "users", "7PXm7SSUcQxYspWkgMDu"));
      setUserData(data.data());
      console.log(data.data());
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <button
        onClick={getFirebaseData}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Get Data
      </button>

      {userData && (
        <div className="mt-4 p-4 border rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-2">User Data:</h2>
          <pre className="bg-gray-800 p-4 rounded">
            {JSON.stringify(userData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
