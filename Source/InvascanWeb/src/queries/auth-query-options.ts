import { queryOptions } from "@tanstack/react-query";
import { authToken } from "@/lib/auth";

export const authQueryOptions = () =>
  queryOptions({
    queryKey: ["auth"],
    queryFn: () => {
      if (typeof window === "undefined") return null; // SSR-safe
      return authToken.get(); // sync read from localStorage
    },
    staleTime: Infinity,
    // Prevent automatic refetch on mount to reduce flashing
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    // Only fetch once when component first mounts
    refetchOnReconnect: false,
  });
