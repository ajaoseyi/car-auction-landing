import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My bookings — Carlot",
  robots: { index: false },
};

export default function Layout({ children }: LayoutProps<"/bookings">) {
  return children;
}
