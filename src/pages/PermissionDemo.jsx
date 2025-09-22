import { useState, useEffect } from 'react'
import { usePermissions } from '../contexts/PermissionContext'
import ProtectedRoute from '../components/ProtectedRoute'
import api from '../services/api'

const PermissionDemo = () => {
  const { 
    userPermissions, 
    userRole, 
    isSuperAdmin, 
    hasPermission, 
    hasAnyPermission, 
    hasRole 
  } = usePermissions()
  
  const [allPermissions, setAllPermissions] = useState({})
  const [rolesWithPermissions, setRolesWithPermissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPermissionData()
  }, [])

  const fetchPermissionData = async () => {
    try {
      const [permissionsRes, rolesRes] = await Promise.all([
        api.get('/permissions/all'),
        api.get('/roles/with-permissions')
      ])
      
      setAllPermissions(permissionsRes.data.data || {})
      setRolesWithPermissions(rolesRes.data.data || [])
    } catch (error) {
      console.error('Failed to fetch permission data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Permission System Demo</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Role-based access control demonstration</p>
      </div>

      {/* Current User Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <i className="fa fa-user mr-2"></i>
          Current User Information
          {isSuperAdmin && <span className="ml-2 text-yellow-600">⭐ Super Admin</span>}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white">Role</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{userRole || 'No Role Assigned'}</p>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white">Permissions Count</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{userPermissions.length} permissions</p>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white">Super Admin</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{isSuperAdmin ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {userPermissions.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Your Permissions:</h3>
            <div className="flex flex-wrap gap-2">
              {userPermissions.map((permission) => (
                <span
                  key={permission}
                  className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                >
                  {permission}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Permission Tests */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <i className="fa fa-shield-alt mr-2"></i>
          Permission Tests
        </h2>
        
        <div className="space-y-4">
          {/* Test specific permissions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">User Management</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Can manage users:</span>
                  <span className={hasPermission('manage users') ? 'text-green-600' : 'text-red-600'}>
                    {hasPermission('manage users') ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Can view users:</span>
                  <span className={hasPermission('view users') ? 'text-green-600' : 'text-red-600'}>
                    {hasPermission('view users') ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Content Management</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Can manage CMS:</span>
                  <span className={hasPermission('manage front cms') ? 'text-green-600' : 'text-red-600'}>
                    {hasPermission('manage front cms') ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Can manage roles:</span>
                  <span className={hasPermission('manage roles') ? 'text-green-600' : 'text-red-600'}>
                    {hasPermission('manage roles') ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Protected Content Examples */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Protected Content Examples</h2>
        
        {/* Admin Only Content */}
        <ProtectedRoute permissions={['manage users']}>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-800 mb-2">
              <i className="fa fa-lock-open mr-2"></i>
              Admin Content (Requires 'manage users' permission)
            </h3>
            <p className="text-sm text-green-700">
              This content is only visible to users with 'manage users' permission.
            </p>
          </div>
        </ProtectedRoute>

        {/* CMS Manager Content */}
        <ProtectedRoute permissions={['manage front cms']}>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">
              <i className="fa fa-globe mr-2"></i>
              CMS Manager Content (Requires 'manage front cms' permission)
            </h3>
            <p className="text-sm text-blue-700">
              This content is only visible to users who can manage the frontend CMS.
            </p>
          </div>
        </ProtectedRoute>

        {/* Role-based Content */}
        <ProtectedRoute roles={['Admin']}>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-medium text-purple-800 mb-2">
              <i className="fa fa-crown mr-2"></i>
              Admin Role Content (Requires 'Admin' role)
            </h3>
            <p className="text-sm text-purple-700">
              This content is only visible to users with the 'Admin' role.
            </p>
          </div>
        </ProtectedRoute>
      </div>

      {/* All Roles and Permissions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          System Roles & Permissions
        </h2>
        
        <div className="space-y-6">
          {rolesWithPermissions.map((role) => (
            <div key={role.id} className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <i className="fa fa-user-tag mr-2"></i>
                {role.name}
                {userRole === role.name && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Your Role
                  </span>
                )}
              </h3>
              
              {role.permissions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map((permission) => (
                    <span
                      key={permission.id}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        userPermissions.includes(permission.name)
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {permission.display_name || permission.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No permissions assigned</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PermissionDemo