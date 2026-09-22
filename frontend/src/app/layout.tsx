import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReTrace — AI Lost Context Recovery Engine",
  description: "Reconstruct missing architectural and product decisions across documents, dates, and people.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="console-bg min-h-screen text-console-ink antialiased selection:bg-cyan-400/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
