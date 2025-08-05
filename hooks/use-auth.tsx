"use client"

import type React from "react"
import { useState, useEffect, useCallback, createContext, useContext } from "react"
import { userManager, type User, type UserRole } from "@/lib/user-management"

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface LoginCredentials {
  username: string
  password: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  hasRole: (requiredRole: UserRole | UserRole[]) => boolean
  refreshSession: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession()
  }, [])

  const checkExistingSession = useCallback(() => {
    try {
      const sessionData = localStorage.getItem("auth_session")
      if (sessionData) {
        const { user, expiresAt } = JSON.parse(sessionData)

        // Check if session is still valid
        if (new Date().getTime() < expiresAt) {
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true,
          })
          return
        } else {
          // Session expired, clear it
          localStorage.removeItem("auth_session")
        }
      }
    } catch (error) {
      console.error("Error checking session:", error)
      localStorage.removeItem("auth_session")
    }

    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    })
  }, [])

  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = userManager.authenticateUser(credentials.username, credentials.password)

      if (result.success && result.user) {
        // Calculate session expiration (24 hours for superadmin, 8 hours for others)
        const sessionDuration = result.user.role === "superadmin" ? 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000
        const expiresAt = new Date().getTime() + sessionDuration

        // Store session
        const sessionData = {
          user: result.user,
          expiresAt,
        }
        localStorage.setItem("auth_session", JSON.stringify(sessionData))

        setAuthState({
          user: result.user,
          isLoading: false,
          isAuthenticated: true,
        })

        return { success: true }
      } else {
        return { success: false, error: result.error || "Login gagal" }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "Terjadi kesalahan sistem" }
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("auth_session")
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    })
  }, [])

  const hasRole = useCallback(
    (requiredRole: UserRole | UserRole[]): boolean => {
      if (!authState.user) return false

      // Superadmin has access to everything
      if (authState.user.role === "superadmin") return true

      if (Array.isArray(requiredRole)) {
        return requiredRole.includes(authState.user.role)
      }

      return authState.user.role === requiredRole
    },
    [authState.user],
  )

  const refreshSession = useCallback(() => {
    checkExistingSession()
  }, [checkExistingSession])

  const contextValue: AuthContextType = {
    user: authState.user,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    login,
    logout,
    hasRole,
    refreshSession,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
