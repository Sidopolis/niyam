import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Niyam — Modular AI Agent Rules",
  description: "Modular AI agent rules that compose, not bloat. Pick your stack, role, and principles. Generate scoped configs for Kiro, Cursor, Claude Code, and more.",
  keywords: ["AI agent", "rules", "cursor", "claude", "kiro", "AGENTS.md", "coding agent", "developer tools"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-[#0a0a0f] text-white antialiased font-[family-name:var(--font-inter)]">
        {children}
      </body>
    </html>
  );
}
