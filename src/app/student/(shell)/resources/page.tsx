"use client";

import { FiExternalLink, FiHeadphones, FiPlayCircle } from "react-icons/fi";
import { motion } from "motion/react";
import { PageIntro } from "@/components/site";
import { Button, Card, Text } from "@/components/ui";
import staticResources from "@/content/static-resources.json";

export default function StudentResourcesPage() {
  return (
    <>
      <PageIntro
        eyebrow="Wellness resources"
        title="Curated videos and audio for mental health support."
        description="Simple tools to help you relax, focus, and feel better. Click to open in a new tab."
        actions={
          <>
            <Button href="/student/chat">Ask for a recommendation</Button>
            <Button href="/student/dashboard" variant="warm">
              Back to dashboard
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {staticResources.map((resource, index) => (
          <motion.div
            key={resource.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: index * 0.08,
              ease: [0.23, 1, 0.32, 1]
            }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Card variant="subtle" padding="lg" className="rounded-[calc(var(--radius-lg)*var(--brm))] squircle h-full">
              <div className="flex items-center gap-3 mb-4">
                <motion.span 
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-primary)]"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {resource.type === "Audio" ? (
                    <FiHeadphones className="h-5 w-5" />
                  ) : (
                    <FiPlayCircle className="h-5 w-5" />
                  )}
                </motion.span>
                <div>
                  <Text as="p" variant="small" weight="medium">
                    {resource.type}
                  </Text>
                  <Text as="p" variant="small" color="secondary" className="mt-1">
                    {resource.duration}
                  </Text>
                </div>
              </div>

              <Text as="p" variant="body" weight="medium" className="mb-3">
                {resource.title}
              </Text>
              
              <Text as="p" variant="small" color="secondary" className="mb-4">
                {resource.description}
              </Text>

              <motion.a 
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors"
                whileHover={{ x: 4 }}
              >
                <Text as="span" variant="small" weight="medium">Open</Text>
                <FiExternalLink className="h-4 w-4" />
              </motion.a>
            </Card>
          </motion.div>
        ))}
      </div>
    </>
  );
}
