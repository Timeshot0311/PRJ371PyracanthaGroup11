import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InvascanWeb",
  description: "Application to detect Pyracantha in images",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className='antialiased'>
        {children}
        <Toaster position='top-right' />
      </body>
    </html>
  );
}
