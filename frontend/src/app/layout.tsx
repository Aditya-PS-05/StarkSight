import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { StarknetProvider } from "@/context/StarknetProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StarkSight — AI-Powered Private Portfolio Guardian",
  description:
    "Privacy-preserving AI portfolio analysis on Starknet. Get risk scores, shield actions, and on-chain attestations without exposing your holdings.",
  keywords: ["Starknet", "DeFi", "Privacy", "Bitcoin", "WBTC", "ZK", "AI", "Portfolio", "Risk"],
  openGraph: {
    title: "StarkSight — AI-Powered Private Portfolio Guardian",
    description: "Know Your Risk. Keep Your Privacy. AI portfolio analysis on Starknet.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <StarknetProvider>{children}</StarknetProvider>
      </body>
    </html>
  );
}
