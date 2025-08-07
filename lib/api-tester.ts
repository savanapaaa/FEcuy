import apiClient from './api-client'

/**
 * Test API connectivity and endpoints
 */
export class ApiTester {
  
  /**
   * Test basic API connectivity
   */
  static async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing API connection...')
      
      // Test health endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`)
      const data = await response.json()
      
      console.log('✅ API Health Check:', data)
      return response.ok
    } catch (error) {
      console.error('❌ API Connection Failed:', error)
      return false
    }
  }
  
  /**
   * Test authentication endpoints
   */
  static async testAuth(): Promise<void> {
    try {
      console.log('🔍 Testing Authentication endpoints...')
      
      // Test login with dummy credentials (will fail but should return proper error)
      try {
        await apiClient.login({ username: 'test', password: 'test' })
      } catch (error) {
        console.log('✅ Login endpoint responding (expected error):', error instanceof Error ? error.message : 'Unknown error')
      }
      
    } catch (error) {
      console.error('❌ Auth test failed:', error)
    }
  }
  
  /**
   * Test all API endpoints accessibility
   */
  static async testEndpoints(): Promise<void> {
    const endpoints = [
      { method: 'GET', path: '/health', requiresAuth: false },
      { method: 'POST', path: '/auth/login', requiresAuth: false },
      { method: 'GET', path: '/submissions', requiresAuth: true },
      { method: 'GET', path: '/reviews', requiresAuth: true },
      { method: 'GET', path: '/validations', requiresAuth: true },
      { method: 'GET', path: '/users', requiresAuth: true },
    ]
    
    console.log('🔍 Testing API endpoints...')
    
    for (const endpoint of endpoints) {
      try {
        const config: RequestInit = {
          method: endpoint.method,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
        
        if (endpoint.requiresAuth) {
          // Add dummy token for testing
          config.headers = {
            ...config.headers,
            'Authorization': 'Bearer dummy-token'
          }
        }
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint.path}`, config)
        
        if (endpoint.requiresAuth && response.status === 401) {
          console.log(`✅ ${endpoint.method} ${endpoint.path} - Properly protected (401)`)
        } else if (!endpoint.requiresAuth && response.ok) {
          console.log(`✅ ${endpoint.method} ${endpoint.path} - Accessible`)
        } else {
          console.log(`⚠️ ${endpoint.method} ${endpoint.path} - Status: ${response.status}`)
        }
        
      } catch (error) {
        console.error(`❌ ${endpoint.method} ${endpoint.path} - Error:`, error instanceof Error ? error.message : 'Unknown error')
      }
    }
  }
  
  /**
   * Run complete API test suite
   */
  static async runTestSuite(): Promise<void> {
    console.log('🚀 Starting API Test Suite...')
    console.log('Backend URL:', process.env.NEXT_PUBLIC_API_URL)
    
    await this.testConnection()
    await this.testAuth()
    await this.testEndpoints()
    
    console.log('✅ API Test Suite completed!')
  }
}

/**
 * Quick API health check
 */
export const checkApiHealth = async (): Promise<boolean> => {
  return await ApiTester.testConnection()
}

/**
 * Log API configuration
 */
export const logApiConfig = (): void => {
  console.log('🔧 API Configuration:')
  console.log('- Base URL:', process.env.NEXT_PUBLIC_API_URL)
  console.log('- Max File Size:', process.env.NEXT_PUBLIC_MAX_FILE_SIZE)
  console.log('- Allowed File Types:', process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES)
  console.log('- Default Page Size:', process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE)
}
