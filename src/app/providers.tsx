"use client";

import { DemoProvider } from "@/stores/demo-store";

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return <DemoProvider>{children}</DemoProvider>;
}
