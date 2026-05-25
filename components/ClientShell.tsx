"use client";

import { FlamesCursor } from "./FlamesCursor";

/**
 * Client-side shell rendered inside RootLayout's <body>.
 * Keeps layout.tsx as a Server Component while mounting
 * client-only globals (cursor, etc.).
 * ChefCharacter is rendered in page.tsx so it can receive roast result context.
 */
export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FlamesCursor />
      {children}
    </>
  );
}
