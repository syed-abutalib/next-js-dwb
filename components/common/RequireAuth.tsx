"use client";

import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/Auth";
import { useRouter } from "next/navigation";

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, token } = useContext(AuthContext);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Small delay to ensure auth context is loaded
    const timer = setTimeout(() => {
      if (!user || !token) {
        router.push(`/login?returnUrl=${window.location.pathname}`);
      }
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [user, token, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return user && token ? <>{children}</> : null;
};

export default RequireAuth;