#!/usr/bin/env node

/**
 * API Integration Test Script
 * Run this script to test backend API integration
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://be-savana.budiutamamandiri.com/api'

console.log('🚀 Starting API Integration Test...')
console.log('Backend URL:', API_BASE_URL)

async function testEndpoint(method, path, options = {}) {
  try {
    const url = `${API_BASE_URL}${path}`
    const config = {
      method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }

    const response = await fetch(url, config)
    const status = response.status
    
    let result = '❌'
    if (status === 200 || status === 201) {
      result = '✅'
    } else if (status === 401 && options.expectUnauth) {
      result = '🔒' // Expected unauthorized
    } else if (status === 422) {
      result = '⚠️' // Validation error (expected for some tests)
    }
    
    console.log(`${result} ${method.padEnd(6)} ${path.padEnd(25)} - ${status}`)
    
    if (status === 200 || status === 201) {
      try {
        const data = await response.json()
        if (path === '/health') {
          console.log('   Health check data:', data)
        }
      } catch (e) {
        // Response might not be JSON
      }
    }
    
    return { status, ok: response.ok }
  } catch (error) {
    console.log(`❌ ${method.padEnd(6)} ${path.padEnd(25)} - ERROR: ${error.message}`)
    return { status: 0, ok: false, error: error.message }
  }
}

async function runTests() {
  console.log('\n📊 Testing API Endpoints:')
  console.log('=' * 60)
  
  // Test public endpoints
  await testEndpoint('GET', '/health')
  
  // Test auth endpoints (should fail without credentials)
  await testEndpoint('POST', '/auth/login', {
    expectUnauth: true,
    body: JSON.stringify({ username: 'test', password: 'test' })
  })
  
  // Test protected endpoints (should return 401)
  const protectedEndpoints = [
    'GET /auth/me',
    'POST /auth/logout',
    'GET /submissions',
    'GET /reviews',
    'GET /validations',
    'GET /users',
    'POST /attachments/upload'
  ]
  
  for (const endpoint of protectedEndpoints) {
    const [method, path] = endpoint.split(' ')
    await testEndpoint(method, path, { expectUnauth: true })
  }
  
  console.log('\n🔍 CORS and Headers Test:')
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'OPTIONS'
    })
    console.log('✅ OPTIONS request successful - CORS should be configured')
  } catch (error) {
    console.log('❌ OPTIONS request failed - CORS might need configuration')
  }
  
  console.log('\n✅ API Integration Test Completed!')
  console.log('\nNext Steps:')
  console.log('1. Ensure all endpoints return expected status codes')
  console.log('2. Test with valid authentication tokens')
  console.log('3. Verify response formats match frontend expectations')
  console.log('4. Use the API Test Panel in /debug for interactive testing')
}

// Run the tests
runTests().catch(console.error)
