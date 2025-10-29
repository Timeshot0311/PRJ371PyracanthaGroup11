import { authQueryOptions } from "@/queries/auth-query-options";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function useAuth() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const { data: token, isLoading } = useQuery({
    ...authQueryOptions(),
    enabled: isHydrated,
  });

  return {
    token,
    isAuthenticated: Boolean(token),
    isLoading: !isHydrated || isLoading,
    isHydrated,
  };
}
