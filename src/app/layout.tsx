import type { Metadata } from "next";
import type { Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const mindBridge = localFont({
 variable: "--font-mindbridge",
 src: [
 {
 path: "./fonts/MindBridge-Regular.woff2",
 weight: "400",
 style: "normal",
 },
 {
 path: "./fonts/MindBridge-Medium.woff2",
 weight: "500",
 style: "normal",
 },
 {
 path: "./fonts/MindBridge-Bold.woff2",
 weight: "600",
 style: "normal",
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
 <html lang="en" className={mindBridge.variable}>
 <body className="font-sans antialiased text-text-primary">
 <a href="#main-content" className="skip-link">
 Skip to content
 </a>
 {children}
 </body>
 </html>
 );
}

