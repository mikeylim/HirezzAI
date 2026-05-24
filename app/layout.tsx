import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cooked Resume",
  description: "Find out how cooked your resume is — then un-cook it.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
