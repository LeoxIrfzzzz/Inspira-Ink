import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inspira Ink | Black & Blue Sanctuary",
  description: "A minimalistic space for writers to immortalize their lines in #5170FF.",
  openGraph: {
    title: "Inspira Ink | Black & Blue Sanctuary",
    description: "A minimalistic space for writers to immortalize their lines.",
    url: "https://inspira-ink.vercel.app",
    siteName: "Inspira Ink",
    images: [
      {
        url: "https://inspira-ink.vercel.app/banner.jpg",
        width: 1200,
        height: 630,
        alt: "Inspira Ink Banner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Inspira Ink | Black & Blue Sanctuary",
    description: "A minimalistic space for writers to immortalize their lines.",
    images: ["https://inspira-ink.vercel.app/banner.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ backgroundColor: '#000000', color: '#FFFFFF', minHeight: '100vh', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
