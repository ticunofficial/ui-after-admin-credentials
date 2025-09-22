import { useState, useEffect } from 'react'
import api from '../services/api'

const BlockedUsers = () => {
  const [blockedUsers, setBlockedUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBlockedUsers()
  }, [])

  const fetchBlockedUsers = async () => {
    try {
      const response = await api.get('/blocked-users')
      setBlockedUsers(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch blocked users:', error)
      setBlockedUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleUnblock = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to unblock ${userName}?`)) {
      try {
        await api.post(`/users/${userId}/unblock`)
        fetchBlockedUsers()
        alert('User unblocked successfully!')
      } catch (error) {
        console.error('Failed to unblock user:', error)
        alert('Failed to unblock user')
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blocked Users</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Manage users you have blocked</p>
      </div>

      {/* Blocked Users List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {blockedUsers.length === 0 ? (
          <div className="text-center py-12">
            <i className="fa fa-user-slash text-gray-400 text-4xl mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No blocked users</h3>
            <p className="text-gray-500 dark:text-gray-400">You haven't blocked any users yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {blockedUsers.map((user) => (
              <div key={user.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={user.photo_url ? (user.photo_url.startsWith('http') ? user.photo_url : `http://localhost:8000${user.photo_url}`) : '/assets/images/avatar.png'}
                      alt={user.name}
                      className="h-12 w-12 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = '/assets/images/avatar.png'
                      }}
                    />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{user.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Blocked on: {new Date(user.blocked_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnblock(user.id, user.name)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <i className="fa fa-unlock"></i>
                    <span>Unblock</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BlockedUsers