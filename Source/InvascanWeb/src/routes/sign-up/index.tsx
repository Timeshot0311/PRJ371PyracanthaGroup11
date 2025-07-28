import { PageLayout } from "@/components/layouts/PageLayout";
import { SignUpForm } from "@/components/sign-up-form";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/sign-up/")({
    component: SignUp,
});

function SignUp() {
    return (
        <PageLayout>
            <div className='w-full flex justify-center pt-16'>
                <SignUpForm />
            </div>
        </PageLayout>
    );
}
