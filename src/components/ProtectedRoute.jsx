import { usePermissions } from '../contexts/PermissionContext'
import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ 
  children, 
  permissions = [], 
  roles = [], 
  requireAll = false,
  fallback = null 
}) => {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { hasAnyPermission, hasAllPermissions, hasAnyRole, isSuperAdmin, loading: permLoading } = usePermissions()
  
  // Check authentication first
  if (!isAuthenticated && !authLoading) {
    return <Navigate to="/login" replace />
  }
  
  const loading = authLoading || permLoading

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Super admin has access to everything
  if (isSuperAdmin) {
    return children
  }

  // Check permissions
  if (permissions.length > 0) {
    const hasRequiredPermissions = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)
    
    if (!hasRequiredPermissions) {
      return fallback || (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
              <i className="fa fa-lock text-red-600 text-xl"></i>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Access Denied</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              You don't have permission to access this resource.
            </p>
          </div>
        </div>
      )
    }
  }

  // Check roles
  if (roles.length > 0) {
    if (!hasAnyRole(roles)) {
      return fallback || (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
              <i className="fa fa-user-slash text-red-600 text-xl"></i>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Role Required</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              You need the appropriate role to access this resource.
            </p>
          </div>
        </div>
      )
    }
  }

  return children
}

export default ProtectedRoute