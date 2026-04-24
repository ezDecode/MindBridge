"use client";

import { useActionState } from "react";
import { Icon } from '@iconify/react';
import { Text, Container, Button } from "@/components/ui";
import { SiteHeader } from "@/components/site";
import { adminLoginHardcoded } from "@/lib/auth/actions";
import { motion, AnimatePresence } from "motion/react";

const initialState: { error?: string } = {};

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(adminLoginHardcoded, initialState);

  return (
    <main id="main-content" className="w-full min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* ── Minimal Grid Background ── */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
        style={{ 
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)`, 
          backgroundSize: '40px 40px' 
        }} 
      />
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <SiteHeader />

      <section className="flex-1 flex items-center justify-center p-6 relative z-10">
        <Container size="sm" className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="bg-surface border border-border rounded-lg p-10 shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex flex-col items-center text-center mb-12">
                  <motion.div 
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="h-16 w-16 rounded-md bg-white/5 flex items-center justify-center text-white border border-white/10 mb-8"
                  >
                    <Icon icon="tabler:shield-lock" className="h-8 w-8" />
                  </motion.div>
                  <Text as="h1" variant="h3" weight="semibold" className="tracking-tight">
                    Admin Terminal
                  </Text>
                  <Text className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-dim mt-4">
                    Authorization Protocol
                  </Text>
                </div>

                <form action={formAction} className="space-y-6">
                  <div className="space-y-2.5">
                    <Text variant="label" weight="bold" className="text-text-dim tracking-widest ml-1">
                      Identity Key
                    </Text>
                    <input
                      type="text"
                      name="adminId"
                      placeholder="e.g. mb-admin-01"
                      required
                      disabled={isPending}
                      className="w-full h-11 rounded-md border border-border bg-background px-4 text-sm font-medium text-white focus:border-white/20 focus:ring-2 focus:ring-white/10 outline-none transition-all placeholder:text-text-dim"
                    />
                  </div>

                  <div className="space-y-2.5">
                    <Text variant="label" weight="bold" className="text-text-dim tracking-widest ml-1">
                      Passphrase
                    </Text>
                    <input
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      required
                      disabled={isPending}
                      className="w-full h-11 rounded-md border border-border bg-background px-4 text-sm font-medium text-white focus:border-white/20 focus:ring-2 focus:ring-white/10 outline-none transition-all placeholder:text-text-dim"
                    />
                  </div>

                  <AnimatePresence>
                    {state.error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="rounded border border-danger/20 bg-danger/10 p-3 flex items-center gap-3"
                      >
                        <Icon icon="tabler:alert-circle" className="h-4 w-4 text-danger shrink-0" />
                        <Text className="text-xs font-bold text-danger">
                          {state.error}
                        </Text>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button 
                    type="submit" 
                    disabled={isPending}
                    size="lg"
                    className="w-full mt-4 uppercase tracking-[0.2em] text-xs font-bold"
                  >
                    {isPending ? (
                      <>
                        <Icon icon="tabler:loader-2" className="h-4 w-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Initialize</span>
                        <Icon icon="tabler:arrow-right" className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-12 pt-8 border-t border-white/5 text-center">
                  <Text className="text-[9px] text-text-dim font-bold uppercase tracking-[0.2em] opacity-60">
                    MindBridge Sentinel v3.4
                  </Text>
                </div>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>
    </main>
  );
}
