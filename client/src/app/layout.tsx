import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "DevNotes",
  description:
    "A developer notes app for organizing code snippets, ideas, and project notes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
