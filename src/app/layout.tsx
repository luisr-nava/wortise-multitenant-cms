import { Inter } from "next/font/google"; // Saas specific font
import TrpcProvider from "@/components/providers/TrpcProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { ConfirmProvider } from "@/components/providers/ConfirmProvider";
import "./globals.css"; // Ensure global CSS is imported for base styles

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "CMS Blog - Modern SaaS Platform",
  description: "A premium multi-tenant CMS built for scale.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full bg-black`}
      suppressHydrationWarning>
      <body
        className={`antialiased bg-black text-white font-sans min-h-screen flex flex-col`}>
        <TrpcProvider>
          <ConfirmProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <Toaster position="bottom-right" theme="system" />
          </ConfirmProvider>
        </TrpcProvider>
      </body>
    </html>
  );
}

