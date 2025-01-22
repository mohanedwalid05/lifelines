"use client";
import { useState, useEffect } from "react";
import {
  getCurrentUser,
  getOrganization,
  signOutOrganization,
} from "../utils/firebase-utils";
import { useRouter } from "next/navigation";

export default function ProfileIndicator() {
  const [organization, setOrganization] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          const orgData = await getOrganization(user.uid);
          setOrganization(orgData);
        } else {
          setOrganization(null);
        }
      } catch (error) {
        console.error("Error fetching organization:", error);
      }
    };

    fetchOrganization();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOutOrganization();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!organization)
    return (
      <button
        onClick={() => (window.location.href = "/auth/login")}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Login
      </button>
    );

  return (
    <>
      <div className="flex flex-col">
        <span className="text-sm text-gray-500">Signed in as</span>
        <span className="font-semibold text-gray-900">{organization.name}</span>
      </div>
      <button
        onClick={handleSignOut}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
      >
        Sign Out
      </button>
    </>
  );
}
