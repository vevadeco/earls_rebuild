import "./globals.css";

import type { Metadata } from "next";
import { DM_Serif_Display, Outfit } from "next/font/google";
import Script from "next/script";

import { MetaPixelPageView } from "@/components/MetaPixelPageView";
import { META_PIXEL_ID } from "@/lib/metaPixel";

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

const siteTitle = "Earl's Landscaping | Professional Landscaping Services";
const siteDescription =
  "Professional landscaping services for residential and commercial properties";
const siteUrl = "https://www.earlslandscaping.ca";
const ogImageUrl = `${siteUrl}/og-snow-removal.jpg`;
const ogImageAlt = "A plow truck and snow blower clearing a suburban driveway at dawn";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    type: "website",
    url: siteUrl,
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: ogImageAlt
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: ogImageAlt
      }
    ]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body>
        {children}
        <Providers />
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        <MetaPixelPageView />
      </body>
    </html>
  );
}
