"use client";

import { useState, useRef } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "motion/react";
import { Button, Card, Container, Text } from "@/components/ui";
import { beKindCTA, quizCards, counselors, bookingTypes } from "@/content/mindbridge";
import { sectionReveal } from "./motion";

interface TabConfig {
  id: string;
  label: string;
}

interface UnifiedSectionProps {
  tabs: TabConfig[];
}

const CARD_MIN_HEIGHT = "min-h-[400px]";

const tabVariants = {
  initial: (direction: number) => ({
    transform: `translateX(${20 * direction}px)`,
    filter: "blur(4px)",
    opacity: 0,
  }),
  animate: () => ({
    transform: "translateX(0px)",
    filter: "blur(0px)",
    opacity: 1,
  }),
  exit: (direction: number) => ({
    transform: `translateX(${-20 * direction}px)`,
    filter: "blur(4px)",
    opacity: 0,
  }),
};

function UnifiedSection({ tabs }: UnifiedSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const prevIndexRef = useRef(0);

  const handleTabClick = (index: number) => {
    prevIndexRef.current = activeIndex;
    setActiveIndex(index);
  };

  const slideDirection = activeIndex > prevIndexRef.current ? 1 : -1;

  return (
    <motion.section className="page-section w-full" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={sectionReveal}>
      <Container size="md">
        <div className="mb-7 text-center">
          <Text as="h2" variant="h2" weight="medium" className="mx-auto">Support that fits your moment</Text>
        </div>

        <div className="mx-auto mb-7 flex flex-wrap justify-center gap-2">
          {tabs.map((tab, index) => (
            <Button
              key={tab.id}
              onClick={() => handleTabClick(index)}
              variant={activeIndex === index ? "primary" : "warm"}
              size="md"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={activeIndex}
              custom={slideDirection}
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: "spring", duration: 0.4, bounce: 0 }}
            >
              {tabs[activeIndex].id === "aicompanion" && (
                <Card variant="elevated" padding="lg" className="rounded-[1.8rem] overflow-hidden">
                  <div className={`grid lg:grid-cols-2 ${CARD_MIN_HEIGHT}`}>
                    <div className="relative bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center p-8">
                      <div className="text-center">
                        <div className="text-7xl mb-4">💬</div>
                        <Text as="h3" variant="h3" weight="medium" className="text-white">AI Companion</Text>
                        <Text as="p" variant="small" className="text-white/70 mt-2">
                          Talk anytime, anonymously
                        </Text>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center p-8 lg:pl-16">
                      <Text as="h3" variant="h3" weight="medium" className="mt-2">{beKindCTA.headline}</Text>
                      <Text as="p" variant="small" color="secondary" className="mt-3">{beKindCTA.description}</Text>
                      <div className="mt-6 space-y-3">
                        {beKindCTA.features.map((f) => (
                          <div key={f} className="flex items-center gap-3">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-success-soft)] text-[var(--color-success)]">
                              <FiCheckCircle className="h-3 w-3" />
                            </span>
                            <Text as="p" variant="small" color="secondary">{f}</Text>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <Button href="/student/dashboard" variant="primary" size="sm">Get your calm space</Button>
                        <Button href="/student/chat" variant="primary" size="sm">Try the chat</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {tabs[activeIndex].id === "wellnesscheck" && (
                <Card variant="elevated" padding="lg" className="rounded-[1.8rem] overflow-hidden">
                  <div className={`grid lg:grid-cols-2 ${CARD_MIN_HEIGHT}`}>
                    <div className="relative bg-gradient-to-br from-[var(--color-purple-100)] to-[var(--color-purple-200)] flex items-center justify-center p-8">
                      <div className="text-center">
                        <div className="text-7xl mb-4">📋</div>
                        <Text as="h3" variant="h3" weight="medium" className="text-[var(--color-purple-700)]">Wellness Check</Text>
                        <Text as="p" variant="small" className="text-[var(--color-purple-600)] mt-2">
                          PHQ-9 & GAD-7 validated tools
                        </Text>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center p-8 lg:pl-16">
                      <Text as="h3" variant="h3" weight="medium" className="mt-2">Understand Your Feelings</Text>
                      <Text as="p" variant="small" color="secondary" className="mt-3">
                        Check your mental health with clinically validated tools. Get clarity without labels.
                      </Text>
                      <div className="mt-6 space-y-3">
                        {quizCards.map((card) => (
                          <div key={card.name} className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              <FiCheckCircle className="h-4 w-4 text-[var(--color-success)]" />
                            </div>
                            <div>
                              <Text as="p" variant="small" weight="medium">{card.label}</Text>
                              <Text as="p" variant="small" color="secondary" className="mt-0.5">
                                {card.note}
                              </Text>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button href="/student/quizzes" variant="warm" size="sm" className="mt-6 self-start">
                        Take Screening
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {tabs[activeIndex].id === "expertsupport" && (
                <Card variant="elevated" padding="lg" className="rounded-[1.8rem] overflow-hidden">
                  <div className={`grid lg:grid-cols-2 ${CARD_MIN_HEIGHT}`}>
                    <div className="relative bg-gradient-to-br from-[var(--color-green-100)] to-[var(--color-green-200)] flex items-center justify-center p-8">
                      <div className="text-center">
                        <div className="text-7xl mb-4">👨‍⚕️</div>
                        <Text as="h3" variant="h3" weight="medium" className="text-[var(--color-green-700)]">Expert Support</Text>
                        <Text as="p" variant="small" className="text-[var(--color-green-600)] mt-2">
                          Book in under 2 minutes
                        </Text>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center p-8 lg:pl-16">
                      <Text as="h3" variant="h3" weight="medium" className="mt-2">Connect with a Counselor</Text>
                      <Text as="p" variant="small" color="secondary" className="mt-3">
                        Your choice — anonymous, named, or crisis booking. Get the support you deserve.
                      </Text>
                      <div className="mt-6 space-y-3">
                        {bookingTypes.map((type) => (
                          <div key={type.label} className="flex items-center gap-3">
                            <FiCheckCircle className="h-4 w-4 text-[var(--color-success)]" />
                            <Text as="p" variant="small" weight="medium">{type.label}</Text>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 grid gap-3">
                        {counselors.slice(0, 2).map((c) => (
                          <Card key={c.name} variant="default" padding="sm" className="rounded-[1rem]">
                            <div className="flex items-center justify-between">
                              <div>
                                <Text as="p" variant="small" weight="medium">{c.name}</Text>
                                <Text as="p" variant="small" color="secondary">{c.focus}</Text>
                              </div>
                              <Text as="p" variant="small" className="text-[var(--color-primary)]">{c.availability}</Text>
                            </div>
                          </Card>
                        ))}
                      </div>
                      <Button href="/student/book" variant="primary" size="sm" className="mt-6">
                        Book Now
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {tabs[activeIndex].id === "feelgood" && (
                <Card variant="elevated" padding="lg" className="rounded-[1.8rem] overflow-hidden">
                  <div className={`grid lg:grid-cols-2 ${CARD_MIN_HEIGHT}`}>
                    <div className="relative bg-gradient-to-br from-[var(--color-purple-100)] to-[var(--color-purple-200)] flex items-center justify-center p-8">
                      <div className="text-center">
                        <div className="text-7xl mb-4">🧘</div>
                        <Text as="h3" variant="h3" weight="medium" className="text-[var(--color-purple-700)]">Feel-good Library</Text>
                        <Text as="p" variant="small" className="text-[var(--color-purple-600)] mt-2">
                          1000+ guided meditations
                        </Text>
                        <Button href="/student/resources" variant="primary" size="sm" className="mt-6">
                          Explore Meditations
                        </Button>
                      </div>
                    </div>
                    <div className="relative bg-gradient-to-br from-[var(--color-blue-100)] to-[var(--color-blue-200)] flex items-center justify-center p-8">
                      <div className="text-center">
                        <div className="text-7xl mb-4">🌙</div>
                        <Text as="h3" variant="h3" weight="medium" className="text-[var(--color-blue-700)]">Breathe & Sleep</Text>
                        <Text as="p" variant="small" className="text-[var(--color-blue-600)] mt-2">
                          Calm your mind
                        </Text>
                        <Button href="/student/resources" variant="primary" size="sm" className="mt-6">
                          Start Breathing
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>
    </motion.section>
  );
}

export default UnifiedSection;