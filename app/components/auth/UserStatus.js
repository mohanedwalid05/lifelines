"use client";
import { useState, useEffect } from "react";
import { getCurrentUser, getOrganization } from "../../utils/firebase-utils";

export default function UserStatus() {
  const [organization, setOrganization] = useState(null);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          const orgData = await getOrganization(user.uid);
          setOrganization(orgData);
        }
      } catch (error) {
        console.error("Error fetching organization:", error);
      }
    };

    fetchOrganization();
  }, []);

  if (!organization) return null;

  return (
    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-md flex items-center">
      <span className="mr-2">✓</span>
      Signed in as: {organization.name}
    </div>
  );
}
