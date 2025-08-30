#!/usr/bin/env node

/**
 * Test script untuk menguji integrasi API FEcuy
 * Menguji semua endpoint yang digunakan dalam aplikasi
 */

const API_BASE_URL = "https://be-savana.budiutamamandiri.com/api"

// Helper function untuk membuat request
async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config = {
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...options.headers,
    },
    credentials: 'omit',
    mode: 'cors',
    ...options,
  }

  try {
    console.log(`🚀 Testing: ${config.method || 'GET'} ${url}`)
    
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Error ${response.status}: ${errorText}`)
      return { success: false, error: errorText, status: response.status }
    }

    const data = await response.json()
    console.log(`✅ Success: ${endpoint}`)
    return { success: true, data, status: response.status }
    
  } catch (error) {
    console.error(`💥 Request failed: ${error.message}`)
    return { success: false, error: error.message }
  }
}

// Test login
async function testLogin() {
  console.log("\n=== Testing Login ===")
  
  const credentials = {
    username: "admin",
    password: "password123"
  }
  
  const result = await makeRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  })
  
  if (result.success && result.data.token) {
    console.log("🔑 Login successful, token received")
    return result.data.token
  } else {
    console.log("⚠️ Login failed, using mock mode")
    return null
  }
}

// Test authenticated endpoints
async function testAuthenticatedEndpoints(token) {
  console.log("\n=== Testing Authenticated Endpoints ===")
  
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}
  
  // Test submissions
  console.log("\n--- Testing Submissions ---")
  await makeRequest("/submissions", { headers: authHeaders })
  
  // Test reviews
  console.log("\n--- Testing Reviews ---")
  await makeRequest("/reviews", { headers: authHeaders })
  
  // Test validations
  console.log("\n--- Testing Validations ---")
  await makeRequest("/validations", { headers: authHeaders })
  
  // Test users (for admin)
  console.log("\n--- Testing Users ---")
  await makeRequest("/users", { headers: authHeaders })
  
  // Test auth/me
  console.log("\n--- Testing Auth Status ---")
  await makeRequest("/auth/me", { headers: authHeaders })
}

// Test review submission
async function testReviewSubmission(token) {
  console.log("\n=== Testing Review Submission ===")
  
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}
  
  // Test dengan ID dummy
  const reviewData = {
    status: "approved",
    notes: "Test review from API integration test",
    reviewerId: "test-reviewer-id",
  }
  
  const result = await makeRequest("/reviews/1", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify(reviewData),
  })
  
  if (result.success) {
    console.log("✅ Review submission test passed")
  } else if (result.status === 404) {
    console.log("ℹ️ Review submission endpoint exists but no submission with ID 1")
  } else {
    console.log("❌ Review submission test failed")
  }
}

// Test validation submission
async function testValidationSubmission(token) {
  console.log("\n=== Testing Validation Submission ===")
  
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}
  
  const validationData = {
    status: "validated",
    notes: "Test validation from API integration test",
    validatorId: "test-validator-id",
    publishDate: new Date().toISOString()
  }
  
  const result = await makeRequest("/validations/1", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify(validationData),
  })
  
  if (result.success) {
    console.log("✅ Validation submission test passed")
  } else if (result.status === 404) {
    console.log("ℹ️ Validation submission endpoint exists but no submission with ID 1")
  } else {
    console.log("❌ Validation submission test failed")
  }
}

// Main test function
async function runTests() {
  console.log("🔬 Starting API Integration Tests")
  console.log("=================================")
  
  // Test login first
  const token = await testLogin()
  
  // Test authenticated endpoints
  await testAuthenticatedEndpoints(token)
  
  // Test review submission
  await testReviewSubmission(token)
  
  // Test validation submission
  await testValidationSubmission(token)
  
  console.log("\n=================================")
  console.log("🏁 API Integration Tests Complete")
  console.log("\nℹ️ Note: Some tests may show 404 errors which is normal if no data exists")
  console.log("ℹ️ Focus on whether endpoints are reachable and return proper response format")
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runTests().catch(console.error)
}

module.exports = {
  makeRequest,
  testLogin,
  testAuthenticatedEndpoints,
  runTests
}
