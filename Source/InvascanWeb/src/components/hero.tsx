import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRightIcon, CheckCircle, Upload, Zap } from "lucide-react";

export function Hero() {
    return (
        <div className='grid lg:grid-cols-2 gap-12 items-center'>
            <div className='flex flex-col gap-y-6'>
                <Badge variant='outline' className='py-1 text-primary'>
                    <Zap className='size-5 mr-2' />
                    AI Powered Detections
                </Badge>

                <h1 className='text-4xl md:text-6xl font-bold leading-tight'>
                    Detect{" "}
                    <span className='text-primary relative'>
                        invasive species
                        <div className='absolute -bottom-2 left-0 right-0 h-3 bg-primary/25 -skew-y-1 -z-10' />
                    </span>{" "}
                    instantly
                </h1>

                <p className='text-xl text-gray-600 leading-relaxed'>
                    Protect your ecosystem with our AI powered detection system. Upload a plant image and get instant
                    identification of invasive species like{" "}
                    <span className='font-semibold text-primary'>Pyracantha</span>, complete with confidence scores and
                    species labels.
                </p>

                <div className='flex flex-col sm:flex-row gap-4 mt-4'>
                    <Link to='/upload' className={buttonVariants({ variant: "default" })}>
                        <Upload className='size-4 mr-2' />
                        Upload Image
                    </Link>
                    <Link to='/login' className={buttonVariants({ variant: "outline" })}>
                        Get Started Today
                        <ArrowRightIcon className='size-4 ml-2' />
                    </Link>
                </div>

                <div className='flex items-center gap-8 mt-8 text-sm text-gray-600'>
                    <div className='flex items-center gap-2'>
                        <CheckCircle className='size-5 text-primary' />
                        <span>High Accuracy</span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <CheckCircle className='size-5 text-primary' />
                        <span>Instant Results</span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <CheckCircle className='size-5 text-primary' />
                        <span>Free to Try</span>
                    </div>
                </div>
            </div>

            <div className='relative'>
                <div className='rounded-2xl p-8'>
                    <img src='/image.jpeg' alt='Image containing invasive plant' className='w-full h-auto rounded-sm' />
                    <Badge className='absolute bottom-4 right-4 py-1 bg-white' variant={"outline"}>
                        <div className='flex items-center gap-3'>
                            <div className='size-3 bg-primary rounded-full animate-pulse'></div>
                            <span className='text-sm font-medium text-muted-foreground'>Analyzing image...</span>
                        </div>
                    </Badge>
                </div>
            </div>
        </div>
    );
}
