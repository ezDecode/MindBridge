"use client";

import { motion } from "motion/react";
import { FiMessageSquare, FiBarChart2 } from "react-icons/fi";
import type { TabId } from "./types";

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "mind", label: "Mind", icon: <FiMessageSquare className="h-[18px] w-[18px]" /> },
  { id: "bridge", label: "Bridge", icon: <FiBarChart2 className="h-[18px] w-[18px]" /> },
];

export function PillToggle({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (id: TabId) => void;
}) {
  return (
    <div className="flex items-center justify-center">
      <div className="relative flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-primary-light)] p-1">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="group relative rounded-full px-5 py-2.5 outline-none"
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  transition={{
                    type: "spring",
                    stiffness: 320,
                    damping: 28,
                    mass: 0.8,
                  }}
                  className="absolute inset-0 rounded-full border border-[var(--color-border-light)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]"
                />
              )}
              <motion.div
                transition={{ duration: 0.25, ease: "easeOut" }}
                animate={{
                  filter: isActive
                    ? ["blur(0px)", "blur(3px)", "blur(0px)"]
                    : "blur(0px)",
                }}
                className={`relative z-10 flex items-center gap-2 transition-colors duration-200 ${
                  isActive
                    ? "font-bold text-[var(--color-text-primary)]"
                    : "font-semibold text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)]"
                }`}
              >
                <motion.div
                  animate={{ scale: isActive ? 1.05 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="flex shrink-0 items-center justify-center"
                >
                  {tab.icon}
                </motion.div>
                <span className="text-label tracking-tight whitespace-nowrap">
                  {tab.label}
                </span>
              </motion.div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
