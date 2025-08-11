// Test script untuk menguji authentication
// Buka di browser console untuk testing

console.log("=== Testing Authentication ===")

// Check current session
const currentSession = localStorage.getItem("auth_session")
if (currentSession) {
  try {
    const session = JSON.parse(currentSession)
    console.log("Current user:", session.user)
    console.log("Role:", session.user.role)
    console.log("Session expires:", new Date(session.expiresAt))
  } catch (e) {
    console.log("Invalid session data")
  }
} else {
  console.log("No active session")
}

// Function to simulate login
function testLogin(username, password = "password") {
  console.log(`\n=== Testing login for ${username} ===`)
  
  // Clear existing session
  localStorage.removeItem("auth_session")
  localStorage.removeItem("auth_token") 
  localStorage.removeItem("user")
  
  // Mock the login process
  const mockUsers = {
    "superadmin": { role: "superadmin", name: "Super Administrator" },
    "admin": { role: "admin", name: "Administrator" },
    "form": { role: "form", name: "Form User" },
    "review": { role: "review", name: "Reviewer" },
    "validasi": { role: "validasi", name: "Validator" },
    "rekap": { role: "rekap", name: "Rekap User" }
  }
  
  const userInfo = mockUsers[username] || { role: "user", name: "User" }
  
  const mockUser = {
    id: "1",
    username: username,
    email: `${username}@example.com`,
    role: userInfo.role,
    name: userInfo.name
  }
  
  const sessionDuration = userInfo.role === "superadmin" ? 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000
  const expiresAt = new Date().getTime() + sessionDuration
  
  const sessionData = {
    user: mockUser,
    expiresAt: expiresAt
  }
  
  localStorage.setItem("auth_session", JSON.stringify(sessionData))
  localStorage.setItem("auth_token", "mock-jwt-token")
  localStorage.setItem("user", JSON.stringify(mockUser))
  
  console.log("Login successful!")
  console.log("User:", mockUser)
  console.log("Expires:", new Date(expiresAt))
  console.log("\nNow try accessing /desktop")
}

// Export for use
window.testLogin = testLogin

console.log("\nAvailable commands:")
console.log("testLogin('superadmin') - Login as superadmin")
console.log("testLogin('admin') - Login as admin") 
console.log("testLogin('form') - Login as form user")
console.log("testLogin('review') - Login as reviewer")
console.log("testLogin('validasi') - Login as validator")
console.log("testLogin('rekap') - Login as rekap user")
