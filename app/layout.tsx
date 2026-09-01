import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Drape",
  description: "Studio product photos from a phone shot.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
