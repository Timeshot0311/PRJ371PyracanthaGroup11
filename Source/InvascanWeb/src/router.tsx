import { createRouter as createTanstackRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import * as TanstackQuery from "./integrations/tanstack-query/root-provider";
import { routeTree } from "@/routeTree.gen";
import { dehydrate, hydrate } from "@tanstack/react-query";

export const createRouter = () => {
    const { queryClient } = TanstackQuery.getContext();
    const router = routerWithQueryClient(
        createTanstackRouter({
            routeTree,
            context: {
                queryClient,
            },
            scrollRestoration: true,
            defaultPreloadStaleTime: 0,
            dehydrate: () => {
                return {
                    queryClientState: dehydrate(queryClient),
                };
            },
            hydrate: (dehydrated) => {
                hydrate(queryClient, dehydrated.queryClientState);
            },
        }),
        queryClient
    );

    return router;
};

declare module "@tanstack/react-router" {
    interface Register {
        router: ReturnType<typeof createRouter>;
    }
}
