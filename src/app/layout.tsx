import type { Metadata } from "next";
import type { Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const interDisplay = Inter({
  subsets: ["latin"],
  variable: "--font-inter-display",
});

export const metadata: Metadata = {
  title: {
    default: "MindBridge",
    template: "%s | MindBridge",
  },
  description: "A campus-first mental wellness space for students who need calm support, clarity, and a quick path to real help.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

import { ToastProvider } from "@/components/ui/Toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${interDisplay.variable}`}>
      <body className="font-sans antialiased bg-[#0A0A0A] text-white">
        <ToastProvider>
          <a href="#main-content" className="skip-link">
            Skip to content
          </a>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

