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
      icon: 'tabler:calendar-check',
      iconWrap: 'bg-primary/10 text-primary border-primary/20',
      actionLabel: 'Confirm Booking',
      cancelLabel: 'Not now'
    },
    show_resources: {
      title: 'Helpful Resources',
      icon: 'tabler:library',
      iconWrap: 'bg-warning/10 text-warning border-warning/20',
      actionLabel: 'View Resources',
      cancelLabel: 'Close'
    },
    send_crisis_alert: {
      title: 'Crisis Support',
      icon: 'tabler:alert-triangle',
      iconWrap: 'bg-danger/10 text-danger border-danger/20',
      actionLabel: 'Contact Support',
      cancelLabel: 'I am okay now'
    }
  }[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="my-3 max-w-sm rounded-lg border border-white/[0.08] bg-[#101113] p-4 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("rounded-md border p-2", config.iconWrap)}>
          <Icon icon={config.icon} className="text-xl" />
        </div>
        <Text variant="body" weight="semibold" className="text-white">
          {config.title}
        </Text>
      </div>

      <Text variant="small" className="text-text-muted mb-4 leading-relaxed">
        {context || 'I found something that might help you. Would you like to proceed?'}
      </Text>

      <div className="flex gap-2">
        <Button 
          size="sm" 
          className="flex-1"
          onClick={onConfirm}
        >
          {config.actionLabel}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1"
          onClick={onCancel}
        >
          {config.cancelLabel}
        </Button>
      </div>
    </motion.div>
  )
}
