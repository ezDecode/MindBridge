"use client"

import { Icon } from "@iconify/react"
import { motion } from "motion/react"
import { Button, Text } from "@/components/ui"
import { cn } from "@/lib/utils"

interface ChatActionCardProps {
  type: 'book_counselor' | 'show_resources' | 'send_crisis_alert'
  context: string | null
  onConfirm: () => void
  onCancel: () => void
}

export function ChatActionCard({ type, context, onConfirm, onCancel }: ChatActionCardProps) {
  const config = {
    book_counselor: {
      title: 'Counseling Session',
      description: 'Connect with a professional counselor for personalized support.',
      icon: 'tabler:calendar-check',
      iconWrap: 'bg-primary/20 text-primary border-primary/20 shadow-inner',
      actionLabel: 'Confirm Booking',
      cancelLabel: 'Not now'
    },
    show_resources: {
      title: 'Helpful Resources',
      description: 'Explore a curated list of tools and articles for your well-being.',
      icon: 'tabler:library',
      iconWrap: 'bg-primary/20 text-primary border-primary/20 shadow-inner',
      actionLabel: 'View Resources',
      cancelLabel: 'Close'
    },
    send_crisis_alert: {
      title: 'Crisis Support',
      description: 'Immediate help is available. We are here for you.',
      icon: 'tabler:alert-triangle',
      iconWrap: 'bg-danger/20 text-danger border-danger/20 shadow-inner',
      actionLabel: 'Contact Support',
      cancelLabel: 'I am okay now'
    }
  }[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="my-4 max-w-sm rounded-[2rem] border border-white/5 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-md"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className={cn("rounded-2xl border p-2.5", config.iconWrap)}>
          <Icon icon={config.icon} className="text-2xl" />
        </div>
        <Text variant="body" weight="bold" className="text-white text-lg">
          {config.title}
        </Text>
      </div>

      <Text variant="small" className="text-text-dim mb-6 leading-relaxed font-medium">
        {context || config.description}
      </Text>

      <div className="flex flex-col gap-2.5">
        <Button 
          size="lg"
          className="w-full rounded-2xl bg-primary text-black font-bold shadow-lg shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-transform"
          onClick={onConfirm}
        >
          {config.actionLabel}
        </Button>
        <button 
          type="button"
          onClick={onCancel}
          className="w-full py-2.5 text-sm font-bold text-text-dim hover:text-white transition-colors"
        >
          {config.cancelLabel}
        </button>
      </div>
    </motion.div>
  )
}
