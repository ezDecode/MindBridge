"use client";

import { Suspense } from "react";
import { Icon } from '@iconify/react';
import { motion } from "motion/react";
import { Container, Text } from "@/components/ui";
import { SiteHeader } from "@/components/site";
import { loginAsRole, signInWithGoogle } from "@/lib/auth/actions";
import { setDemoRole } from "@/lib/auth/demo-session";
import { type DemoRole } from "@/lib/auth/demo-users";
import { type Variants } from "motion/react";

const PERSONAS: {
  role: DemoRole;
  name: string;
  email: string;
  description: string;
  icon: string;
}[] = [
  {
    role: "student",
    name: "Nemo",
    email: "student@mindbridge.demo",
    description: "Access student wellness dashboard and chat",
    icon: "tabler:school",
  },
  {
    role: "counselor",
    name: "Dr. Radha Sharma",
    email: "counselor@mindbridge.demo",
    description: "Manage appointments and crisis alerts",
    icon: "tabler:stethoscope",
  },
  {
    role: "admin",
    name: "Prof. Raj Verma",
    email: "admin@mindbridge.demo",
    description: "View institution-wide analytics",
    icon: "tabler:shield-lock",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

function LoginForm() {
  return (
    <main className="w-full bg-[#030406] min-h-screen flex flex-col relative overflow-hidden">
      {/* Grid Overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      
      <SiteHeader />

      <section className="flex-1 flex items-center py-20 relative z-10">
        <Container size="lg">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <Text as="h1" variant="h1" weight="bold" className="text-white mb-4 tracking-tight">
                MindBridge
              </Text>
              <Text as="p" variant="h4" color="secondary" className="opacity-80">
                Continue to your wellness journey
              </Text>
            </motion.div>
          </div>

          <div className="max-w-md mx-auto mb-16">
            <form action={signInWithGoogle}>
              <button 
                type="submit"
                className="w-full h-12 flex items-center justify-center gap-3 rounded-xl bg-white text-black text-[1.0625rem] font-bold hover:bg-gray-200 active:scale-[0.98] transition-all shadow-lg"
              >
                <Icon icon="logos:google-icon" className="h-5 w-5" />
                Continue with Google
              </button>
            </form>
            
            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#030406] px-4 text-white/30 font-bold tracking-widest">Or explore as</span>
              </div>
            </div>
          </div>

          <motion.div 
            className="grid gap-6 md:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {PERSONAS.map((persona) => (
              <motion.div key={persona.role} variants={itemVariants}>
                <div className="group relative h-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 rounded-2xl p-8 transition-all duration-300 flex flex-col">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon icon={persona.icon} className="h-6 w-6" />
                  </div>

                  <div className="flex-1">
                    <Text as="h3" variant="h4" weight="semibold" className="text-white mb-1">
                      {persona.name}
                    </Text>
                    <code className="text-base text-primary/60 font-mono block mb-4">
                      {persona.email}
                    </code>
                    <Text as="p" color="secondary" className="text-[1.0625rem] leading-relaxed mb-8 opacity-70">
                      {persona.description}
                    </Text>
                  </div>

                  <form action={async () => {
                    setDemoRole(persona.role);
                    await loginAsRole(persona.role);
                  }}>
                    <button 
                      type="submit"
                      className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-white text-black text-[1.0625rem] font-semibold hover:bg-gray-200 active:scale-[0.98] transition-all"
                    >
                      Launch
                      <Icon icon="tabler:arrow-right" className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="mt-20 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
          >
            <Text as="p" variant="small" className="text-white/20 font-medium">
              Demo environment — select a persona to test features immediately
            </Text>
          </motion.div>
        </Container>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#030406] flex items-center justify-center text-white/50">Initializing...</div>}>
      <LoginForm />
    </Suspense>
  );
}
