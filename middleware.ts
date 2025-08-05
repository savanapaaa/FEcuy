import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login"]

  // Role-specific routes
  const roleRoutes = {
    "/role-management": ["superadmin"],
    "/review": ["review"],
    "/validasi": ["validasi"],
    "/rekap": ["rekap"],
    "/dashboard/admin": ["superadmin"],
  }

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // For protected routes, let client-side auth handle the authentication
  // since we're using localStorage for session management
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
