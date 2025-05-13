import ImageUploader from "@/components/image-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartColumn } from "lucide-react";
import Link from "next/link";

export default function HomeIndex() {
  return (
    <div>
      <section className='mx-auto container py-10 max-w-3xl px-4'>
        <header className='flex items-center justify-between'>
          <Link href='/' className='text-xl font-medium'>
            Invascan
          </Link>
          <Button disabled>
            <ChartColumn className='mr-2 h-4 w-4' />
            Analytics (Coming soon)
          </Button>
        </header>
      </section>

      <section className='max-w-3xl mx-auto container px-4 pb-10'>
        <Card>
          <CardHeader>
            <CardTitle>Upload an image</CardTitle>
            <CardDescription>We will analyze your image to identify if it contains Pyracantha.</CardDescription>
          </CardHeader>

          <CardContent className='flex flex-col gap-4 md:flex-none md:grid md:grid-cols-2'>
            <ImageUploader />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
