import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";

export function SignUpForm() {
    return (
        <form className='w-full max-w-lg'>
            <Card>
                <CardHeader>
                    <CardTitle>Create an account</CardTitle>
                    <CardDescription>Enter your details below to create your account</CardDescription>
                </CardHeader>
                <CardContent className='flex flex-col gap-4'>
                    <div className='grid gap-3'>
                        <Label htmlFor='username'>Username</Label>
                        <Input id='username' type='text' placeholder='Concerned citizen' required />
                    </div>
                    <div className='grid gap-3'>
                        <Label htmlFor='email'>Email</Label>
                        <Input id='email' type='email' placeholder='m@example.com' required />
                    </div>
                    <div className='grid gap-3'>
                        <Label htmlFor='password'>Password</Label>
                        <Input id='password' type='password' required />
                    </div>
                    <div className='grid gap-3'>
                        <Label htmlFor='confirm-password'>Confirm Password</Label>
                        <Input id='confirm-password' type='password' required />
                    </div>
                    <div className='grid gap-3'>
                        <Label className='hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-primary/50 has-[[aria-checked=true]]:bg-primary/25'>
                            <Checkbox
                                id='toggle-consent'
                                defaultChecked
                                className='data-[state=checked]:border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:text-white'
                            />
                            <div className='grid gap-1.5 font-normal'>
                                <p className='text-sm leading-none font-medium'>Consent to data storage</p>
                                <p className='text-muted-foreground text-sm'>
                                    I agree to allow this site to store my uploaded images for analysis and database
                                    storage purposes.
                                </p>
                            </div>
                        </Label>
                    </div>
                    <Button>Create Account</Button>
                </CardContent>
                <CardFooter className='w-full flex items-center justify-center text-muted-foreground text-sm'>
                    Already have an account?&nbsp;
                    <Link to='/login' className='underline underline-offset-4'>
                        Login
                    </Link>
                </CardFooter>
            </Card>
        </form>
    );
}
