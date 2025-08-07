import { toast } from "@/hooks/use-toast"

/**
 * Show warning when data is from cache instead of server
 */
export const showCacheWarning = (operation: string) => {
  toast({
    title: "⚠️ Using Cached Data",
    description: `${operation} data is from local cache. Server connection failed.`,
    variant: "destructive",
  })
}

/**
 * Show success when data is from server
 */
export const showServerSuccess = (operation: string) => {
  console.log(`✅ ${operation} successful from server`)
}

/**
 * Show error when server operation fails
 */
export const showServerError = (operation: string, error: string) => {
  toast({
    title: "❌ Server Error",
    description: `Failed to ${operation}: ${error}`,
    variant: "destructive",
  })
}

/**
 * Enhanced API response handler that shows appropriate notifications
 */
export const handleApiResponse = (response: any, operation: string) => {
  if (response.success === false && response.message?.includes("cached")) {
    showCacheWarning(operation)
  } else if (response.success) {
    showServerSuccess(operation)
  }
  
  return response
}
