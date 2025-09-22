import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import api from '../services/api'

const GoogleMeet = () => {
  const [meetings, setMeetings] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authUrl, setAuthUrl] = useState('')
  const [formData, setFormData] = useState({
    topic: '',
    agenda: '',
    start_time: '',
    duration: 60,
    time_zone: 'UTC',
    members: []
  })

  useEffect(() => {
    checkAuthStatus()
    fetchMeetings()
    fetchUsers()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/google-meet/auth-status')
      if (response.data.success) {
        setIsAuthenticated(response.data.is_authenticated)
        setAuthUrl(response.data.auth_url)
      }
    } catch (error) {
      console.error('Failed to check auth status:', error)
    }
  }

  const fetchMeetings = async () => {
    try {
      const response = await api.get('/google-meet/meetings')
      setMeetings(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch meetings:', error)
      setMeetings([])
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users')
      setUsers(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setUsers([])
    }
  }

  const handleAuthenticate = async () => {
    try {
      const response = await api.post('/google-meet/authenticate')
      if (response.data.success) {
        setIsAuthenticated(true)
        alert('Google Meet authentication successful!')
      }
    } catch (error) {
      console.error('Failed to authenticate:', error)
      alert('Authentication failed')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post('/google-meet/create', formData)
      if (response.data.success) {
        setIsModalOpen(false)
        resetForm()
        fetchMeetings()
        alert('Google Meet created successfully!')
      }
    } catch (error) {
      console.error('Failed to create meeting:', error)
      alert('Failed to create meeting: ' + (error.response?.data?.message || error.message))
    }
  }

  const resetForm = () => {
    setFormData({
      topic: '',
      agenda: '',
      start_time: '',
      duration: 60,
      time_zone: 'UTC',
      members: []
    })
  }

  const openCreateModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const handleMemberToggle = (userId) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId]
    }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Google Meet Integration</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Create and manage Google Meet meetings</p>
        </div>
        <div className="flex space-x-3">
          {!isAuthenticated && (
            <button
              onClick={handleAuthenticate}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <i className="fab fa-google"></i>
              <span>Connect Google</span>
            </button>
          )}
          <button
            onClick={openCreateModal}
            disabled={!isAuthenticated}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <i className="fa fa-plus"></i>
            <span>Create Meeting</span>
          </button>
        </div>
      </div>

      {/* Authentication Status */}
      {!isAuthenticated && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fa fa-exclamation-triangle text-yellow-400"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Google Meet Authentication Required
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>You need to authenticate with Google to create Google Meet meetings.</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={handleAuthenticate}
                  className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
                >
                  Authenticate Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Demo Mode Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <i className="fa fa-info-circle text-blue-400"></i>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Demo Mode</h3>
            <div className="mt-1 text-sm text-blue-700">
              <p>This is a demo implementation. In production, this would integrate with Google Calendar API and create actual Google Meet links.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Meetings List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Google Meet Meetings</h2>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {meetings.length === 0 ? (
            <div className="text-center py-12">
              <i className="fab fa-google text-gray-400 text-4xl mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Google Meet meetings</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first Google Meet meeting to get started.</p>
              <button
                onClick={openCreateModal}
                disabled={!isAuthenticated}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Meeting
              </button>
            </div>
          ) : (
            meetings.map((meeting) => (
              <div key={meeting.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
                        <i className="fab fa-google text-red-600 dark:text-red-400"></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{meeting.topic}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Host: {meeting.host_name}</p>
                      </div>
                    </div>
                    
                    {meeting.agenda && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{meeting.agenda}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <i className="fa fa-calendar"></i>
                        <span>{new Date(meeting.start_time).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <i className="fa fa-clock"></i>
                        <span>{new Date(meeting.start_time).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <i className="fa fa-hourglass-half"></i>
                        <span>{meeting.duration} minutes</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <a
                      href={meeting.meeting_id}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                      <i className="fab fa-google"></i>
                      <span>Join Meeting</span>
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Meeting Modal */}
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
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                    <i className="fab fa-google text-red-600"></i>
                    <span>Create Google Meet Meeting</span>
                  </Dialog.Title>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting Topic</label>
                        <input
                          type="text"
                          required
                          value={formData.topic}
                          onChange={(e) => setFormData({...formData, topic: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="Enter meeting topic"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (minutes)</label>
                        <input
                          type="number"
                          required
                          min="15"
                          max="480"
                          value={formData.duration}
                          onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date & Time</label>
                        <input
                          type="datetime-local"
                          required
                          value={formData.start_time}
                          onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Zone</label>
                        <select
                          value={formData.time_zone}
                          onChange={(e) => setFormData({...formData, time_zone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">Eastern Time</option>
                          <option value="America/Chicago">Central Time</option>
                          <option value="America/Denver">Mountain Time</option>
                          <option value="America/Los_Angeles">Pacific Time</option>
                          <option value="Asia/Kolkata">India Standard Time</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agenda</label>
                      <textarea
                        value={formData.agenda}
                        onChange={(e) => setFormData({...formData, agenda: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Enter meeting agenda (optional)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Invite Members</label>
                      <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2">
                        {users.map((user) => (
                          <label key={user.id} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.members.includes(user.id)}
                              onChange={() => handleMemberToggle(user.id)}
                              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{user.name} ({user.email})</span>
                          </label>
                        ))}
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
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                      >
                        <i className="fab fa-google"></i>
                        <span>Create Google Meet</span>
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

export default GoogleMeet