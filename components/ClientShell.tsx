"use client";

import { FlamesCursor } from "./FlamesCursor";
import { ChefCharacter } from "./ChefCharacter";

/**
 * Client-side shell rendered inside RootLayout's <body>.
 * Keeps layout.tsx as a Server Component while mounting
 * client-only globals (cursor, intro character, etc.).
 */
export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FlamesCursor />
      <ChefCharacter />
      {children}
    </>
  );
}
