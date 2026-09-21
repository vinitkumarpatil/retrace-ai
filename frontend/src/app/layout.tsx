import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReTrace — Architectural Context Recovery Engine",
  description: "Reconstruct lost decisions, architectural pivots, and organizational context across documents, codebases, and team history.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="subtle-grid min-h-screen antialiased selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-950 dark:selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
