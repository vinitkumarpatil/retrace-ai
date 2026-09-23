import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

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
      <body className="blueprint-grid min-h-screen text-slate-800 antialiased selection:bg-amber-100 selection:text-amber-900">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
