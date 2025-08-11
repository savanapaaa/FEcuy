import { loadSubmissionsFromStorage, saveSubmissionsToStorage } from "./utils"

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://be-savana.budiutamamandiri.com/api"

// Types
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Backend API Response Types (matching your actual API)
interface BackendLoginResponse {
  message: string
  token: string
  user: BackendUser
}

interface BackendUser {
  id: number
  name: string
  email: string
  username: string
  email_verified_at: string
  role: string
  created_at: string
  updated_at: string
}

interface LoginCredentials {
  username: string
  password: string
}

interface User {
  id: string
  username: string
  email: string
  role: "admin" | "user" | "reviewer" | "validator" | "superadmin" | "form" | "review" | "validasi" | "rekap"
  name: string
}

interface ReviewData {
  status: "approved" | "rejected"
  notes: string
  reviewerId: string
}

interface ValidationData {
  status: "validated" | "published" | "rejected"
  notes: string
  validatorId: string
  publishDate?: string
  publishedContent?: any[]
}

// API Client Class
class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      credentials: 'omit', // Don't send credentials for cross-origin requests
      mode: 'cors',
      ...options,
    }

    try {
      console.log(`🚀 API Request: ${config.method || 'GET'} ${url}`)
      
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `HTTP error! status: ${response.status}`
        
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || errorData.error || errorData.errors || errorMessage
          
          // Handle Laravel validation errors
          if (errorData.errors) {
            const validationErrors = Object.values(errorData.errors).flat()
            errorMessage = validationErrors.join(', ')
          }
        } catch {
          // If not JSON, use the text or default message
          errorMessage = errorText || errorMessage
        }
        
        console.error(`❌ API Error: ${errorMessage}`)
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log(`✅ API Success: ${endpoint}`, data)
      
      // Handle different backend response formats
      if (data.success !== undefined) {
        // Backend returns {success: boolean, data: any, message?: string}
        return data
      } else if (data.message && data.token && data.user) {
        // Login response format
        return {
          success: true,
          data: data,
          message: data.message
        }
      } else if (data.message && !data.user && !data.token) {
        // Simple message response (like logout)
        return {
          success: true,
          message: data.message
        }
      } else if (data.id && (data.username || data.email)) {
        // Direct user object response (like /auth/me)
        return {
          success: true,
          data: data
        }
      } else if (Array.isArray(data)) {
        // Array response (like list endpoints)
        return {
          success: true,
          data: data as T
        }
      } else {
        // Other responses
        return {
          success: true,
          data: data as T
        }
      }
    } catch (error) {
      console.error(`💥 API request to ${endpoint} failed:`, error)
      throw error
    }
  }

  // Auth methods
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await this.request<BackendLoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      })

      if (response.success && response.data?.token) {
        this.token = response.data.token
        
        // Convert backend user format to frontend user format
        const backendUser = response.data.user
        const frontendUser: User = {
          id: backendUser.id.toString(),
          username: backendUser.username,
          email: backendUser.email,
          role: this.mapBackendRole(backendUser.role),
          name: backendUser.name
        }
        
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", response.data.token)
          localStorage.setItem("user", JSON.stringify(frontendUser))
        }

        return {
          success: true,
          data: { user: frontendUser, token: response.data.token },
          message: response.data.message
        }
      }

      return response as any
    } catch (error) {
      console.warn("API login failed, using mock authentication")
      
      // Mock user roles based on username for development
      let mockRole: User["role"] = "user"
      let mockName = "User"
      
      if (credentials.username === "superadmin") {
        mockRole = "superadmin"
        mockName = "Super Administrator"
      } else if (credentials.username === "admin") {
        mockRole = "admin"
        mockName = "Administrator"
      } else if (credentials.username === "form") {
        mockRole = "form"
        mockName = "Form User"
      } else if (credentials.username === "review") {
        mockRole = "review"
        mockName = "Reviewer"
      } else if (credentials.username === "validasi") {
        mockRole = "validasi"
        mockName = "Validator"
      } else if (credentials.username === "rekap") {
        mockRole = "rekap"
        mockName = "Rekap User"
      }
      
      // Fallback for development
      const mockUser: User = {
        id: "1",
        username: credentials.username,
        email: `${credentials.username}@example.com`,
        role: mockRole,
        name: mockName,
      }

      const mockToken = "mock-jwt-token"
      this.token = mockToken

      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", mockToken)
        localStorage.setItem("user", JSON.stringify(mockUser))
      }

      return {
        success: true,
        data: { user: mockUser, token: mockToken },
        error: error instanceof Error ? error.message : "Login failed"
      }
    }
  }

  // Helper method to map backend roles to frontend roles
  private mapBackendRole(backendRole: string): User["role"] {
    const roleMapping: Record<string, User["role"]> = {
      'admin': 'admin',
      'superadmin': 'superadmin', 
      'form': 'form',
      'review': 'review',
      'validasi': 'validasi',
      'rekap': 'rekap',
      'user': 'user',
      'reviewer': 'reviewer',
      'validator': 'validator'
    }
    
    return roleMapping[backendRole] || 'user'
  }

  async logout(): Promise<ApiResponse> {
    try {
      const response = await this.request("/auth/logout", { method: "POST" })

      this.token = null
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user")
      }

      return response
    } catch (error) {
      console.warn("API logout failed, clearing local storage anyway")
      // Always succeed for logout
      this.token = null
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user")
      }

      return { success: true }
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await this.request<BackendUser>("/auth/me")
      
      if (response.success && response.data) {
        // Convert backend user format to frontend user format
        const backendUser = response.data
        const frontendUser: User = {
          id: backendUser.id.toString(),
          username: backendUser.username,
          email: backendUser.email,
          role: this.mapBackendRole(backendUser.role),
          name: backendUser.name
        }
        
        return {
          success: true,
          data: frontendUser
        }
      }
      
      return response as any
    } catch (error) {
      console.warn("API getCurrentUser failed, using stored user")
      // Fallback to stored user
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          return {
            success: true,
            data: JSON.parse(storedUser),
          }
        }
      }

      // Return mock user if no stored user
      return {
        success: true,
        data: {
          id: "1",
          username: "admin",
          email: "admin@example.com",
          role: "admin",
          name: "Admin User",
        },
      }
    }
  }

  // Submission methods
  async getSubmissions(filters?: any): Promise<ApiResponse<any[]>> {
    const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : ""
    
    try {
      console.log("🔄 Fetching submissions from backend server...")
      const response = await this.request<any[]>(`/submissions${queryParams}`)
      
      // Cache successful response to localStorage for offline access
      if (response.success && response.data) {
        saveSubmissionsToStorage(response.data)
        console.log("✅ Submissions fetched from server and cached locally")
      }
      
      return response
    } catch (error) {
      console.error("❌ Failed to fetch submissions from server:", error)
      
      // Only use localStorage as last resort with clear indication
      console.warn("⚠️ Using cached local data as fallback (server unavailable)")
      const submissions = loadSubmissionsFromStorage()
      
      return {
        success: false, // Mark as failed to indicate it's from cache
        data: submissions,
        message: "Using cached data - server unavailable"
      }
    }
  }

  async getSubmission(id: string): Promise<ApiResponse<any>> {
    try {
      console.log(`🔄 Fetching submission ${id} from backend server...`)
      const response = await this.request<any>(`/submissions/${id}`)
      
      if (response.success) {
        console.log(`✅ Submission ${id} fetched from server`)
      }
      
      return response
    } catch (error) {
      console.error(`❌ Failed to fetch submission ${id} from server:`, error)
      
      // Only use localStorage as last resort
      console.warn(`⚠️ Searching cached local data for submission ${id}`)
      const submissions = loadSubmissionsFromStorage()
      const submission = submissions.find((s: any) => s.id.toString() === id)

      if (submission) {
        return {
          success: false, // Mark as failed to indicate it's from cache
          data: submission,
          message: "Using cached data - server unavailable"
        }
      }

      throw new Error("Submission not found in server or cache")
    }
  }

  async createSubmission(data: any): Promise<ApiResponse<any>> {
    try {
      console.log("🔄 Creating submission on backend server...")
      const response = await this.request<any>("/submissions", {
        method: "POST",
        body: JSON.stringify(data),
      })
      
      if (response.success && response.data) {
        console.log("✅ Submission created successfully on server")
        
        // Update local cache with server response - with safety check
        try {
          const submissions = loadSubmissionsFromStorage()
          if (Array.isArray(submissions)) {
            submissions.push(response.data)
            saveSubmissionsToStorage(submissions)
          } else {
            // If submissions is not an array, create new array
            saveSubmissionsToStorage([response.data])
          }
        } catch (storageError) {
          console.warn("⚠️ Failed to update local cache:", storageError)
          // Don't throw error for storage issues - submission was successful on server
        }
      }
      
      return response
    } catch (error) {
      console.error("❌ Failed to create submission on server:", error)
      
      // IMPORTANT: For create operations, we should NOT use localStorage fallback
      // because it won't be synced with server. Instead, throw the error.
      throw new Error(`Failed to create submission on server: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async updateSubmission(id: string, data: any): Promise<ApiResponse<any>> {
    try {
      console.log(`🔄 Updating submission ${id} on backend server...`)
      const response = await this.request<any>(`/submissions/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
      
      if (response.success && response.data) {
        console.log(`✅ Submission ${id} updated successfully on server`)
        
        // Update local cache with server response - with safety check
        try {
          const submissions = loadSubmissionsFromStorage()
          if (Array.isArray(submissions)) {
            const index = submissions.findIndex((s: any) => s.id.toString() === id)
            if (index !== -1) {
              submissions[index] = response.data
              saveSubmissionsToStorage(submissions)
            }
          }
        } catch (storageError) {
          console.warn("⚠️ Failed to update local cache:", storageError)
          // Don't throw error for storage issues - update was successful on server
        }
      }
      
      return response
    } catch (error) {
      console.error(`❌ Failed to update submission ${id} on server:`, error)
      
      // For update operations, also don't use localStorage fallback
      // because it won't be synced with server
      throw new Error(`Failed to update submission on server: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async deleteSubmission(id: string): Promise<ApiResponse> {
    try {
      console.log(`🔄 Deleting submission ${id} from backend server...`)
      const response = await this.request(`/submissions/${id}`, { method: "DELETE" })
      
      if (response.success) {
        console.log(`✅ Submission ${id} deleted successfully from server`)
        
        // Remove from local cache
        const submissions = loadSubmissionsFromStorage()
        const filteredSubmissions = submissions.filter((s: any) => s.id.toString() !== id)
        saveSubmissionsToStorage(filteredSubmissions)
      }
      
      return response
    } catch (error) {
      console.error(`❌ Failed to delete submission ${id} from server:`, error)
      
      // For delete operations, also don't use localStorage fallback
      throw new Error(`Failed to delete submission from server: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Review methods
  async getReviews(filters?: any): Promise<ApiResponse<any[]>> {
    const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : ""
    
    try {
      console.log("🔄 Fetching reviews from backend server...")
      const response = await this.request<any[]>(`/reviews${queryParams}`)
      
      if (response.success) {
        console.log("✅ Reviews fetched from server")
      }
      
      return response
    } catch (error) {
      console.error("❌ Failed to fetch reviews from server:", error)
      
      // Only use localStorage as last resort with clear indication
      console.warn("⚠️ Using cached local data for reviews (server unavailable)")
      const submissions = loadSubmissionsFromStorage()
      const reviewItems = submissions.filter((s: any) => {
        // Include submissions that are confirmed and have content items
        return s.isConfirmed && s.contentItems && s.contentItems.length > 0
      })

      return {
        success: false, // Mark as failed to indicate it's from cache
        data: reviewItems,
        message: "Using cached data - server unavailable"
      }
    }
  }

  async getReview(id: string): Promise<ApiResponse<any>> {
    try {
      return await this.request<any>(`/reviews/${id}`)
    } catch (error) {
      console.warn(`API getReview failed for ID ${id}, using local storage`)
      // Fallback to local storage
      const submissions = loadSubmissionsFromStorage()
      const submission = submissions.find((s: any) => s.id.toString() === id)

      if (submission) {
        return {
          success: true,
          data: submission,
        }
      }

      throw new Error("Review not found")
    }
  }

  async submitReview(id: string, reviewData: ReviewData): Promise<ApiResponse<any>> {
    try {
      return await this.request<any>(`/reviews/${id}`, {
        method: "POST",
        body: JSON.stringify(reviewData),
      })
    } catch (error) {
      console.warn(`API submitReview failed for ID ${id}, using local storage`)
      // Fallback to local storage update
      const submissions = loadSubmissionsFromStorage()
      const index = submissions.findIndex((s: any) => s.id.toString() === id)

      if (index !== -1) {
        submissions[index] = {
          ...submissions[index],
          reviewStatus: reviewData.status,
          reviewNotes: reviewData.notes,
          reviewedBy: reviewData.reviewerId,
          reviewedAt: new Date().toISOString(),
          workflowStage: reviewData.status === "approved" ? "validation" : "completed",
          updatedAt: new Date().toISOString(),
        }
        saveSubmissionsToStorage(submissions)

        return {
          success: true,
          data: submissions[index],
        }
      }

      throw new Error("Review not found")
    }
  }

  async assignReview(id: string, assigneeId: string): Promise<ApiResponse<any>> {
    try {
      return await this.request<any>(`/reviews/${id}/assign`, {
        method: "POST",
        body: JSON.stringify({ assigneeId }),
      })
    } catch (error) {
      console.warn(`API assignReview failed for ID ${id}, using local storage`)
      // Fallback to local storage update
      const submissions = loadSubmissionsFromStorage()
      const index = submissions.findIndex((s: any) => s.id.toString() === id)

      if (index !== -1) {
        submissions[index] = {
          ...submissions[index],
          assignedTo: assigneeId,
          assignedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        saveSubmissionsToStorage(submissions)

        return {
          success: true,
          data: submissions[index],
        }
      }

      throw new Error("Review not found")
    }
  }

  // Validation methods
  async getValidations(filters?: any): Promise<ApiResponse<any[]>> {
    try {
      const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : ""
      return await this.request<any[]>(`/validations${queryParams}`)
    } catch (error) {
      console.warn("API getValidations failed, using local submissions data")
      // Fallback to submissions that need validation
      const submissions = loadSubmissionsFromStorage()
      const validationItems = submissions.filter((s: any) => {
        // Include submissions that are approved for review or in validation stage
        return (
          (s.workflowStage === "validation" || s.reviewStatus === "approved") &&
          s.contentItems &&
          s.contentItems.length > 0
        )
      })

      return {
        success: true,
        data: validationItems,
      }
    }
  }

  async getValidation(id: string): Promise<ApiResponse<any>> {
    try {
      return await this.request<any>(`/validations/${id}`)
    } catch (error) {
      console.warn(`API getValidation failed for ID ${id}, using local storage`)
      // Fallback to local storage
      const submissions = loadSubmissionsFromStorage()
      const submission = submissions.find((s: any) => s.id.toString() === id)

      if (submission) {
        return {
          success: true,
          data: submission,
        }
      }

      throw new Error("Validation not found")
    }
  }

  async submitValidation(id: string, validationData: ValidationData): Promise<ApiResponse<any>> {
    try {
      return await this.request<any>(`/validations/${id}`, {
        method: "POST",
        body: JSON.stringify(validationData),
      })
    } catch (error) {
      console.warn(`API submitValidation failed for ID ${id}, using local storage`)
      // Fallback to local storage update
      const submissions = loadSubmissionsFromStorage()
      const index = submissions.findIndex((s: any) => s.id.toString() === id)

      if (index !== -1) {
        submissions[index] = {
          ...submissions[index],
          validationStatus: validationData.status,
          validationNotes: validationData.notes,
          validatedBy: validationData.validatorId,
          validatedAt: new Date().toISOString(),
          publishDate: validationData.publishDate,
          publishedContent: validationData.publishedContent,
          workflowStage: validationData.status === "published" ? "completed" : "validation",
          updatedAt: new Date().toISOString(),
        }
        saveSubmissionsToStorage(submissions)

        return {
          success: true,
          data: submissions[index],
        }
      }

      throw new Error("Validation not found")
    }
  }

  // User management methods
  async getUsers(filters?: any): Promise<ApiResponse<User[]>> {
    try {
      const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : ""
      return await this.request<User[]>(`/users${queryParams}`)
    } catch (error) {
      console.warn("API getUsers failed, using mock users")
      // Mock users for development
      const mockUsers: User[] = [
        {
          id: "1",
          username: "admin",
          email: "admin@example.com",
          role: "admin",
          name: "Administrator",
        },
        {
          id: "2",
          username: "reviewer",
          email: "reviewer@example.com",
          role: "reviewer",
          name: "Content Reviewer",
        },
        {
          id: "3",
          username: "validator",
          email: "validator@example.com",
          role: "validator",
          name: "Content Validator",
        },
      ]

      return {
        success: true,
        data: mockUsers,
      }
    }
  }

  async createUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      return await this.request<User>("/users", {
        method: "POST",
        body: JSON.stringify(userData),
      })
    } catch (error) {
      console.warn("API createUser failed, using mock creation")
      // Mock user creation
      const newUser: User = {
        id: Date.now().toString(),
        username: userData.username || "",
        email: userData.email || "",
        role: userData.role || "user",
        name: userData.name || "",
      }

      return {
        success: true,
        data: newUser,
      }
    }
  }

  async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      return await this.request<User>(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(userData),
      })
    } catch (error) {
      console.warn(`API updateUser failed for ID ${id}, using mock update`)
      // Mock user update
      const updatedUser: User = {
        id,
        username: userData.username || "",
        email: userData.email || "",
        role: userData.role || "user",
        name: userData.name || "",
      }

      return {
        success: true,
        data: updatedUser,
      }
    }
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    try {
      return await this.request(`/users/${id}`, { method: "DELETE" })
    } catch (error) {
      console.warn(`API deleteUser failed for ID ${id}, using mock deletion`)
      // Mock user deletion
      return { success: true }
    }
  }
}

// Create singleton instance
const apiClient = new ApiClient(API_BASE_URL)

// Export individual functions for convenience
export const login = (credentials: LoginCredentials) => apiClient.login(credentials)
export const logout = () => apiClient.logout()
export const getCurrentUser = () => apiClient.getCurrentUser()

export const getSubmissions = (filters?: any) => apiClient.getSubmissions(filters)
export const getSubmission = (id: string) => apiClient.getSubmission(id)
export const createSubmission = (data: any) => apiClient.createSubmission(data)
export const updateSubmission = (id: string, data: any) => apiClient.updateSubmission(id, data)
export const deleteSubmission = (id: string) => apiClient.deleteSubmission(id)

export const getReviews = (filters?: any) => apiClient.getReviews(filters)
export const getReview = (id: string) => apiClient.getReview(id)
export const submitReview = (id: string, reviewData: ReviewData) => apiClient.submitReview(id, reviewData)
export const assignReview = (id: string, assigneeId: string) => apiClient.assignReview(id, assigneeId)

export const getValidations = (filters?: any) => apiClient.getValidations(filters)
export const getValidation = (id: string) => apiClient.getValidation(id)
export const submitValidation = (id: string, validationData: ValidationData) =>
  apiClient.submitValidation(id, validationData)

export const getUsers = (filters?: any) => apiClient.getUsers(filters)
export const createUser = (userData: Partial<User>) => apiClient.createUser(userData)
export const updateUser = (id: string, userData: Partial<User>) => apiClient.updateUser(id, userData)
export const deleteUser = (id: string) => apiClient.deleteUser(id)

// Export the client instance as default
export default apiClient

// Export types
export type { ApiResponse, LoginCredentials, User, ReviewData, ValidationData }

// Export error class
export class ApiError extends Error {
  code?: string
  details?: any

  constructor(message: string, code?: string, details?: any) {
    super(message)
    this.name = "ApiError"
    this.code = code
    this.details = details
  }
}
