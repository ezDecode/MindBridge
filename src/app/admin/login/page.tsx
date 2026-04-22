"use client";

import { useActionState } from "react";
import { Icon } from '@iconify/react';
import { Text, Container } from "@/components/ui";
import { SiteHeader } from "@/components/site";
import { adminLoginHardcoded } from "@/lib/auth/actions";
import { motion, AnimatePresence } from "motion/react";

const initialState: { error?: string } = {};

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(adminLoginHardcoded, initialState);

  return (
    <main id="main-content" className="w-full min-h-screen bg-[var(--bg-page)] flex flex-col relative overflow-hidden">
      {/* ── Chess Pattern Background ── */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: `radial-gradient(var(--chess-dark) 0.5px, transparent 0.5px)`, 
          backgroundSize: '24px 24px' 
        }} 
      />
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--action-primary)]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--chess-wood)]/5 rounded-full blur-[120px] pointer-events-none" />

      <SiteHeader />

      <section className="flex-1 flex items-center justify-center p-6 relative z-10">
        <Container size="sm" className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-[3rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none transform rotate-12">
                <Icon icon="tabler:shield-lock" className="h-40 w-40" />
              </div>
              
              <div className="relative z-10">
                <div className="flex flex-col items-center text-center mb-10">
                  <motion.div 
                    initial={{ rotate: -5, scale: 0.9 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="h-20 w-20 rounded-2xl bg-[var(--surface-strong)] flex items-center justify-center text-[var(--chess-dark)] shadow-sm border border-[var(--border-default)] mb-6"
                  >
                    <Icon icon="tabler:shield-lock" className="h-10 w-10" />
                  </motion.div>
                  <Text className="text-3xl font-black tracking-tighter text-wrap-balance" style={{ fontFamily: 'var(--font-mindbridge)' }}>
                    Admin Terminal
                  </Text>
                  <Text className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mt-3 opacity-60">
                    Authorization Protocol required
                  </Text>
                </div>

                <form action={formAction} className="space-y-6">
                  <div className="space-y-2.5">
                    <Text className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] px-1">
                      Identity Key
                    </Text>
                    <input
                      type="text"
                      name="adminId"
                      placeholder="e.g. mb-admin-01"
                      required
                      disabled={isPending}
                      className="w-full h-14 rounded-xl border border-[var(--border-default)] bg-[var(--surface-strong)]/20 px-6 text-[14px] font-medium focus:bg-[var(--surface-default)] focus:border-[var(--chess-dark)] focus:ring-4 focus:ring-[var(--chess-dark)]/5 focus:outline-none transition-[background-color,border-color,box-shadow] placeholder:text-[var(--text-muted)]/30"
                    />
                  </div>

                  <div className="space-y-2.5">
                    <Text className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] px-1">
                      Security Passphrase
                    </Text>
                    <input
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      required
                      disabled={isPending}
                      className="w-full h-14 rounded-xl border border-[var(--border-default)] bg-[var(--surface-strong)]/20 px-6 text-[14px] font-medium focus:bg-[var(--surface-default)] focus:border-[var(--chess-dark)] focus:ring-4 focus:ring-[var(--chess-dark)]/5 focus:outline-none transition-[background-color,border-color,box-shadow] placeholder:text-[var(--text-muted)]/30"
                    />
                  </div>

                  <AnimatePresence>
                    {state.error && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        className="rounded-xl border border-[var(--status-error)]/20 bg-[var(--status-error-soft)] p-4 flex items-center gap-4 shadow-sm"
                      >
                        <div className="h-8 w-8 rounded-lg bg-[var(--status-error)] flex items-center justify-center text-[var(--text-inverse)] shrink-0">
                          <Icon icon="tabler:alert-circle" className="h-5 w-5" />
                        </div>
                        <Text className="text-xs font-bold text-[var(--status-error)] text-wrap-pretty">
                          {state.error}
                        </Text>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button 
                    type="submit" 
                    disabled={isPending}
                    className="w-full h-16 rounded-xl bg-[var(--chess-dark)] text-[var(--text-inverse)] font-black uppercase tracking-[0.25em] text-[13px] hover:bg-[var(--action-primary-hover)] shadow-md shadow-[var(--chess-dark)]/10 transition-[background-color,transform,box-shadow] active:scale-[0.96] disabled:opacity-50 flex items-center justify-center gap-4 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative z-10 flex items-center gap-3">
                      {isPending ? (
                        <>
                          <Icon icon="tabler:loader-2" className="h-5 w-5 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <span>Initialize Session</span>
                          <Icon icon="tabler:arrow-right" className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </button>
                </form>

                <div className="mt-10 pt-8 border-t border-[var(--border-default)]/60 text-center">
                  <Text className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-[0.2em] opacity-40">
                    Secured by MindBridge Sentinel v3.4
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
