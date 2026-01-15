import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/ui/layout/Navbar";
import Footer from "@/components/ui/layout/Footer";
import { WebVitals } from "./web-vitals";
import {  burbankFont } from "@/lib/fonts";
import NextTopLoader from "nextjs-toploader";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Brik - The Future of Real-World Asset Swapping",
  description: "Swap your crypto assets for tokenized metals, commodities, and other real-world assets — seamlessly and securely.",
  keywords: [
    'real-world assets',
    'RWA',
    'tokenized assets',
    'crypto swap',
    'DeFi',
    'blockchain',
    'tokenized gold',
    'tokenized commodities'
  ],
  icons:{
    icon:{
      url:"/images/new/logo1.jpg",
    }
  },
  metadataBase: new URL('https://brik.gg'),

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://brik.gg',
    siteName: 'Brik',
    title: 'Brik - The Future of Real-World Asset Swapping',
    description: 'Swap your crypto assets for tokenized metals, commodities, and other real-world assets — seamlessly and securely.',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Brik - Real-World Asset Swapping Platform',
      },
    ],
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    site: '@BrikRWA',
    creator: '@BrikRWA',
  },

  // Robots
  robots: {
    index: true,
    follow: true,
  },

  // Verification
  verification: {
    google: 'google-site-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* React Grab - TEMPORARILY DISABLED due to infinite recursion bug */}
        {/* {process.env.NODE_ENV === "development" && (
          <Script
            src="https://unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
            data-enabled="true"
          />
        )} */}
        {/* DNS Prefetch and Preconnect for external resources */}
        <link rel="preconnect" href="https://coin-images.coingecko.com" />
        <link rel="preconnect" href="https://cryptologos.cc" />
        <link rel="dns-prefetch" href="https://li.quest" />
        <link rel="dns-prefetch" href="https://api.web3modal.org" />
        <link rel="dns-prefetch" href="https://registry.npmjs.org" />
      </head>
      <body
        className={`${inter.variable}  ${burbankFont.variable} antialiased`}
      >
        <WebVitals />
        <NextTopLoader
          color="#e6ee0a"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl
          showSpinner={false}
          easing="ease-out"
          speed={400}
          shadow="0 0 10px rgba(236, 72, 153, 0.7), 0 0 5px rgba(168, 85, 247, 0.7)"
          zIndex={9999}
        />
        <Providers>
          <Navbar />
          {/* Add padding-top to account for fixed navbar */}
          <div className="q">{children}</div>
          <Footer />
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}

