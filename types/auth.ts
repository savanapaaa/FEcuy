export interface User {
  id: string
  username: string
  password: string
  role: UserRole
  name: string
  isActive: boolean
  createdAt: Date
  lastLogin?: Date
}

export type UserRole = "superadmin" | "form" | "review" | "validasi" | "rekap"

export interface AuthResult {
  success: boolean
  user?: User
  error?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  hasRole: (requiredRole: UserRole | UserRole[]) => boolean
  refreshSession: () => void
}
