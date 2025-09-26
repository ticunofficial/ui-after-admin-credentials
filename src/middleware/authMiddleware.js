import { isTokenExpired, clearAuthData } from '../utils/auth'

// Middleware to check authentication on route changes
export const authMiddleware = (to, from, next) => {
  const token = localStorage.getItem('token')
  const isAuthRoute = ['/login', '/register', '/activate', '/password-reset'].includes(to.path)
  const isProtectedRoute = to.path.startsWith('/app/')

  // Check token validity
  if (token && isTokenExpired(token)) {
    clearAuthData()
    if (isProtectedRoute) {
      return next('/login')
    }
  }

  // Redirect authenticated users away from auth pages
  if (token && !isTokenExpired(token) && isAuthRoute) {
    return next('/app/dashboard')
  }

  // Redirect unauthenticated users to login
  if (!token && isProtectedRoute) {
    return next('/login')
  }

  next()
}

// Check if user has required permissions for route
export const permissionMiddleware = (requiredPermissions = [], userPermissions = []) => {
  if (!requiredPermissions.length) return true
  
  const isSuperAdmin = localStorage.getItem('is_super_admin') === 'true'
  if (isSuperAdmin) return true
  
  return requiredPermissions.some(permission => userPermissions.includes(permission))
}