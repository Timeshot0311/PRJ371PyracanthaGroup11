import { queryOptions } from "@tanstack/react-query";
import { authToken } from "@/lib/auth.ts";

export const authQueryOptions = () =>
    queryOptions({
        queryKey: ["auth"],
        queryFn: () => authToken.get(),
        staleTime: Infinity
    });
