import { LandingPage } from "@/components/landing";
import { Metadata } from "next";

export const metadata: Metadata = {
 title: "MindBridge",
};

export default function Home() {
 return <LandingPage />;
}

