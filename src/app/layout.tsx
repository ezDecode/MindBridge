import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const sfProRounded = localFont({
  variable: "--font-sf-rounded",
  src: [
    {
      path: "./fonts/SF_Pro_Rounded_Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/SF_Pro_Rounded_Semibold.otf",
      weight: "600",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "MindBridge",
  description: "Anonymous mental health support, 24/7. No judgment, just care.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sfProRounded.variable} ${sfProRounded.className}`}>
      <body className="font-sans antialiased bg-[var(--color-background)] text-[var(--color-text-primary)]">
        {children}
      </body>
    </html>
  );
}
