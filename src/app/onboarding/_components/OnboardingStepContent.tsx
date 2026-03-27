"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Input } from "@/components/ui/Input";
import { SelectionCard } from "@/components/ui/SelectionCard";
import { useUserStore } from "@/stores/useUserStore";
import { FOCUS_AREAS, MOODS, StepId } from "./onboardingConfig";
import { FiUser, FiShield, FiSmile, FiHeart, FiTarget } from "react-icons/fi";
import { FlagIcon } from "@/constants/assets";

interface OnboardingStepContentProps {
  stepId: StepId;
}

export function OnboardingStepContent({ stepId }: OnboardingStepContentProps) {
  const {
    nickname,
    isAnonymous,
    focusAreas,
    initialMood,
    setNickname,
    setAnonymous,
    toggleFocusArea,
    setInitialMood,
  } = useUserStore();

  const [localName, setLocalName] = useState(
    isAnonymous ? "" : nickname
  );

  const handleAnonymous = (value: boolean) => {
    setAnonymous(value);
    if (!value && localName.trim()) {
      setNickname(localName.trim());
    }
  };

  const handleNameChange = (value: string) => {
    setLocalName(value);
    if (!isAnonymous && value.trim()) {
      setNickname(value.trim());
    }
  };

  if (stepId === "mood") {
    return (
      <div className="grid grid-cols-4 gap-2">
        {MOODS.map((mood) => {
          const selected = initialMood === mood.label;
          return (
            <button
              key={mood.label}
              type="button"
              onClick={() => setInitialMood(mood.label)}
              aria-label={mood.label}
              aria-pressed={selected}
              className={`flex flex-col items-center rounded-xl border px-2 py-2.5 transition-all duration-200 ${
                selected
                  ? "border-[var(--color-brand-btn)] bg-[var(--color-surface-tinted)] ring-2 ring-[var(--color-brand-btn)]/20"
                  : "border-[var(--color-border)] bg-white hover:bg-[var(--color-gray-50)]"
              }`}
            >
              <span className="text-xl">{mood.emoji}</span>
              <span className="mt-1 text-[11px] font-semibold text-[var(--color-text-primary)]">
                {mood.label}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  if (stepId === "name") {
    return (
      <div className="space-y-2.5">
        <SelectionCard
          selected={!isAnonymous}
          icon={<FiUser className="h-4 w-4 text-[var(--color-brand-btn)]" />}
          label="Use my name"
          onClick={() => handleAnonymous(false)}
        />

        <SelectionCard
          selected={isAnonymous}
          icon={<FiShield className="h-4 w-4 text-[var(--color-brand-btn)]" />}
          label="Stay anonymous"
          onClick={() => handleAnonymous(true)}
        />

        <AnimatePresence>
          {!isAnonymous && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden pt-1"
            >
              <Input
                id="onboarding-name"
                placeholder="Your name"
                value={localName}
                onChange={(event) => handleNameChange(event.target.value)}
                className="h-11 rounded-lg border-[var(--color-border)] bg-white"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (stepId === "focus") {
    return (
      <div className="flex flex-wrap gap-2">
        {FOCUS_AREAS.map((area) => {
          const selected = focusAreas.includes(area.label);
          return (
            <button
              key={area.label}
              type="button"
              onClick={() => toggleFocusArea(area.label)}
              aria-pressed={selected}
              className={`cursor-pointer select-none rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 ${
                selected
                  ? "bg-[var(--color-brand-btn)] text-white border border-[var(--color-brand-btn)]"
                  : "border border-[var(--color-border)] bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-50)]"
              }`}
            >
              {area.label}
            </button>
          );
        })}
      </div>
    );
  }

  const focusSummary = focusAreas.length > 0
    ? focusAreas.join(", ")
    : "No focus areas selected";
  const moodItem = MOODS.find((m) => m.label === initialMood);

  return (
    <div className="space-y-2.5">
      <SummaryRow
        icon={<FiSmile className="h-4 w-4 text-[var(--color-brand-btn)]" />}
        label="Identity"
        value={isAnonymous ? "Anonymous" : nickname || "—"}
      />
      <SummaryRow
        icon={<FlagIcon className="h-5 w-5 rounded-sm" />}
        label="Language"
        value="English — currently the only available language"
      />
      <SummaryRow
        icon={<FiHeart className="h-4 w-4 text-[var(--color-brand-btn)]" />}
        label="Mood"
        value={moodItem ? `${moodItem.emoji} ${moodItem.label}` : "—"}
      />
      <SummaryRow
        icon={<FiTarget className="h-4 w-4 text-[var(--color-brand-btn)]" />}
        label="Focus"
        value={focusSummary}
      />
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-white/60 px-3.5 py-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-tinted)]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-[var(--color-text-primary)] truncate">
          {value}
        </p>
      </div>
    </div>
  );
}
