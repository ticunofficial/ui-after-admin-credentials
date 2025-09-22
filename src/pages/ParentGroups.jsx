import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import api from '../services/api'

const ParentGroups = () => {
  const [groups, setGroups] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })

  useEffect(() => {
    fetchGroups()
    fetchStats()
  }, [])

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000)
  }

  const fetchGroups = async () => {
    try {
      const response = await api.get('/parent-groups')
      setGroups(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch groups:', error)
      setGroups([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/parent-groups-stats')
      setStats(response.data.data || {})
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      setStats({})
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingGroup) {
        await api.put(`/parent-groups/${editingGroup.id}`, formData)
        showNotification('Group updated successfully!')
      } else {
        await api.post('/parent-groups', formData)
        showNotification('Group created successfully!')
      }
      setIsModalOpen(false)
      setEditingGroup(null)
      resetForm()
      fetchGroups()
      fetchStats()
    } catch (error) {
      console.error('Failed to save group:', error)
      showNotification('Failed to save group', 'error')
    }
  }

  const handleEdit = (group) => {
    setEditingGroup(group)
    setFormData({
      name: group.name || '',
      description: group.description || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (groupId, groupName) => {
    if (window.confirm(`Are you sure you want to delete "${groupName}"?`)) {
      try {
        await api.delete(`/parent-groups/${groupId}`)
        fetchGroups()
        fetchStats()
        showNotification('Group deleted successfully!')
      } catch (error) {
        console.error('Failed to delete group:', error)
        showNotification('Failed to delete group', 'error')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: ''
    })
  }

  const openCreateModal = () => {
    resetForm()
    setEditingGroup(null)
    setIsModalOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="h-12 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Parent Groups</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage group hierarchies and organization</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <i className="fa fa-plus"></i>
          <span>Create Group</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Groups</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalGroups || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <i className="fa fa-layer-group text-white text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Groups</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.recentGroups || 0}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Last 7 days</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <i className="fa fa-calendar-plus text-white text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div key={group.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <i className="fa fa-layer-group text-blue-600 dark:text-blue-400"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{group.name}</h3>
                </div>
                {group.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                    {group.description}
                  </p>
                )}
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Created: {new Date(group.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(group)}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                  title="Edit Group"
                >
                  <i className="fa fa-edit"></i>
                </button>
                <button
                  onClick={() => handleDelete(group.id, group.name)}
                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                  title="Delete Group"
                >
                  <i className="fa fa-trash"></i>
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Group ID</span>
                <span className="font-medium text-gray-900 dark:text-white">#{group.id}</span>
              </div>
            </div>
          </div>
        ))}

        {groups.length === 0 && (
          <div className="col-span-full text-center py-12">
            <i className="fa fa-layer-group text-gray-400 text-4xl mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No parent groups found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first parent group to organize your community.</p>
            <button
              onClick={openCreateModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Group
            </button>
          </div>
        )}
      </div>

      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            <i className={`fa ${
              notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'
            }`}></i>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Create/Edit Group Modal */}
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {editingGroup ? 'Edit Parent Group' : 'Create New Parent Group'}
                  </Dialog.Title>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter group name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter group description (optional)"
                      />
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
                        {editingGroup ? 'Update Group' : 'Create Group'}
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
  )
}

export default ParentGroups