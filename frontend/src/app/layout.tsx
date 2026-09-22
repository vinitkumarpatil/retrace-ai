import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReTrace — recover the why behind past decisions",
  description: "Reconstruct the reasoning, timeline, and people behind architectural decisions from scattered docs, threads, and notes — with every claim backed by a source.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="desk-grid min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
