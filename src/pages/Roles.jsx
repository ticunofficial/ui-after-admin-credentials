import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { usePermissions } from '../contexts/PermissionContext'
import ProtectedRoute from '../components/ProtectedRoute'
import api from '../services/api'

const Roles = () => {
  const { hasPermission } = usePermissions()
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    permissions: []
  })

  useEffect(() => {
    fetchRoles()
    fetchPermissions()
  }, [])

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles')
      setRoles(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch roles:', error)
      setRoles([])
    } finally {
      setLoading(false)
    }
  }

  const fetchPermissions = async () => {
    try {
      const response = await api.get('/permissions')
      setPermissions(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
      setPermissions([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingRole) {
        await api.put(`/roles/${editingRole.id}`, formData)
      } else {
        await api.post('/roles', formData)
      }
      setIsModalOpen(false)
      setEditingRole(null)
      resetForm()
      fetchRoles()
    } catch (error) {
      console.error('Failed to save role:', error)
    }
  }

  const handleEdit = (role) => {
    setEditingRole(role)
    setFormData({
      name: role.name || '',
      permissions: role.permissions?.map(p => p.name) || []
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (roleId, roleName) => {
    if (window.confirm(`Are you sure you want to delete "${roleName}" role?`)) {
      try {
        await api.delete(`/roles/${roleId}`)
        fetchRoles()
      } catch (error) {
        console.error('Failed to delete role:', error)
      }
    }
  }

  const togglePermission = (permissionName) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionName)
        ? prev.permissions.filter(p => p !== permissionName)
        : [...prev.permissions, permissionName]
    }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      permissions: []
    })
  }

  const openCreateModal = () => {
    resetForm()
    setEditingRole(null)
    setIsModalOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute permissions={['manage roles']}>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Role Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage roles and permissions</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <i className="fa fa-plus"></i>
          <span>Add Role</span>
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div key={role.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{role.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {role.users_count} {role.users_count === 1 ? 'user' : 'users'}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(role)}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                >
                  <i className="fa fa-edit"></i>
                </button>
                <button
                  onClick={() => handleDelete(role.id, role.name)}
                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                >
                  <i className="fa fa-trash"></i>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Permissions:</h4>
              <div className="flex flex-wrap gap-1">
                {role.permissions && role.permissions.length > 0 ? (
                  role.permissions.slice(0, 3).map((permission) => (
                    <span key={permission.id} className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                      {permission.name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500 dark:text-gray-400">No permissions assigned</span>
                )}
                {role.permissions && role.permissions.length > 3 && (
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                    +{role.permissions.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {roles.length === 0 && (
          <div className="col-span-full text-center py-12">
            <i className="fa fa-users-cog text-gray-400 text-4xl mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No roles found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first role to get started.</p>
            <button
              onClick={openCreateModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Role
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Role Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all max-h-[90vh] overflow-y-auto">
                  <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {editingRole ? 'Edit Role' : 'Create New Role'}
                  </Dialog.Title>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Admin, Manager, User"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Permissions</label>
                      <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {permissions.map((permission) => (
                            <label key={permission.id} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.permissions.includes(permission.name)}
                                onChange={() => togglePermission(permission.name)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{permission.name}</span>
                            </label>
                          ))}
                        </div>
                        {permissions.length === 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">No permissions available</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {editingRole ? 'Update Role' : 'Create Role'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      </div>
    </ProtectedRoute>
  )
}

export default Roles