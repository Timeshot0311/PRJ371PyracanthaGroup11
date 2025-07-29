import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
                        <Label htmlFor='first-name'>First Name</Label>
                        <Input id='first-name' type='text' placeholder='John' required />
                    </div>
                    <div className='grid gap-3'>
                        <Label htmlFor='last-name'>Last Name</Label>
                        <Input id='last-name' type='text' placeholder='Doe' required />
                    </div>
                    <div className='grid gap-3'>
                        <Label htmlFor='email'>Email</Label>
                        <Input id='email' type='email' placeholder='m@example.com' required />
                    </div>
                    <div className='grid gap-3'>
                        <Label htmlFor='profession'>Profession</Label>
                        <Select defaultValue='user'>
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder='User' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='user'>User</SelectItem>
                                <SelectItem value='researcher'>Researcher</SelectItem>
                                <SelectItem value='nature-conservationist'>Nature Conservationist</SelectItem>
                                <SelectItem value='ngo'>NGO</SelectItem>
                            </SelectContent>
                        </Select>
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
