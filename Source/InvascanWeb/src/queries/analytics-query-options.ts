import { queryOptions } from "@tanstack/react-query";
import { $getAnalytics } from "@/server/functions/get-analytics.tsx";

export const analyticsQueryOptions = () =>
    queryOptions({
        queryKey: ["analytics"],
        queryFn: async () => await $getAnalytics(),
        //Change this later
        staleTime: Infinity,
    });