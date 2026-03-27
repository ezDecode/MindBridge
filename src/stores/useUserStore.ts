import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  nickname: string;
  isAnonymous: boolean;
  language: string;
  focusAreas: string[];
  initialMood: string | null;
  emotionalState: string | null;
  emotionalContext: string | null;
  emotionalIntensity: number;
  hasCompletedOnboarding: boolean;
  setNickname: (name: string) => void;
  setAnonymous: (anonymous: boolean) => void;
  setLanguage: (lang: string) => void;
  toggleFocusArea: (area: string) => void;
  setInitialMood: (mood: string) => void;
  setEmotionalState: (state: string) => void;
  setEmotionalContext: (context: string) => void;
  setEmotionalIntensity: (intensity: number) => void;
  completeOnboarding: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      nickname: "",
      isAnonymous: true,
      language: "en",
      focusAreas: [],
      initialMood: null,
      emotionalState: null,
      emotionalContext: null,
      emotionalIntensity: 50,
      hasCompletedOnboarding: false,
      setNickname: (nickname) => set({ nickname, isAnonymous: false }),
      setAnonymous: (isAnonymous) => set({ isAnonymous, nickname: isAnonymous ? "" : "" }),
      setLanguage: (language) => set({ language }),
      toggleFocusArea: (area) =>
        set((state) => ({
          focusAreas: state.focusAreas.includes(area)
            ? state.focusAreas.filter((a) => a !== area)
            : [...state.focusAreas, area],
        })),
      setInitialMood: (initialMood) => set({ initialMood }),
      setEmotionalState: (emotionalState) => set({ emotionalState }),
      setEmotionalContext: (emotionalContext) => set({ emotionalContext }),
      setEmotionalIntensity: (emotionalIntensity) => set({ emotionalIntensity }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
    }),
    {
      name: "mindbridge-user-storage",
    }
  )
);
