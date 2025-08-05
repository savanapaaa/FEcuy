"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient, ApiError } from "@/lib/api-client"

interface UseApiOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: ApiError) => void
}

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
}

export function useApi<T = any>(apiCall: () => Promise<any>, options: UseApiOptions = {}) {
  const { immediate = true, onSuccess, onError } = options

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const response = await apiCall()
      const data = response.success ? response.data : null

      setState({
        data,
        loading: false,
        error: null,
      })

      if (onSuccess && data) {
        onSuccess(data)
      }

      return data
    } catch (error) {
      const apiError = error instanceof ApiError ? error : new ApiError("Unknown error occurred")

      setState({
        data: null,
        loading: false,
        error: apiError,
      })

      if (onError) {
        onError(apiError)
      }

      throw apiError
    }
  }, [apiCall, onSuccess, onError])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  const refetch = useCallback(() => {
    return execute()
  }, [execute])

  return {
    ...state,
    execute,
    refetch,
  }
}

// Specialized hooks for common operations
export function useSubmissions(params?: any) {
  return useApi(() => apiClient.getSubmissions(params))
}

export function useSubmission(id: string) {
  return useApi(() => apiClient.getSubmission(id), {
    immediate: !!id,
  })
}

export function useUsers(params?: any) {
  return useApi(() => apiClient.getUsers(params))
}

export function useAnalytics(params?: any) {
  return useApi(() => apiClient.getAnalytics(params))
}

export function useNotifications(params?: any) {
  return useApi(() => apiClient.getNotifications(params))
}
