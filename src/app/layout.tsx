import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "CertSync - Certificate Tracking & Compilation",
  description: "Academically aligned, accreditation-ready certificate tracking, collection, and compilation platform for Kistru Jyoti College.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased bg-zinc-950 text-slate-100 min-h-screen selection:bg-purple-500/30 selection:text-purple-200`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
