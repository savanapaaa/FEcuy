// API Endpoints Configuration
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    PROFILE: "/auth/profile",
    CHANGE_PASSWORD: "/auth/change-password",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },

  // Users Management
  USERS: {
    LIST: "/users",
    CREATE: "/users",
    GET: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    ACTIVATE: (id: string) => `/users/${id}/activate`,
    DEACTIVATE: (id: string) => `/users/${id}/deactivate`,
    ROLES: "/users/roles",
    PERMISSIONS: "/users/permissions",
  },

  // Submissions Management
  SUBMISSIONS: {
    LIST: "/submissions",
    CREATE: "/submissions",
    GET: (id: string) => `/submissions/${id}`,
    UPDATE: (id: string) => `/submissions/${id}`,
    DELETE: (id: string) => `/submissions/${id}`,
    DUPLICATE: (id: string) => `/submissions/${id}/duplicate`,
    EXPORT: "/submissions/export",
    IMPORT: "/submissions/import",
    BULK_UPDATE: "/submissions/bulk-update",
    BULK_DELETE: "/submissions/bulk-delete",
  },

  // Content Management
  CONTENT: {
    REVIEW: (submissionId: string, contentId: string) => `/submissions/${submissionId}/content/${contentId}/review`,
    APPROVE: (submissionId: string, contentId: string) => `/submissions/${submissionId}/content/${contentId}/approve`,
    REJECT: (submissionId: string, contentId: string) => `/submissions/${submissionId}/content/${contentId}/reject`,
    VALIDATE: (submissionId: string, contentId: string) => `/submissions/${submissionId}/content/${contentId}/validate`,
    TAKEDOWN: (submissionId: string, contentId: string) => `/submissions/${submissionId}/content/${contentId}/takedown`,
    RESTORE: (submissionId: string, contentId: string) => `/submissions/${submissionId}/content/${contentId}/restore`,
    PUBLISH: (submissionId: string, contentId: string) => `/submissions/${submissionId}/content/${contentId}/publish`,
    UNPUBLISH: (submissionId: string, contentId: string) =>
      `/submissions/${submissionId}/content/${contentId}/unpublish`,
    HISTORY: (submissionId: string, contentId: string) => `/submissions/${submissionId}/content/${contentId}/history`,
  },

  // File Management
  FILES: {
    UPLOAD: "/files/upload",
    DOWNLOAD: (filename: string) => `/files/download/${filename}`,
    DELETE: (filename: string) => `/files/${filename}`,
    LIST: "/files",
    PREVIEW: (filename: string) => `/files/preview/${filename}`,
    METADATA: (filename: string) => `/files/metadata/${filename}`,
  },

  // Analytics & Reports
  ANALYTICS: {
    DASHBOARD: "/analytics/dashboard",
    SUBMISSIONS: "/analytics/submissions",
    CONTENT: "/analytics/content",
    USERS: "/analytics/users",
    PERFORMANCE: "/analytics/performance",
    CUSTOM: "/analytics/custom",
  },

  REPORTS: {
    GENERATE: "/reports/generate",
    LIST: "/reports",
    DOWNLOAD: (reportId: string) => `/reports/${reportId}/download`,
    DELETE: (reportId: string) => `/reports/${reportId}`,
    SCHEDULE: "/reports/schedule",
    TEMPLATES: "/reports/templates",
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: "/notifications",
    GET: (id: string) => `/notifications/${id}`,
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: "/notifications/read-all",
    DELETE: (id: string) => `/notifications/${id}`,
    SETTINGS: "/notifications/settings",
    SUBSCRIBE: "/notifications/subscribe",
    UNSUBSCRIBE: "/notifications/unsubscribe",
  },

  // System Settings
  SETTINGS: {
    GENERAL: "/settings/general",
    EMAIL: "/settings/email",
    NOTIFICATIONS: "/settings/notifications",
    SECURITY: "/settings/security",
    BACKUP: "/settings/backup",
    MAINTENANCE: "/settings/maintenance",
  },

  // Audit Logs
  AUDIT: {
    LIST: "/audit/logs",
    GET: (id: string) => `/audit/logs/${id}`,
    EXPORT: "/audit/export",
  },

  // Workflow Management
  WORKFLOW: {
    STAGES: "/workflow/stages",
    TRANSITIONS: "/workflow/transitions",
    RULES: "/workflow/rules",
    HISTORY: (submissionId: string) => `/workflow/history/${submissionId}`,
  },

  // Media Management
  MEDIA: {
    TYPES: "/media/types",
    CHANNELS: "/media/channels",
    TEMPLATES: "/media/templates",
  },

  // Integration
  INTEGRATION: {
    WEBHOOKS: "/integration/webhooks",
    API_KEYS: "/integration/api-keys",
    EXTERNAL_SERVICES: "/integration/external-services",
  },
} as const

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: Record<string, string[]>
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  meta?: Record<string, any>
}

// Common API Parameters
export interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: "asc" | "desc"
}

export interface FilterParams {
  search?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  createdBy?: string
  assignedTo?: string
}

export interface SubmissionFilters extends FilterParams {
  jenisMedia?: string
  supervisor?: string
  petugasPelaksana?: string
  workflowStage?: string
}

export interface ContentFilters extends FilterParams {
  jenisKonten?: string
  tema?: string
  mediaPemerintah?: string[]
  mediaMassa?: string[]
  isTayang?: boolean
  isTakedown?: boolean
}

export interface UserFilters extends FilterParams {
  role?: string
  isActive?: boolean
  department?: string
}
