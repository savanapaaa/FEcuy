"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  username: string
  email: string
  role: "superadmin" | "admin" | "operator" | "validator" | "supervisor" | "form" | "review" | "validasi" | "rekap"
  fullName: string
  isActive: boolean
  createdAt: string
  lastLogin?: string
  permissions: string[]
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  hasPermission: (permission: string) => boolean
  hasRole: (roles: string | string[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for demo - in production this would come from API
const mockUsers: User[] = [
  {
    id: "1",
    username: "superadmin",
    email: "superadmin@diskominfo.go.id",
    role: "superadmin",
    fullName: "Super Administrator",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    lastLogin: new Date().toISOString(),
    permissions: ["*"], // All permissions
  },
  {
    id: "2",
    username: "admin",
    email: "admin@diskominfo.go.id",
    role: "admin",
    fullName: "Administrator System",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    lastLogin: new Date().toISOString(),
    permissions: [
      "submissions.read",
      "submissions.write",
      "submissions.delete",
      "content.review",
      "content.validate",
      "users.manage",
    ],
  },
  {
    id: "3",
    username: "operator1",
    email: "operator1@diskominfo.go.id",
    role: "operator",
    fullName: "Operator Produksi 1",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    lastLogin: new Date().toISOString(),
    permissions: ["submissions.read", "submissions.write", "content.create"],
  },
  {
    id: "4",
    username: "validator1",
    email: "validator1@diskominfo.go.id",
    role: "validator",
    fullName: "Validator Konten 1",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    lastLogin: new Date().toISOString(),
    permissions: ["submissions.read", "content.validate", "content.takedown"],
  },
  {
    id: "5",
    username: "supervisor1",
    email: "supervisor1@diskominfo.go.id",
    role: "supervisor",
    fullName: "Supervisor Bidang",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    lastLogin: new Date().toISOString(),
    permissions: ["submissions.read", "content.review", "content.approve", "reports.view"],
  },
  {
    id: "6",
    username: "reviewer1",
    email: "reviewer1@diskominfo.go.id",
    role: "review",
    fullName: "Content Reviewer 1",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    lastLogin: new Date().toISOString(),
    permissions: ["submissions.read", "content.review", "content.approve", "content.reject"],
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem("currentUser")
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Error parsing saved user:", error)
        localStorage.removeItem("currentUser")
      }
    }
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Mock authentication - in real app, this would be an API call
      const foundUser = mockUsers.find((u) => u.username === username && u.isActive)
      if (foundUser && password === "password") {
        // Simple mock password
        const updatedUser = {
          ...foundUser,
          lastLogin: new Date().toISOString(),
        }
        setUser(updatedUser)
        setIsAuthenticated(true)
        localStorage.setItem("currentUser", JSON.stringify(updatedUser))
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("currentUser")
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    if (user.permissions.includes("*")) return true
    return user.permissions.includes(permission)
  }

  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(user.role)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, hasPermission, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Helper function to get current user
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null

  const savedUser = localStorage.getItem("currentUser")
  if (savedUser) {
    try {
      return JSON.parse(savedUser)
    } catch (error) {
      console.error("Error parsing current user:", error)
      return null
    }
  }

  // Return default admin user for demo if no user is logged in
  return {
    id: "1",
    username: "admin",
    email: "admin@diskominfo.go.id",
    role: "admin",
    fullName: "Administrator System",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    lastLogin: new Date().toISOString(),
    permissions: ["*"],
  }
}

// Helper function to get user display name
export function getUserDisplayName(user: User | null): string {
  if (!user) return "Unknown User"
  return user.fullName || user.username || "Unknown User"
}

// Helper function to check if user can perform action
export function canUserPerformAction(action: string, user: User | null = null): boolean {
  const currentUser = user || getCurrentUser()
  if (!currentUser) return false
  if (currentUser.permissions.includes("*")) return true
  return currentUser.permissions.includes(action)
}
