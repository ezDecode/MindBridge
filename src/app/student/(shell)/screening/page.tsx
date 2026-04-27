"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { Button, Card, Text } from "@/components/ui";
import { cn } from "@/lib/utils";

const quizzes: Record<string, { title: string; questions: string[] }> = {
  'PHQ-9': {
    title: 'PHQ-9 Depression Screening',
    questions: [
      'Little interest or pleasure in doing things?',
      'Feeling down, depressed, or hopeless?',
      'Trouble falling or staying asleep?',
      'Feeling tired or having little energy?',
      'Poor appetite or overeating?',
      'Feeling bad about yourself?',
      'Trouble concentrating on things?',
      'Moving or speaking too slowly or being restless?',
      'Thoughts of being better off dead?'
    ]
  },
  'GAD-7': {
    title: 'GAD-7 Anxiety Screening',
    questions: [
      'Feeling nervous, anxious, or on edge?',
      'Not being able to stop or control worrying?',
      'Worrying too much about different things?',
      'Trouble relaxing?',
      'Being so restless it is hard to sit still?',
      'Becoming easily annoyed or irritable?',
      'Feeling afraid as if something awful might happen?'
    ]
  }
};

type QuizResult = { score: number; severity: string; badge: string; rec: string };
type QuizStateData = { step: number; answers: number[]; result: QuizResult | null };

export default function ScreeningPage() {
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);
  const [quizState, setQuizState] = useState<Record<string, QuizStateData>>({
    'PHQ-9': { step: 0, answers: [], result: null },
    'GAD-7': { step: 0, answers: [], result: null }
  });
  
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    };
  }, []);

  const clearAutoAdvance = () => {
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
  };

  const startQuiz = (type: string) => {
    clearAutoAdvance();
    setActiveQuiz(type);
  };

  const selectOption = (val: number) => {
    if (!activeQuiz) return;
    const currentQuiz = quizState[activeQuiz];
    const newAnswers = [...currentQuiz.answers];
    newAnswers[currentQuiz.step] = val;

    setQuizState(prev => ({
      ...prev,
      [activeQuiz]: { ...prev[activeQuiz], answers: newAnswers }
    }));
    
    clearAutoAdvance();

    const total = quizzes[activeQuiz].questions.length;
    autoAdvanceTimer.current = setTimeout(() => {
      if (currentQuiz.step < total - 1) {
        setQuizState(prev => ({
          ...prev,
          [activeQuiz]: { ...prev[activeQuiz], step: prev[activeQuiz].step + 1 }
        }));
      } else {
        calculateResults(activeQuiz, newAnswers);
      }
      autoAdvanceTimer.current = null;
    }, 300);
  };

  const nextStep = () => {
    clearAutoAdvance();
    if (!activeQuiz) return;
    const currentQuiz = quizState[activeQuiz];
    if (currentQuiz.answers[currentQuiz.step] === undefined) return;
    
    const total = quizzes[activeQuiz].questions.length;
    if (currentQuiz.step < total - 1) {
      setQuizState(prev => ({
        ...prev,
        [activeQuiz]: { ...prev[activeQuiz], step: prev[activeQuiz].step + 1 }
      }));
    } else {
      calculateResults(activeQuiz, currentQuiz.answers);
    }
  };

  const prevStep = () => {
    clearAutoAdvance();
    if (!activeQuiz) return;
    const currentQuiz = quizState[activeQuiz];
    if (currentQuiz.step > 0) {
      setQuizState(prev => ({
        ...prev,
        [activeQuiz]: { ...prev[activeQuiz], step: prev[activeQuiz].step - 1 }
      }));
    }
  };

  const calculateResults = (quizId: string, quizAnswers: number[]) => {
    const score = quizAnswers.reduce((a, b) => a + b, 0);
    let severity, badge, rec;
    
    if (quizId === 'PHQ-9') {
      if (score <= 4) { severity = 'Minimal'; badge = 'badge-primary'; rec = 'Keep up your healthy habits! Continue using our wellness resources and mood tracker.'; }
      else if (score <= 9) { severity = 'Mild'; badge = 'badge-primary'; rec = 'Consider exploring our stress management resources and peer support forum.'; }
      else if (score <= 14) { severity = 'Moderate'; badge = 'bg-warning/10 text-warning border-warning/20'; rec = 'We strongly recommend booking a session with a campus counselor.'; }
      else { severity = 'Severe'; badge = 'bg-danger/10 text-danger border-danger/20'; rec = 'Please reach out to a campus counselor as soon as possible.'; }
    } else {
      if (score <= 5) { severity = 'Minimal'; badge = 'badge-primary'; rec = 'You seem to be coping well. Continue with self-care practices.'; }
      else if (score <= 12) { severity = 'Mild'; badge = 'badge-primary'; rec = 'Try our relaxation exercises and journaling to manage what you are feeling.'; }
      else if (score <= 20) { severity = 'Moderate'; badge = 'bg-warning/10 text-warning border-warning/20'; rec = 'Consider booking a counselor session. You do not have to handle this alone.'; }
      else { severity = 'Severe'; badge = 'bg-danger/10 text-danger border-danger/20'; rec = 'Please book a counselor session urgently or call a helpline.'; }
    }
    const resultObj = { score, severity, badge, rec: rec || '' };
    setQuizState(prev => ({
      ...prev,
      [quizId]: { ...prev[quizId], result: resultObj }
    }));
  };

  if (activeQuiz) {
    const activeState = quizState[activeQuiz];
    const q = quizzes[activeQuiz];

    return (
      <div className="max-w-2xl mx-auto space-y-8 pb-20">
        <button 
          className="flex items-center gap-2 text-base font-medium text-text-dim hover:text-white transition-colors " 
          onClick={() => {
            clearAutoAdvance();
            setActiveQuiz(null);
          }}
        >
          <Icon icon="tabler:arrow-left" /> Back to assessments
        </button>

        <div className="flex gap-2 p-1 bg-surface border border-border rounded-lg">
          {Object.keys(quizzes).map(quizId => (
            <button
              key={quizId}
              onClick={() => { clearAutoAdvance(); setActiveQuiz(quizId); }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all",
                activeQuiz === quizId 
                  ? "bg-primary/10 text-primary" 
                  : "text-text-dim hover:text-white hover:bg-white/5"
              )}
            >
              {quizId}
              {quizState[quizId].result && <Icon icon="tabler:circle-check-filled" className="text-primary" />}
            </button>
          ))}
        </div>

        {activeState.result ? (
          <Card padding="lg" className="bg-surface border-border text-center py-16">
            <div className="size-16 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto mb-8">
              <Icon icon="tabler:chart-bar" className="text-2xl" />
            </div>
            <Text as="h3" variant="h3" weight="semibold" className="mb-2">{activeQuiz} Results</Text>
            <div className="text-2xl font-bold tabular-nums text-white my-8 tracking-tight">{activeState.result.score}</div>
            <span className={cn("badge px-4 py-1.5 text-base", activeState.result.badge)}>{activeState.result.severity}</span>
            
            <div className="bg-background/50 border border-white/5 rounded-lg p-6 my-10 text-left relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform">
                <Icon icon="tabler:info-circle" className="h-12 w-12" />
              </div>
              <div className="relative z-10">
                <Text variant="small" weight="medium" className="text-primary mb-3 flex items-center gap-2">
                  <Icon icon="tabler:info-circle" />
                  What this means
                </Text>
                <Text color="secondary" className="text-[1.0625rem] leading-relaxed">{activeState.result.rec}</Text>
              </div>
            </div>

            {activeQuiz === 'PHQ-9' && !quizState['GAD-7'].result && (
               <div className="bg-primary/5 border border-primary/20 p-5 rounded-lg text-left flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
                 <div>
                   <Text weight="semibold" className="text-white mb-1">Complete your screening</Text>
                   <Text variant="small" color="secondary">Take the GAD-7 anxiety screening for a full overview of your mental wellbeing.</Text>
                 </div>
                 <Button onClick={() => setActiveQuiz('GAD-7')} size="sm" className="whitespace-nowrap shrink-0">Start GAD-7</Button>
               </div>
            )}
            {activeQuiz === 'GAD-7' && !quizState['PHQ-9'].result && (
               <div className="bg-primary/5 border border-primary/20 p-5 rounded-lg text-left flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
                 <div>
                   <Text weight="semibold" className="text-white mb-1">Complete your screening</Text>
                   <Text variant="small" color="secondary">Take the PHQ-9 depression screening for a full overview of your mental wellbeing.</Text>
                 </div>
                 <Button onClick={() => setActiveQuiz('PHQ-9')} size="sm" className="whitespace-nowrap shrink-0">Start PHQ-9</Button>
               </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="gap-2">
                <Icon icon="tabler:calendar-event" className="typo-subtitle" />
                Book Counselor
              </Button>
              <Button variant="warm" size="lg" className="gap-2">
                <Icon icon="tabler:books" className="typo-subtitle" />
                View Resources
              </Button>
            </div>
            
            <Text variant="small" className="text-text-dim text-base font-medium mt-12 block">
              Standardized screening · Not a clinical diagnosis
            </Text>
          </Card>
        ) : (
          <Card padding="lg" className="bg-surface border-border">
            <div className="flex items-center justify-between mb-10">
              <Text as="h3" variant="body" weight="semibold" className="text-white">{q.title}</Text>
              <span className="badge badge-outline text-base px-3">Question {activeState.step + 1} <span className="text-text-dim">/ {q.questions.length}</span></span>
            </div>

            <div className="flex gap-1.5 mb-12">
              {q.questions.map((_, i) => (
                <div key={i} className={cn(
                  "flex-1 h-1 rounded-full transition-all duration-300",
                  i < activeState.step ? "bg-primary" : i === activeState.step ? "bg-primary/40" : "bg-white/5"
                )} />
              ))}
            </div>

            <div className="min-h-[340px] flex flex-col">
              <Text as="h4" weight="semibold" className="typo-subtitle text-white mb-10 leading-snug">
                Over the last 2 weeks, how often have you been bothered by: <span className="text-primary italic">&ldquo;{q.questions[activeState.step]}&rdquo;</span>
              </Text>

              <div className="space-y-2 mt-auto">
                {['Not at all', 'Several days', 'More than half the days', 'Nearly every day'].map((opt, i) => (
                  <button 
                    key={i} 
                    className={cn(
                      "w-full p-4 rounded-md border flex items-center gap-4 transition-all text-left group",
                      activeState.answers[activeState.step] === i 
                        ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20" 
                        : "bg-background border-border hover:border-white/20 hover:bg-white/2"
                    )}
                    onClick={() => selectOption(i)}
                  >
                    <div className={cn(
                      "size-4 rounded-full border flex items-center justify-center transition-all",
                      activeState.answers[activeState.step] === i ? "border-primary bg-primary" : "border-text-dim group-hover:border-white/40"
                    )}>
                      {activeState.answers[activeState.step] === i && <div className="size-1.5 rounded-full bg-black" />}
                    </div>
                    <span className={cn(
                      "text-[1.0625rem] font-medium transition-colors",
                      activeState.answers[activeState.step] === i ? "text-white" : "text-text-muted group-hover:text-white"
                    )}>{opt}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between mt-12 pt-8 border-t border-white/5">
              <Button variant="ghost" className={cn("px-6", activeState.step === 0 && "invisible")} onClick={prevStep}>
                <Icon icon="tabler:arrow-left" /> Previous
              </Button>
              <Button size="md" onClick={nextStep} disabled={activeState.answers[activeState.step] === undefined} className="px-8 gap-2">
                {activeState.step === q.questions.length - 1 ? 'See Results' : 'Next Question'}
                <Icon icon="tabler:arrow-right" />
              </Button>
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { id: 'PHQ-9', title: 'PHQ-9', sub: 'Depression screening', desc: 'A standardized tool for clinical depression assessment.', meta: '9 questions · ~3 mins', icon: 'tabler:mood-sad', color: 'text-primary' },
          { id: 'GAD-7', title: 'GAD-7', sub: 'Anxiety screening', desc: 'Measure anxiety severity with this professional metric.', meta: '7 questions · ~2 mins', icon: 'tabler:alert-circle', color: 'text-secondary' }
        ].map((quiz) => (
          <Card key={quiz.id} padding="lg" className="bg-surface border-border flex flex-col h-full group hover:border-white/20 transition-all cursor-pointer" onClick={() => startQuiz(quiz.id)}>
            <div className={cn("size-12 rounded bg-white/5 flex items-center justify-center mb-8 transition-colors", quiz.color)}>
              <Icon icon={quiz.icon} className="text-2xl" />
            </div>
            <div className="mb-8 flex-1">
              <div className="flex items-center justify-between mb-2">
                <Text weight="semibold" className="text-white typo-subtitle">{quiz.title}</Text>
                <div className="flex items-center gap-2">
                  {quizState[quiz.id].result && <Icon icon="tabler:circle-check-filled" className="text-primary text-xl" />}
                  <span className="badge badge-outline text-base border-white/5 bg-white/5">Confidential</span>
                </div>
              </div>
              <Text variant="small" className="text-text-dim text-base font-medium mb-4 block">{quiz.sub}</Text>
              <Text color="secondary" className="text-[1.0625rem] leading-relaxed">{quiz.desc}</Text>
            </div>
            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
              <Text variant="small" className="text-text-dim text-base font-medium ">{quiz.meta}</Text>
              <Button size="sm" className="gap-1">
                {quizState[quiz.id].result ? 'Retake' : 'Start'} <Icon icon="tabler:chevron-right" className="text-base" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card padding="lg" className="bg-primary/5 border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none transform rotate-12 transition-transform duration-700">
          <Icon icon="tabler:shield-check" className="h-32 w-32 text-primary" />
        </div>
        <div className="relative z-10 flex items-start gap-6">
          <div className="size-12 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Icon icon="tabler:lock" className="text-2xl" />
          </div>
          <div>
            <Text weight="semibold" className="text-white mb-2">Standardized & Private</Text>
            <Text color="secondary" className="text-[1.0625rem] leading-relaxed max-w-[70ch]">
              Standardized assessment results are completely confidential. They are only accessible to you and shared with campus counseling staff only if you explicitly choose to include them in a session booking.
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
}
