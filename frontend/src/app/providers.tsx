"use client";

import React from "react";
import { RetraceProvider } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RetraceProvider>
      <AppShell>{children}</AppShell>
    </RetraceProvider>
  );
}
