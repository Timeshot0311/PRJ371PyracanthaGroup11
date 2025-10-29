import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { authToken } from "@/lib/auth.ts";
import { authQueryOptions } from "@/queries/auth-query-options.ts";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { BarChart3, Leaf, LogInIcon, LogOutIcon, Users } from "lucide-react";

export function Header() {
  const { token, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground hidden md:flex">
              Invascan
            </h1>
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/community">
              <Button variant="ghost" className="flex items-center gap-2">
                <Users className="size-4" />
                <span className="hidden md:flex">Community</span>
              </Button>
            </Link>
            <Link to="/analytics">
              <Button variant="ghost" className="flex items-center gap-2">
                <BarChart3 className="size-4" />
                <span className="hidden md:flex">Analytics</span>
              </Button>
            </Link>

            {!isLoading &&
              (isAuthenticated ? (
                <Button
                  variant="ghost"
                  className="flex items-center gap-2"
                  onClick={() => {
                    authToken.clear();
                    queryClient.setQueryData(authQueryOptions().queryKey, null);
                    navigate({ to: "/" });
                  }}
                >
                  <LogOutIcon className="size-4" />
                  Sign out
                </Button>
              ) : (
                <Link to="/login">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <LogInIcon className="size-4" />
                    Login
                  </Button>
                </Link>
              ))}

            {/* Loading placeholder */}
            {isLoading && (
              <div className="w-[88px] h-10 bg-muted animate-pulse rounded" />
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
