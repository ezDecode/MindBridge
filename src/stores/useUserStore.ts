import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  nickname: string;
  isAnonymous: boolean;
  language: string;
  focusAreas: string[];
  initialMood: string | null;
  permissions: {
    notifications: boolean;
    camera: boolean;
  };
  setNickname: (name: string) => void;
  setAnonymous: (anonymous: boolean) => void;
  setLanguage: (lang: string) => void;
  toggleFocusArea: (area: string) => void;
  setInitialMood: (mood: string) => void;
  setPermissions: (perms: Partial<UserState["permissions"]>) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      nickname: "",
      isAnonymous: false,
      language: "en",
      focusAreas: [],
      initialMood: null,
      permissions: {
        notifications: false,
        camera: false,
      },
      setNickname: (nickname) => set({ nickname, isAnonymous: false }),
      setAnonymous: (isAnonymous) => set({ isAnonymous, nickname: isAnonymous ? "Anonymous User" : "" }),
      setLanguage: (language) => set({ language }),
      toggleFocusArea: (area) =>
        set((state) => ({
          focusAreas: state.focusAreas.includes(area)
            ? state.focusAreas.filter((a) => a !== area)
            : [...state.focusAreas, area],
        })),
      setInitialMood: (initialMood) => set({ initialMood }),
      setPermissions: (perms) =>
        set((state) => ({
          permissions: { ...state.permissions, ...perms },
        })),
    }),
    {
      name: "mindbridge-user-storage",
    }
  )
);
