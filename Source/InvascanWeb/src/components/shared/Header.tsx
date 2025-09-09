import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { BarChart3, Leaf, LogInIcon, LogOutIcon, Users } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authQueryOptions } from "@/queries/auth-query-options.ts";
import { authToken } from "@/lib/auth.ts";

export function Header() {
    const { data: token } = useQuery(authQueryOptions());
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return (
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <Leaf className="h-8 w-8 text-primary"/>
                        <h1 className="text-2xl font-bold text-foreground hidden md:flex">Invascan</h1>
                    </Link>
                    <nav className="flex items-center gap-4">
                        <Link to="/community">
                            <Button variant="ghost" className="flex items-center gap-2">
                                <Users className="size-4"/>
                                <span className="hidden md:flex">Community</span>
                            </Button>
                        </Link>
                        <Link to="/analytics">
                            <Button variant="ghost" className="flex items-center gap-2">
                                <BarChart3 className="size-4"/>
                                <span className="hidden md:flex">Analytics</span>
                            </Button>
                        </Link>
                        {token ? (
                            <Button variant="ghost" className="flex items-center gap-2"
                                    onClick={async () => {
                                        authToken.clear();
                                        await queryClient.invalidateQueries(authQueryOptions());
                                        await navigate({
                                            to: "/"
                                        });
                                    }}
                            >
                                <LogOutIcon className="size-4"/>
                                Sign out
                            </Button>
                        ) : (
                            <Link to="/login">
                                <Button variant="ghost" className="flex items-center gap-2">
                                    <LogInIcon className="size-4"/>
                                    Login
                                </Button>
                            </Link>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}
