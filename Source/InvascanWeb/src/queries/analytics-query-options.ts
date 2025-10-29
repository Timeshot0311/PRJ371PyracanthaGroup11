import { queryOptions } from "@tanstack/react-query";
import { getAllProvinceStats } from "@/services/reports";

export const analyticsQueryOptions = () =>
  queryOptions({
    queryKey: ["analytics", "provinces"],
    queryFn: async () => {
      const res = await getAllProvinceStats();
      // unwrap common envelope shape
      return Array.isArray(res) ? res : (res?.dynamicModel ?? []);
    },
    staleTime: 60_000,
    retry(failureCount, error: any) {
      // don't retry unauthenticated
      if (error?.status === 401) return false;
      return failureCount < 2;
    },
  });
