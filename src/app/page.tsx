import { HeroSection } from "@/components/landing";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "MindBridge — A Safe Space",
};

export default function Home() {
  return <HeroSection />;
}