import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rizak - Issue Tracking System",
  description: "A full-stack issue tracking application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
