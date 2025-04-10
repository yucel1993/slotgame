import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("auth-token")?.value
  const { pathname } = request.nextUrl

  // Public paths that don't require authentication
  const publicPaths = ["/login", "/register", "/payment/success"]
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  // API routes that don't require authentication check in middleware
  if (pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Redirect to login if accessing protected route without auth
  if (!authToken && !isPublicPath) {
    const url = new URL("/login", request.url)
    return NextResponse.redirect(url)
  }

  // Redirect to game if accessing auth pages while logged in
  if (authToken && isPublicPath && pathname !== "/payment/success") {
    const url = new URL("/game", request.url)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/webhook).*)"],
}
