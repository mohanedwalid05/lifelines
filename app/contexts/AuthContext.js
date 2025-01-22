"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getOrganization } from "../utils/firebase-utils";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const orgData = await getOrganization(user.uid);
          setOrganization(orgData);
        } catch (error) {
          console.error("Error fetching organization data:", error);
          setOrganization(null);
        }
      } else {
        setOrganization(null);
      }
      setLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ organization, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
