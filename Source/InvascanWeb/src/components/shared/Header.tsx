import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { BarChart3, Leaf, LogInIcon, Users } from "lucide-react";

export function Header() {
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
                        <Link to="/login">
                            <Button variant="ghost" className="flex items-center gap-2">
                                <LogInIcon className="size-4"/>
                                Login
                            </Button>
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
}
