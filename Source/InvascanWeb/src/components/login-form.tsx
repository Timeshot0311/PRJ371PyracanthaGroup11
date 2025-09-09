import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

// client helpers
import { getToken } from "../services/auth"; // keep this import path as you had it
import { getMyProfile } from "@/services/user";
import { authToken } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { authQueryOptions } from "@/queries/auth-query-options.ts";

export function LoginForm() {
    const nav = useNavigate();
    const queryClient = useQueryClient();
    const [username, setUsername] = React.useState(""); // <-- use USERNAME (not email)
    const [password, setPassword] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const u = username.trim();
        const p = password;
        if (!u || !p) return;

        setLoading(true);
        try {
            // 1) fetch token from /api/token (expects username + password)
            const tokenResp = await getToken(u, p);
            authToken.set(tokenResp.access_token);

            // 2) sanity check: fetch profile using token
            const me = await getMyProfile(tokenResp.access_token);
            await queryClient.invalidateQueries(authQueryOptions());
            toast.success(`Welcome back, ${me.Firstname || me.Username || "user"}!`);

            // 3) go somewhere useful
            await nav({ to: "/upload" });
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || "Login failed");
            authToken.clear();
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="w-full max-w-lg" onSubmit={onSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>Enter your credentials to log in</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="grid gap-3">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="invascan"
                            required
                            autoComplete="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-3">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <Button disabled={loading}>{loading ? "Logging in…" : "Login"}</Button>
                </CardContent>
                <CardFooter className="w-full flex items-center justify-center text-muted-foreground text-sm">
                    Don't have an account?&nbsp;
                    <Link to="/sign-up" className="underline underline-offset-4">
                        Sign up
                    </Link>
                </CardFooter>
            </Card>
        </form>
    );
}
