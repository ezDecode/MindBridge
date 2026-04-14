"use client";

import { motion } from "motion/react";
import { FiMessageSquare, FiBarChart2 } from "react-icons/fi";
import type { TabId } from "./types";

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "mind", label: "Chat", icon: <FiMessageSquare className="h-4 w-4" /> },
  { id: "bridge", label: "Analytics", icon: <FiBarChart2 className="h-4 w-4" /> },
];

export function PillToggle({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (id: TabId) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="relative rounded-md px-4 py-1.5 text-sm font-medium transition-colors"
          >
            {isActive && (
              <motion.div
                layoutId="active-pill"
                transition={{
                  type: "spring",
                  stiffness: 320,
                  damping: 28,
                }}
                className="absolute inset-0 rounded-md bg-white shadow-sm"
              />
            )}
            <span className={`relative z-10 flex items-center gap-1.5 ${isActive ? "text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
              {tab.icon}
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}