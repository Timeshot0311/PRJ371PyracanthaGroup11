import { Header } from "@/components/shared/Header.tsx";
import appCss from "@/styles.css?url";
import type { QueryClient } from "@tanstack/react-query";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import TanStackQueryLayout from "../integrations/tanstack-query/layout.tsx";
import { Toaster } from "@/components/ui/sonner";

interface RouterContext {
    queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
    head: () => ({
        meta: [
            {
                charSet: "utf-8",
            },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
            },
            {
                title: "Invascan",
            },
        ],
        links: [
            {
                rel: "stylesheet",
                href: appCss,
            },
            {
                rel: "preconnect",
                href: "https://fonts.googleapis.com",
            },
            {
                rel: "preconnect",
                href: "https://fonts.gstatic.com",
                crossOrigin: "anonymous",
            },
            {
                rel: "stylesheet",
                href: "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap",
            },
        ],
    }),
    component: () => (
        <RootDocument>
            <Outlet />
            <TanStackRouterDevtools />
            <TanStackQueryLayout />
        </RootDocument>
    ),
});

function RootDocument({ children }: { children: React.ReactNode }) {
    return (
        <html lang='en'>
            <head>
                <HeadContent />
            </head>
            <body>
                <main>
                    <div className='h-screen bg-gradient-to-b from-primary/10 to-muted'>
                        <Header />
                        {children}
                    </div>
                </main>
                <Toaster richColors position='top-right' />
                <Scripts />
            </body>
        </html>
    );
}
