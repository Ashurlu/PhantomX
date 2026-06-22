import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "admin" | "analyst";

interface AuthState {
  token: string | null;
  role: Role | null;
  username: string | null;
  avatarUrl: string | null;
  login: (token: string, role: Role, username: string, avatarUrl?: string | null) => void;
  setAvatarUrl: (avatarUrl: string | null) => void;
  setUsername: (username: string) => void;
  setToken: (token: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      role: null,
      username: null,
      avatarUrl: null,
      login: (token, role, username, avatarUrl = null) =>
        set({ token, role, username, avatarUrl }),
      setAvatarUrl: (avatarUrl) => set({ avatarUrl }),
      setUsername: (username) => set({ username }),
      setToken: (token) => set({ token }),
      logout: () => set({ token: null, role: null, username: null, avatarUrl: null }),
      isAdmin: () => get().role === "admin",
    }),
    { name: "sentrix-auth" }
  )
);
