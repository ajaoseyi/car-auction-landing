import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carlot — Car & Boat Rentals in Lagos",
  description: "Rent a car with a driver or a boat with a captain in Lagos. Pick your hours, see the price upfront and pay once. Clean rides, booked in minutes.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <head>
        {/* Loaded by family name so the three.js canvas text can use them too. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- root layout, applies to every page */}
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&display=swap" rel="stylesheet" />
        <link href="https://api.fontshare.com/v2/css?f[]=clash-grotesk@400,500,600,700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
