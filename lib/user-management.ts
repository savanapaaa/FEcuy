export interface User {
  id: string
  username: string
  password: string
  role: UserRole
  fullName: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLogin?: string
}

export type UserRole = "superadmin" | "form" | "review" | "validasi" | "rekap"

export interface AuthResult {
  success: boolean
  user?: User
  error?: string
}

class UserManager {
  private users: User[] = []
  private storageKey = "user_management_data"

  constructor() {
    this.loadFromStorage()
    this.initializeDefaultUsers()
  }

  private loadFromStorage() {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(this.storageKey)
        if (stored) {
          this.users = JSON.parse(stored)
        }
      } catch (error) {
        console.error("Error loading users from storage:", error)
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.users))
      } catch (error) {
        console.error("Error saving users to storage:", error)
      }
    }
  }

  private initializeDefaultUsers() {
    if (this.users.length === 0) {
      this.users = [
        {
          id: "1",
          username: "superadmin",
          password: "super123",
          role: "superadmin",
          fullName: "Super Administrator",
          isActive: true,
          createdAt: new Date("2024-01-01").toISOString(),
          updatedAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        },
        {
          id: "2",
          username: "form_user",
          password: "form123",
          role: "form",
          fullName: "Form User",
          isActive: true,
          createdAt: new Date("2024-01-01").toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "3",
          username: "reviewer",
          password: "review123",
          role: "review",
          fullName: "Content Reviewer",
          isActive: true,
          createdAt: new Date("2024-01-01").toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "4",
          username: "validator",
          password: "validasi123",
          role: "validasi",
          fullName: "Content Validator",
          isActive: true,
          createdAt: new Date("2024-01-01").toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "5",
          username: "rekap_user",
          password: "rekap123",
          role: "rekap",
          fullName: "Report User",
          isActive: true,
          createdAt: new Date("2024-01-01").toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      this.saveToStorage()
    }
  }

  authenticateUser(username: string, password: string): AuthResult {
    const user = this.users.find((u) => u.username === username && u.isActive)

    if (!user) {
      return { success: false, error: "Username tidak ditemukan atau user tidak aktif" }
    }

    if (user.password !== password) {
      return { success: false, error: "Password salah" }
    }

    // Update last login
    user.lastLogin = new Date().toISOString()
    user.updatedAt = new Date().toISOString()
    this.saveToStorage()

    return { success: true, user }
  }

  getAllUsers(): User[] {
    return [...this.users] // Return copy to prevent direct mutation
  }

  getActiveUsers(): User[] {
    return this.users.filter((user) => user.isActive)
  }

  getUserById(id: string): User | undefined {
    return this.users.find((user) => user.id === id)
  }

  createUser(userData: { username: string; password: string; fullName: string; role: UserRole }): AuthResult {
    // Validate input
    if (!userData.username || !userData.password || !userData.fullName || !userData.role) {
      return { success: false, error: "Semua field harus diisi" }
    }

    // Check if username already exists
    const existingUser = this.users.find((u) => u.username.toLowerCase() === userData.username.toLowerCase())
    if (existingUser) {
      return { success: false, error: "Username sudah digunakan" }
    }

    // Generate unique ID
    const newId = Date.now().toString() + Math.random().toString(36).substr(2, 9)

    const newUser: User = {
      id: newId,
      username: userData.username.trim(),
      password: userData.password,
      fullName: userData.fullName.trim(),
      role: userData.role,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.users.push(newUser)
    this.saveToStorage()

    return { success: true, user: newUser }
  }

  updateUser(id: string, userData: Partial<Omit<User, "id" | "createdAt">>): AuthResult {
    const userIndex = this.users.findIndex((u) => u.id === id)
    if (userIndex === -1) {
      return { success: false, error: "User tidak ditemukan" }
    }

    // Check if username is being changed and already exists
    if (userData.username) {
      const existingUser = this.users.find(
        (u) => u.username.toLowerCase() === userData.username!.toLowerCase() && u.id !== id,
      )
      if (existingUser) {
        return { success: false, error: "Username sudah digunakan" }
      }
    }

    // Update user data
    const updatedUser = {
      ...this.users[userIndex],
      ...userData,
      updatedAt: new Date().toISOString(),
    }

    // Trim string fields
    if (updatedUser.username) updatedUser.username = updatedUser.username.trim()
    if (updatedUser.fullName) updatedUser.fullName = updatedUser.fullName.trim()

    this.users[userIndex] = updatedUser
    this.saveToStorage()

    return { success: true, user: updatedUser }
  }

  deleteUser(id: string): AuthResult {
    const userIndex = this.users.findIndex((u) => u.id === id)
    if (userIndex === -1) {
      return { success: false, error: "User tidak ditemukan" }
    }

    const user = this.users[userIndex]

    // Don't allow deleting the last superadmin
    if (user.role === "superadmin") {
      const activeAdmins = this.users.filter((u) => u.role === "superadmin" && u.isActive)
      if (activeAdmins.length <= 1) {
        return { success: false, error: "Tidak dapat menghapus superadmin terakhir" }
      }
    }

    // Remove user completely
    this.users.splice(userIndex, 1)
    this.saveToStorage()

    return { success: true }
  }

  toggleUserStatus(id: string): AuthResult {
    const userIndex = this.users.findIndex((u) => u.id === id)
    if (userIndex === -1) {
      return { success: false, error: "User tidak ditemukan" }
    }

    const user = this.users[userIndex]

    // Don't allow deactivating the last active superadmin
    if (user.role === "superadmin" && user.isActive) {
      const activeAdmins = this.users.filter((u) => u.role === "superadmin" && u.isActive)
      if (activeAdmins.length <= 1) {
        return { success: false, error: "Tidak dapat menonaktifkan superadmin terakhir" }
      }
    }

    user.isActive = !user.isActive
    user.updatedAt = new Date().toISOString()
    this.saveToStorage()

    return { success: true, user }
  }

  // Utility methods
  getUsersByRole(role: UserRole): User[] {
    return this.users.filter((user) => user.role === role)
  }

  getActiveUsersByRole(role: UserRole): User[] {
    return this.users.filter((user) => user.role === role && user.isActive)
  }

  getUserStats() {
    return {
      total: this.users.length,
      active: this.users.filter((u) => u.isActive).length,
      inactive: this.users.filter((u) => !u.isActive).length,
      byRole: {
        superadmin: this.users.filter((u) => u.role === "superadmin").length,
        form: this.users.filter((u) => u.role === "form").length,
        review: this.users.filter((u) => u.role === "review").length,
        validasi: this.users.filter((u) => u.role === "validasi").length,
        rekap: this.users.filter((u) => u.role === "rekap").length,
      },
    }
  }

  getRoleDisplayName(role: UserRole): string {
    const roleNames = {
      superadmin: "Super Administrator",
      form: "Form User",
      review: "Content Reviewer",
      validasi: "Content Validator",
      rekap: "Report User",
    }
    return roleNames[role] || role
  }

  getRolePermissions(role: UserRole): string[] {
    const permissions = {
      superadmin: ["Semua akses sistem", "Manajemen user", "Semua fitur"],
      form: ["Pengajuan konten", "Lihat riwayat pengajuan"],
      review: ["Review konten", "Approve/reject konten"],
      validasi: ["Validasi konten", "Final approval"],
      rekap: ["Lihat laporan", "Export data", "Statistik"],
    }
    return permissions[role] || []
  }

  // Clear all data (for testing purposes)
  clearAllData(): void {
    this.users = []
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.storageKey)
    }
    this.initializeDefaultUsers()
  }

  // Export data
  exportUsers(): string {
    return JSON.stringify(this.users, null, 2)
  }

  // Import data
  importUsers(jsonData: string): AuthResult {
    try {
      const importedUsers = JSON.parse(jsonData)
      if (!Array.isArray(importedUsers)) {
        return { success: false, error: "Format data tidak valid" }
      }

      // Validate imported users
      for (const user of importedUsers) {
        if (!user.id || !user.username || !user.password || !user.role || !user.fullName) {
          return { success: false, error: "Data user tidak lengkap" }
        }
      }

      this.users = importedUsers
      this.saveToStorage()
      return { success: true }
    } catch (error) {
      return { success: false, error: "Error parsing JSON data" }
    }
  }
}

export const userManager = new UserManager()
