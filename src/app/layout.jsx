import { Geist, Geist_Mono } from "next/font/google";
import { Public_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const publicSans = Public_Sans({
    variable: "--font-sans",
    subsets: ["latin"],
    display: "swap",
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "Punjab National Bank",
    description: "Punjab National Bank - Merchant Web Application Portal",
};

export default function RootLayout({ children }) {
    return (
        <html
            lang="en"
            // className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
            className={`${publicSans.variable} font-sans h-full antialiased`}
            suppressHydrationWarning
        >
            <body className="min-h-full flex flex-col">
                <Providers>
                    {children}
                    <Toaster />
                </Providers>
            </body>
        </html>
    );
}
