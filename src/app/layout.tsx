import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Hmm Loyalty",
    default: "Hmm Loyalty - Stop losing customers to lost paper cards.",
  },
  description: "Launch a frictionless digital loyalty program in 5 minutes. No app downloads required. Turn casual coffee drinkers into raving fans and predictable revenue.",
  metadataBase: new URL("https://hmmloyalty.com"),
  keywords: ["digital loyalty cards", "cafe rewards", "coffee shop rewards program", "digital punch cards", "customer retention"],
  authors: [{ name: "Hmm Loyalty" }],
  creator: "Hmm Loyalty",
  publisher: "Hmm Loyalty",
  openGraph: {
    title: "Hmm Loyalty - The Future of Cafe Loyalty Programs",
    description: "Launch a frictionless digital loyalty program in 5 minutes. No app downloads required. Delight your customers and boost retention.",
    url: "https://hmmloyalty.com",
    siteName: "Hmm Loyalty",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hmm Loyalty - The Future of Cafe Loyalty Programs",
    description: "Launch a frictionless digital loyalty program in 5 minutes. No app downloads required. Delight your customers and boost retention.",
    creator: "@hmmloyalty",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Hmm Loyalty",
  },
  formatDetection: {
    telephone: false,
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
