import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inspira Ink | Black & Blue Sanctuary",
  description: "A minimalistic space for writers to immortalize their lines in #5170FF.",
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
