import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReTrace — AI Lost Context Recovery Engine",
  description: "Reconstruct missing architectural and product decisions across documents, dates, and people with zero hallucinations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="forensic-grid min-h-screen text-slate-100 antialiased selection:bg-amber-400 selection:text-slate-950 bg-[#0A0E17]">
        {children}
      </body>
    </html>
  );
}
