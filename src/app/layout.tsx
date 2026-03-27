import type { Metadata } from "next";
import type { Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const mindBridge = localFont({
  variable: "--font-mindbridge",
  src: [
    {
      path: "./fonts/MindBridge-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/MindBridge-LightItalic.woff2",
      weight: "300",
      style: "italic",
    },
    {
      path: "./fonts/MindBridge-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/MindBridge-Italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/MindBridge-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/MindBridge-MediumItalic.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "./fonts/MindBridge-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/MindBridge-BoldItalic.woff2",
      weight: "700",
      style: "italic",
    },
  ],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${mindBridge.variable} ${mindBridge.className}`}>
      <body className="font-sans antialiased text-[var(--color-text-primary)]">
        {children}
      </body>
    </html>
  );
}
