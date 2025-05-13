import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadIcon } from "lucide-react";
import Link from "next/link";

export default function HomeIndex() {
  return (
    <div>
      <section className='mx-auto container py-10 max-w-3xl px-4'>
        <header className='flex items-center justify-between'>
          <Link href='/' className='text-xl font-medium'>
            Invascan
          </Link>
          <Button asChild>
            <Link href='/'>
              <UploadIcon className='mr-2 h-4 w-4' />
              Analyze image
            </Link>
          </Button>
        </header>
      </section>

      <section className='max-w-3xl mx-auto container px-4 pb-10'>
        <Card className='border-none shadow-none'>
          <CardHeader>
            <CardTitle>Pyracantha detection analytics</CardTitle>
            <CardDescription>Visualize geographic distribution and analytics for Pyracantha</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4 w-full'>
            <div className='flex flex-row gap-2'>
              <Input type='text' placeholder='Western Cape, South Africa' className='truncate placeholder:truncate' />
              <Button>Search</Button>
            </div>
            <div>Heatmap here maybe</div>
            <div>some heatmap stats below it maybe</div>
            <Tabs defaultValue='tab-1' className='w-full'>
              <TabsList className='bg-transparent w-full'>
                <TabsTrigger
                  value='tab-1'
                  className='data-[state=active]:shadow-none data-[state=active]:border-b-black focus-visible:border-none'
                >
                  Tab 1 (graphs maybe)
                </TabsTrigger>
                <TabsTrigger
                  value='tab-2'
                  className='data-[state=active]:shadow-none data-[state=active]:border-b-black focus-visible:border-none'
                >
                  Tab 2 (graphs maybe)
                </TabsTrigger>
              </TabsList>
              <TabsContent value='tab-1'>Tab 1 content</TabsContent>
              <TabsContent value='tab-2'>Tab 2 content</TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
