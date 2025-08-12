import { buttonVariants } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Leaf } from "lucide-react";

export function Header() {
    return (
        <nav className='border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex justify-between items-center h-16'>
                    <div className='flex items-center gap-2'>
                        <Leaf className='size-8 text-primary' />
                        <Link to='/' className='text-xl font-bold'>
                            Invascan
                        </Link>
                    </div>
                    <div className='hidden md:flex items-center gap-6'>
                        <Link to='/upload' className='hover:underline underline-offset-4'>
                            Upload Image
                        </Link>
                        <Link to='/' className='hover:underline underline-offset-4'>
                            Community
                        </Link>
                        <Link to='/' className='hover:underline underline-offset-4'>
                            Analytics
                        </Link>
                        <Link to='/login' className={buttonVariants({ variant: "default" })}>
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
