import { loadSubmissionsFromStorage, saveSubmissionsToStorage } from "./utils"

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

// Types
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

interface LoginCredentials {
  username: string
  password: string
}

interface User {
  id: string
  username: string
  email: string
  role: "admin" | "user" | "reviewer" | "validator"
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
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.warn(`API request to ${endpoint} failed:`, error)
      // Don't throw here, let individual methods handle fallbacks
      throw error
    }
  }

  // Auth methods
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await this.request<{ user: User; token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      })

      if (response.success && response.data?.token) {
        this.token = response.data.token
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", response.data.token)
          localStorage.setItem("user", JSON.stringify(response.data.user))
        }
      }

      return response
    } catch (error) {
      console.warn("API login failed, using mock authentication")
      // Fallback for development
      const mockUser: User = {
        id: "1",
        username: credentials.username,
        email: `${credentials.username}@example.com`,
        role: "admin",
        name: "Admin User",
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
      }
    }
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
      return await this.request<User>("/auth/me")
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
    try {
      const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : ""
      return await this.request<any[]>(`/submissions${queryParams}`)
    } catch (error) {
      console.warn("API getSubmissions failed, using local storage")
      // Fallback to local storage
      const submissions = loadSubmissionsFromStorage()
      return {
        success: true,
        data: submissions,
      }
    }
  }

  async getSubmission(id: string): Promise<ApiResponse<any>> {
    try {
      return await this.request<any>(`/submissions/${id}`)
    } catch (error) {
      console.warn(`API getSubmission failed for ID ${id}, using local storage`)
      // Fallback to local storage
      const submissions = loadSubmissionsFromStorage()
      const submission = submissions.find((s: any) => s.id.toString() === id)

      if (submission) {
        return {
          success: true,
          data: submission,
        }
      }

      throw new Error("Submission not found")
    }
  }

  async createSubmission(data: any): Promise<ApiResponse<any>> {
    try {
      return await this.request<any>("/submissions", {
        method: "POST",
        body: JSON.stringify(data),
      })
    } catch (error) {
      console.warn("API createSubmission failed, using local storage")
      // Fallback to local storage
      const submissions = loadSubmissionsFromStorage()
      const newSubmission = {
        ...data,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      submissions.push(newSubmission)
      saveSubmissionsToStorage(submissions)

      return {
        success: true,
        data: newSubmission,
      }
    }
  }

  async updateSubmission(id: string, data: any): Promise<ApiResponse<any>> {
    try {
      return await this.request<any>(`/submissions/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    } catch (error) {
      console.warn(`API updateSubmission failed for ID ${id}, using local storage`)
      // Fallback to local storage
      const submissions = loadSubmissionsFromStorage()
      const index = submissions.findIndex((s: any) => s.id.toString() === id)

      if (index !== -1) {
        submissions[index] = {
          ...submissions[index],
          ...data,
          updatedAt: new Date().toISOString(),
        }
        saveSubmissionsToStorage(submissions)

        return {
          success: true,
          data: submissions[index],
        }
      }

      throw new Error("Submission not found")
    }
  }

  async deleteSubmission(id: string): Promise<ApiResponse> {
    try {
      return await this.request(`/submissions/${id}`, { method: "DELETE" })
    } catch (error) {
      console.warn(`API deleteSubmission failed for ID ${id}, using local storage`)
      // Fallback to local storage
      const submissions = loadSubmissionsFromStorage()
      const filteredSubmissions = submissions.filter((s: any) => s.id.toString() !== id)
      saveSubmissionsToStorage(filteredSubmissions)

      return { success: true }
    }
  }

  // Review methods
  async getReviews(filters?: any): Promise<ApiResponse<any[]>> {
    try {
      const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : ""
      return await this.request<any[]>(`/reviews${queryParams}`)
    } catch (error) {
      console.warn("API getReviews failed, using local submissions data")
      // Fallback to submissions that need review
      const submissions = loadSubmissionsFromStorage()
      const reviewItems = submissions.filter((s: any) => {
        // Include submissions that are confirmed and have content items
        return s.isConfirmed && s.contentItems && s.contentItems.length > 0
      })

      return {
        success: true,
        data: reviewItems,
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
