"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Easing } from "motion";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/useUserStore";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Card } from "@/components/ui/Card";
import { Stepper } from "@/components/ui/Stepper";
import { SelectionCard } from "@/components/ui/SelectionCard";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { FlagIcon } from "@/constants/assets";

const STEPS = ["name", "language", "focus", "mood", "permissions"];

const FOCUS_AREAS = [
  "Anxiety",
  "Depression",
  "Stress",
  "Sleep",
  "Self-Esteem",
  "Relationships",
  "Work-Life Balance",
  "Mindfulness",
  "Trauma",
  "Anger Management",
];

const MOODS = [
  { emoji: "😔", label: "Sad" },
  { emoji: "😰", label: "Anxious" },
  { emoji: "😤", label: "Frustrated" },
  { emoji: "😴", label: "Tired" },
  { emoji: "😌", label: "Calm" },
  { emoji: "😊", label: "Happy" },
  { emoji: "🤔", label: "Confused" },
  { emoji: "😎", label: "Confident" },
];

const easeOut: Easing = [0.23, 1, 0.32, 1];
const easeInOut: Easing = [0.77, 0, 0.175, 1];

const slideVariants = {
  enter: (dir: number) => ({
    transform: `translateX(${dir * 100}px)`,
    opacity: 0,
  }),
  center: {
    transform: "translateX(0px)",
    opacity: 1,
  },
  exit: (dir: number) => ({
    transform: `translateX(${dir * -100}px)`,
    opacity: 0,
  }),
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: easeOut,
    },
  },
};

const STEP_CONTENT = [
  {
    title: "What's your name?",
    description: "This helps us personalize your experience. You can stay anonymous if preferred.",
  },
  {
    title: "Select your language",
    description: "Choose your preferred language for conversations and content.",
  },
  {
    title: "What brings you here?",
    description: "Select areas you'd like support with. You can change this anytime.",
  },
  {
    title: "How are you feeling?",
    description: "How are you feeling right now? This helps us understand your starting point.",
  },
  {
    title: "Permissions",
    description: "Enable features to get the most out of your experience.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [inputValue, setInputValue] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    nickname,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isAnonymous: storeAnonymous,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    language,
    focusAreas,
    initialMood,
    permissions,
    setNickname,
    setAnonymous,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setLanguage,
    toggleFocusArea,
    setInitialMood,
    setPermissions,
  } = useUserStore();

  const handleNext = () => {
    setDirection(1);
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setDirection(-1);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNameSubmit = () => {
    if (isAnonymous) {
      setAnonymous(true);
    } else if (inputValue.trim()) {
      setNickname(inputValue.trim());
    }
    handleNext();
  };

  const handleComplete = () => {
    router.push("/");
  };

  const canProceed = () => {
    switch (STEPS[currentStep]) {
      case "name":
        return isAnonymous || inputValue.trim().length > 0;
      case "language":
        return true;
      case "focus":
        return focusAreas.length > 0;
      case "mood":
        return initialMood !== null;
      case "permissions":
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: easeOut }}
        className="w-full max-w-md"
      >
        <div className="mb-8">
          <Stepper totalSteps={STEPS.length} currentStep={currentStep} className="mb-4" />
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: easeOut }}
          >
            <Text variant="h2" weight="bold" className="text-center mt-1">
              {STEP_CONTENT[currentStep].title}
            </Text>
            <Text variant="body" color="secondary" className="text-center mt-2">
              {STEP_CONTENT[currentStep].description}
            </Text>
          </motion.div>
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: 0.4,
              ease: easeInOut,
            }}
          >
            <Card>
              {currentStep === 0 && (
                <div className="space-y-5 pt-1">
                  <Input
                    placeholder="Enter your name"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && canProceed() && handleNameSubmit()
                    }
                    disabled={isAnonymous}
                    className="text-lg"
                  />
                  <div className="flex items-center justify-center">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <Switch
                        checked={isAnonymous}
                        onCheckedChange={(checked) => {
                          setIsAnonymous(checked);
                          if (checked) {
                            setInputValue("");
                          }
                        }}
                      />
                      <Text variant="body" color="secondary">
                        Stay Anonymous
                      </Text>
                    </label>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <SelectionCard
                    selected={true}
                    icon={<FlagIcon />}
                    label="English"
                    sublabel="Selected"
                  />
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-wrap gap-2.5"
                >
                  {FOCUS_AREAS.map((area) => (
                    <motion.div key={area} variants={itemVariants}>
                      <Chip
                        onClick={() => toggleFocusArea(area)}
                        variant={focusAreas.includes(area) ? "default" : "outline"}
                        className={
                          focusAreas.includes(area)
                            ? "bg-[var(--color-brand-btn)] text-white border-[var(--color-brand-btn)]"
                            : ""
                        }
                      >
                        {area}
                      </Chip>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-4 gap-2.5"
                >
                  {MOODS.map((mood) => (
                    <motion.button
                      key={mood.label}
                      variants={itemVariants}
                      onClick={() => setInitialMood(mood.label)}
                      whileTap={{ scale: 0.95 }}
                      className={`flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl transition-colors duration-200 ${
                        initialMood === mood.label
                          ? "bg-[var(--color-brand-btn)]/10 ring-2 ring-[var(--color-brand-btn)]"
                          : "hover:bg-[var(--color-gray-100)]"
                      }`}
                    >
                      <span className="text-3xl">{mood.emoji}</span>
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        {mood.label}
                      </span>
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {[
                    {
                      title: "Notifications",
                      desc: "Receive daily reminders to check in with yourself",
                      key: "notifications" as const,
                    },
                    {
                      title: "Camera",
                      desc: "Enable video calls for face-to-face sessions",
                      key: "camera" as const,
                    },
                  ].map((item) => (
                    <motion.div
                      key={item.key}
                      variants={itemVariants}
                      className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--color-gray-100)]"
                    >
                      <div className="flex-1 min-w-0">
                        <Text weight="medium">{item.title}</Text>
                        <Text variant="small" color="muted">
                          {item.desc}
                        </Text>
                      </div>
                      <div className="ml-3 flex-shrink-0">
                        <Switch
                          checked={permissions[item.key]}
                          onCheckedChange={(checked) =>
                            setPermissions({ [item.key]: checked })
                          }
                        />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          <Button
            variant="brand"
            onClick={
              currentStep === STEPS.length - 1
                ? handleComplete
                : currentStep === 0
                ? handleNameSubmit
                : handleNext
            }
            disabled={!canProceed()}
          >
            {currentStep === STEPS.length - 1 ? "Get Started" : "Continue"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}