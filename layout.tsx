import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Auwntech",
  description: "VTU, airtime, data, and internal transfers with biometric security",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-auwn-dark text-auwn-text antialiased">
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
