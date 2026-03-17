import "./globals.css";

import type { Metadata } from "next";
import { DM_Serif_Display, Outfit } from "next/font/google";
import { Providers } from "./providers";

const headingFont = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-heading"
});

const bodyFont = Outfit({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "Earl's Landscaping | Professional Landscaping Services",
  description:
    "Professional landscaping services for residential and commercial properties"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body>
        {children}
        <Providers />
      </body>
    </html>
  );
}
