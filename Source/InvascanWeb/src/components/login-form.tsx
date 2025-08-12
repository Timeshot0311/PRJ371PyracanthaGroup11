import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";
export function LoginForm() {
    return (
        <form className='w-full max-w-lg'>
            <Card>
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>Enter your details below to login to your account</CardDescription>
                </CardHeader>
                <CardContent className='flex flex-col gap-4'>
                    <div className='grid gap-3'>
                        <Label htmlFor='email'>Email</Label>
                        <Input id='email' type='email' placeholder='m@example.com' required />
                    </div>
                    <div className='grid gap-3'>
                        <Label htmlFor='password'>Password</Label>
                        <Input id='password' type='password' required />
                    </div>
                    <Button>Login</Button>
                </CardContent>
                <CardFooter className='w-full flex items-center justify-center text-muted-foreground text-sm'>
                    Don't have an account?&nbsp;
                    <Link to='/sign-up' className='underline underline-offset-4'>
                        Sign up
                    </Link>
                </CardFooter>
            </Card>
        </form>
    );
}
