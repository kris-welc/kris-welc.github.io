import type { Metadata } from "next";
import { Chakra_Petch, Rajdhani, Share_Tech_Mono } from "next/font/google";
import { Nav } from "@/components/nav";
import { ErrorSuppressor } from "@/components/error-suppressor";
import { Providers } from "@/components/providers";
import "./globals.css";

const chakraPetch = Chakra_Petch({
  variable: "--font-chakra-petch",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const shareTechMono = Share_Tech_Mono({
  variable: "--font-share-tech-mono",
  subsets: ["latin"],
  weight: "400",
});

const SITE_URL = "https://kris-welc.github.io";
const SITE_DESCRIPTION =
  "Field notes on AI agents and adaptive systems that hold up outside a demo. Patterns, numbers, and setups you can reuse.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Kris Welc",
    template: "%s | Kris Welc",
  },
  description: SITE_DESCRIPTION,
  authors: [{ name: "Kris Welc", url: "https://github.com/kris-welc" }],
  creator: "Kris Welc",
  openGraph: {
    type: "website",
    siteName: "Kris Welc",
    url: SITE_URL,
    title: "Kris Welc",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Kris Welc",
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${chakraPetch.variable} ${rajdhani.variable} ${shareTechMono.variable} antialiased vignette min-h-screen`}
      >
        <ErrorSuppressor />
        <div className="wasteland-bg" aria-hidden="true">
          <div className="wasteland-grid" />
          <div className="wasteland-grid-floor" />
        </div>
        <Providers>
          <Nav />
          {children}
        </Providers>
      </body>
    </html>
  );
}
