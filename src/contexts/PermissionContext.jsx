import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'

const PermissionContext = createContext()

export const usePermissions = () => {
  const context = useContext(PermissionContext)
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider')
  }
  return context
}

export const PermissionProvider = ({ children }) => {
  const [userPermissions, setUserPermissions] = useState([])
  const [userRole, setUserRole] = useState(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  useEffect(() => {
    const hasToken = !!token
    if (hasToken) {
      // Short-circuit for test admin bypass
      if (localStorage.getItem('is_super_admin') === 'true') {
        setIsSuperAdmin(true)
        setUserRole('admin')
        setUserPermissions([])
        setLoading(false)
      } else {
        fetchUserPermissions()
      }
    } else {
      setUserPermissions([])
      setUserRole(null)
      setIsSuperAdmin(false)
      setLoading(false)
    }
  }, [token])

  const fetchUserPermissions = async () => {
    try {
      const response = await api.get('/user/permissions')
      if (response.data.success) {
        const userData = response.data.data
        setUserPermissions(userData.permissions || [])
        setUserRole(userData.role_name)
        setIsSuperAdmin(userData.is_super_admin || false)
      }
    } catch (error) {
      console.error('Failed to fetch user permissions:', error)
      setUserPermissions([])
      setUserRole(null)
      setIsSuperAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (isSuperAdmin) return true
    return userPermissions.includes(permission)
  }

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissions) => {
    if (isSuperAdmin) return true
    return permissions.some(permission => userPermissions.includes(permission))
  }

  // Check if user has all specified permissions
  const hasAllPermissions = (permissions) => {
    if (isSuperAdmin) return true
    return permissions.every(permission => userPermissions.includes(permission))
  }

  // Check if user has specific role
  const hasRole = (role) => {
    if (isSuperAdmin) return true
    return userRole === role
  }

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    if (isSuperAdmin) return true
    return roles.includes(userRole)
  }

  // Permission-based navigation filtering
  const getFilteredNavigation = (navigationItems) => {
    if (!Array.isArray(navigationItems)) return []
    
    return navigationItems.filter(item => {
      // Check parent item permissions
      if (item.permissions && !hasAnyPermission(item.permissions)) {
        return false
      }
      
      // Filter children if they exist
      if (item.children && Array.isArray(item.children)) {
        item.children = item.children.filter(child => {
          if (!child.permissions) return true
          return hasAnyPermission(child.permissions)
        })
        // Hide parent if no children are visible
        if (item.children.length === 0 && item.permissions) {
          return false
        }
      }
      
      return true
    })
  }

  const value = {
    userPermissions,
    userRole,
    isSuperAdmin,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    getFilteredNavigation,
    refreshPermissions: fetchUserPermissions
  }

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  )
}