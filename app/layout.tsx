import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Inter,
  Newsreader,
  Space_Grotesk,
  Manrope,
} from "next/font/google";
import "./globals.css";
import QueryProvider from "./providers/QueryProvider";

import "rsuite/dist/rsuite-no-reset.min.css";
import { CustomProvider } from "rsuite";
import { ClerkProvider } from "@clerk/nextjs";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const headline = Newsreader({
  variable: "--font-headline",
  subsets: ["latin"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const label = Space_Grotesk({
  variable: "--font-label",
  subsets: ["latin"],
});

const prose = Manrope({
  variable: "--font-prose",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fabley",
  description: "Create your fable",
  icons: {
    icon: "/bonfire.png", // Points to /public/icon.png
    shortcut: "/bonfire.png",
    apple: "/bonfire.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${prose.variable} rs-theme-dark bg-base-100`}
      >
        <ClerkProvider>
          <CustomProvider>
            <QueryProvider>{children}</QueryProvider>
          </CustomProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
