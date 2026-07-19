import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SchemaForge — Visual Database Designer",
  description: "Design PostgreSQL database schemas visually and export SQL.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
