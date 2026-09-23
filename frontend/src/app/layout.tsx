import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Retrace — Intelligence Workspace",
  description:
    "Retrace reconstructs the organizational context behind decisions — the why, who, evidence, and what's still missing — from your documents, people, and events.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-iris/30 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
