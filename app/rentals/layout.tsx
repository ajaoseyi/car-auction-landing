import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a ride — Carlot",
  description: "Pick your hours, see the price upfront and pay securely with Paystack. Cars come with a driver, boats with a captain.",
};

export default function Layout({ children }: LayoutProps<"/rentals">) {
  return children;
}
