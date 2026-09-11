import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vinted Lens — Find the look second-hand",
  description: "Upload a fashion image and generate precise, editable Vinted searches.",
  icons: {
    icon: "/favicon-new.svg",
    shortcut: "/favicon-new.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
