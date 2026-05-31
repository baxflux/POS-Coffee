/**
 * Auth store — current session (userId, role, displayName).
 *
 * Demo-grade auth for the MVP: credentials are validated against the
 * seed users in `lib/mock-data`. Session is persisted to localStorage
 * under `pos-coffee-auth` so reloading the browser keeps the user logged
 * in, satisfying the PC-3 acceptance criterion.
 *
 * This is intentionally NOT a secure auth system — passwords are plain
 * text and validation happens in the browser. It exists only to drive
 * role-based UI gating for the demo.
 */

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import type { Role } from "@/types"
import { SEED_USERS } from "@/lib/mock-data"

export interface AuthSession {
  userId: string
  role: Role
  displayName: string
  username: string
}

export type LoginResult =
  | { ok: true; session: AuthSession }
  | { ok: false; error: string }

interface AuthState {
  session: AuthSession | null
  /**
   * True once the persisted snapshot has been merged into memory.
   * Route guards check this to avoid flashing the login screen during
   * the initial localStorage rehydration on the client.
   */
  hasHydrated: boolean
}

interface AuthActions {
  /**
   * Validate credentials against the seed users. Username comparison is
   * case-sensitive and whitespace-trimmed; password is compared exactly.
   */
  login: (username: string, password: string) => LoginResult
  logout: () => void
  setHasHydrated: (value: boolean) => void
}

export type AuthStore = AuthState & AuthActions

const INVALID_CREDENTIALS_MESSAGE = "Invalid username or password."

const initialState: AuthState = {
  session: null,
  hasHydrated: false,
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      login: (username, password) => {
        const trimmedUsername = username.trim()
        const user = SEED_USERS.find(
          (candidate) =>
            candidate.username === trimmedUsername &&
            candidate.password === password
        )
        if (!user) {
          return { ok: false, error: INVALID_CREDENTIALS_MESSAGE }
        }
        const session: AuthSession = {
          userId: user.id,
          role: user.role,
          displayName: user.displayName,
          username: user.username,
        }
        set({ session })
        return { ok: true, session }
      },

      logout: () => set({ session: null }),

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "pos-coffee-auth",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // Only persist the session itself; transient flags stay in memory.
      partialize: (state) => ({ session: state.session }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

export const AUTH_ERROR_MESSAGE = INVALID_CREDENTIALS_MESSAGE
