import { queryOptions } from "@tanstack/react-query";
import { $getCommunityFeed } from "@/server/functions/get-community.tsx";

export const communityPostsQueryOptions = () =>
    queryOptions({
        queryKey: ["community", "feed"],
        queryFn: async () => await $getCommunityFeed(),
        //Change this later
        staleTime: Infinity,
    });