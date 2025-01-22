"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { organization, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !organization) {
      router.push("/auth/login");
    }
  }, [organization, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return organization ? children : null;
}
