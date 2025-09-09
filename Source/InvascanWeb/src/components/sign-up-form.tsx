import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

import { createAccount } from "../services/user"; // or "@/services/user" if your alias is set
import { getToken } from "../services/auth"; // or "@/services/auth"
import { authToken } from "@/lib/auth";
import { authQueryOptions } from "@/queries/auth-query-options.ts";
import { useQueryClient } from "@tanstack/react-query";

const ROLE_IDS: Record<"ADMIN" | "FARMER" | "SME", string> = {
    ADMIN: "25232844-4158-4F87-963F-B5F68F98826F",
    FARMER: "0183C0ED-AA36-48D8-829B-893B9D2ABEE6",
    SME: "6A5FBA39-E25E-47DF-944F-C776F3D9B8A9",
};

export function SignUpForm() {
    const nav = useNavigate();
    const queryClient = useQueryClient();

    const [first, setFirst] = React.useState("");
    const [last, setLast] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [confirm, setConfirm] = React.useState("");
    const [role, setRole] = React.useState<"ADMIN" | "FARMER" | "SME">("FARMER");
    const [consent, setConsent] = React.useState(true);
    const [loading, setLoading] = React.useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!first || !last || !email || !password) return;
        if (password !== confirm) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const username = email.split("@")[0];

            // Build payload (fill optional fields as needed)
            const body = {
                Firstname: first,
                Lastname: last,
                Username: username,
                EmailAddress: email,
                PhoneNumber: "",
                Location: "",
                ExperienceLevel: role,        // or set separately if your backend expects different values
                PrivacySetting: "public",
                ImageSharingConsent: consent,
                RoleId: ROLE_IDS[role],       // ✅ REAL RoleId from your DB
                password,
            };
            console.log("Signup payload:", body);

            const res = await createAccount(body as any);
            if (res?.status === false) throw new Error(res?.statusMessage || "Sign up failed");

            await queryClient.invalidateQueries(authQueryOptions());
            toast.success("Account created");

            // Auto-login
            const tk = await getToken(email, password);
            authToken.set(tk.access_token);
            toast.success("Logged in");

            await nav({ to: "/upload" }); // adjust destination as you like
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || "Sign up failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="w-full max-w-lg" onSubmit={onSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Create an account</CardTitle>
                    <CardDescription>Enter your details below to create your account</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="grid gap-3">
                        <Label htmlFor="first-name">First Name</Label>
                        <Input id="first-name" type="text" placeholder="John" required
                               value={first} onChange={(e) => setFirst(e.target.value)}/>
                    </div>

                    <div className="grid gap-3">
                        <Label htmlFor="last-name">Last Name</Label>
                        <Input id="last-name" type="text" placeholder="Doe" required
                               value={last} onChange={(e) => setLast(e.target.value)}/>
                    </div>

                    <div className="grid gap-3">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="m@example.com" required
                               value={email} onChange={(e) => setEmail(e.target.value)}/>
                    </div>

                    <div className="grid gap-3">
                        <Label htmlFor="role">Role</Label>
                        <Select value={role} onValueChange={(v) => setRole(v as any)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a role"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="FARMER">FARMER</SelectItem>
                                <SelectItem value="SME">SME</SelectItem>
                                <SelectItem value="ADMIN">ADMIN</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-3">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" required
                               value={password} onChange={(e) => setPassword(e.target.value)}/>
                    </div>

                    <div className="grid gap-3">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input id="confirm-password" type="password" required
                               value={confirm} onChange={(e) => setConfirm(e.target.value)}/>
                    </div>

                    <label
                        className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-primary/50 has-[[aria-checked=true]]:bg-primary/25">
                        <Checkbox
                            id="toggle-consent"
                            checked={consent}
                            onCheckedChange={(v) => setConsent(Boolean(v))}
                            className="data-[state=checked]:border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:text-white"
                        />
                        <div className="grid gap-1.5 font-normal">
                            <p className="text-sm leading-none font-medium">Consent to data storage</p>
                            <p className="text-muted-foreground text-sm">
                                I agree to allow this site to store my uploaded images for analysis and database storage purposes.
                            </p>
                        </div>
                    </label>

                    <Button disabled={loading}>{loading ? "Creating…" : "Create Account"}</Button>
                </CardContent>

                <CardFooter className="w-full flex items-center justify-center text-muted-foreground text-sm">
                    Already have an account?&nbsp;
                    <Link to="/login" className="underline underline-offset-4">
                        Login
                    </Link>
                </CardFooter>
            </Card>
        </form>
    );
}
