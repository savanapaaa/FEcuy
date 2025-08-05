import type { User } from "@/hooks/use-auth"

export interface SessionData {
  user: User
  loginTime: string
}

export const validateSession = (sessionData: SessionData | null): boolean => {
  if (!sessionData) return false

  const { user, loginTime } = sessionData
  const sessionAge = Date.now() - new Date(loginTime).getTime()

  // Session duration based on role
  const maxAge =
    user.role === "admin" || user.role === "super_admin"
      ? 24 * 60 * 60 * 1000 // 24 hours for admin
      : 8 * 60 * 60 * 1000 // 8 hours for user

  return sessionAge < maxAge
}

export const getStoredSession = (): SessionData | null => {
  if (typeof window === "undefined") return null

  try {
    const adminSession = localStorage.getItem("admin_session")
    const userSession = localStorage.getItem("user_session")

    if (adminSession) {
      const sessionData = JSON.parse(adminSession)
      return validateSession(sessionData) ? sessionData : null
    }

    if (userSession) {
      const sessionData = JSON.parse(userSession)
      return validateSession(sessionData) ? sessionData : null
    }

    return null
  } catch (error) {
    console.error("Error getting stored session:", error)
    return null
  }
}

export const clearAllSessions = (): void => {
  if (typeof window === "undefined") return

  localStorage.removeItem("admin_session")
  localStorage.removeItem("user_session")
}

export const hasValidSession = (): boolean => {
  const session = getStoredSession()
  return session !== null
}

export const getUserFromSession = (): User | null => {
  const session = getStoredSession()
  return session?.user || null
}
