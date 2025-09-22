import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import api from '../services/api'

const Meetings = () => {
  const [meetings, setMeetings] = useState([])
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState(null)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [formData, setFormData] = useState({
    topic: '',
    start_time: '',
    duration: '60',
    host_video: true,
    participant_video: true,
    agenda: '',
    participants: []
  })

  useEffect(() => {
    fetchMeetings()
    fetchUsers()
    fetchStats()
  }, [])

  const fetchMeetings = async () => {
    try {
      const response = await api.get('/meetings')
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

  const fetchStats = async () => {
    try {
      const response = await api.get('/meeting-stats')
      setStats(response.data.data || {})
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      setStats({})
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingMeeting) {
        await api.put(`/meetings/${editingMeeting.id}`, formData)
      } else {
        await api.post('/meetings', formData)
      }
      setIsModalOpen(false)
      setEditingMeeting(null)
      resetForm()
      fetchMeetings()
      fetchStats()
    } catch (error) {
      console.error('Failed to save meeting:', error)
    }
  }

  const handleEdit = (meeting) => {
    setEditingMeeting(meeting)
    setFormData({
      topic: meeting.topic || '',
      start_time: meeting.start_time ? new Date(meeting.start_time).toISOString().slice(0, 16) : '',
      duration: meeting.duration || '60',
      host_video: meeting.host_video,
      participant_video: meeting.participant_video,
      agenda: meeting.agenda || '',
      participants: []
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (meetingId, meetingTopic) => {
    if (window.confirm(`Are you sure you want to delete "${meetingTopic}"?`)) {
      try {
        await api.delete(`/meetings/${meetingId}`)
        fetchMeetings()
        fetchStats()
      } catch (error) {
        console.error('Failed to delete meeting:', error)
      }
    }
  }

  const toggleParticipant = (userId) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.includes(userId)
        ? prev.participants.filter(id => id !== userId)
        : [...prev.participants, userId]
    }))
  }

  const resetForm = () => {
    setFormData({
      topic: '',
      start_time: '',
      duration: '60',
      host_video: true,
      participant_video: true,
      agenda: '',
      participants: []
    })
  }

  const openCreateModal = () => {
    resetForm()
    setEditingMeeting(null)
    setIsModalOpen(true)
  }

  const isMeetingUpcoming = (startTime) => {
    return new Date(startTime) > new Date()
  }

  const filteredMeetings = meetings.filter(meeting => {
    if (activeTab === 'upcoming') return isMeetingUpcoming(meeting.start_time)
    if (activeTab === 'past') return !isMeetingUpcoming(meeting.start_time)
    return true
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meeting Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Schedule and manage meetings</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <i className="fa fa-plus"></i>
          <span>Schedule Meeting</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Meetings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMeetings || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <i className="fa fa-video text-white text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upcomingMeetings || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <i className="fa fa-calendar-plus text-white text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todayMeetings || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <i className="fa fa-calendar-day text-white text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Past Meetings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pastMeetings || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-500">
              <i className="fa fa-history text-white text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upcoming'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Upcoming ({meetings.filter(m => isMeetingUpcoming(m.start_time)).length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'past'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Past ({meetings.filter(m => !isMeetingUpcoming(m.start_time)).length})
          </button>
        </nav>
      </div>

      {/* Meetings List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMeetings.map((meeting) => (
          <div key={meeting.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{meeting.topic}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Host: {meeting.host_name}</p>
                <div className="flex items-center mt-2">
                  {isMeetingUpcoming(meeting.start_time) ? (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Upcoming
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      Completed
                    </span>
                  )}
                  <span className="ml-2 text-xs text-gray-500">{meeting.participants_count} participants</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(meeting)}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                >
                  <i className="fa fa-edit"></i>
                </button>
                <button
                  onClick={() => handleDelete(meeting.id, meeting.topic)}
                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                >
                  <i className="fa fa-trash"></i>
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Date & Time:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(meeting.start_time).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                <span className="font-medium text-gray-900 dark:text-white">{meeting.duration} min</span>
              </div>
            </div>

            {meeting.agenda && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Agenda:</p>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{meeting.agenda}</p>
              </div>
            )}
          </div>
        ))}

        {filteredMeetings.length === 0 && (
          <div className="col-span-full text-center py-12">
            <i className="fa fa-video text-gray-400 text-4xl mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No meetings found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Schedule your first meeting to get started.</p>
            <button
              onClick={openCreateModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Schedule Meeting
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Meeting Modal */}
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
                    {editingMeeting ? 'Edit Meeting' : 'Schedule New Meeting'}
                  </Dialog.Title>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting Topic</label>
                      <input
                        type="text"
                        required
                        value={formData.topic}
                        onChange={(e) => setFormData({...formData, topic: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Weekly Team Meeting"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date & Time</label>
                        <input
                          type="datetime-local"
                          required
                          value={formData.start_time}
                          onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (minutes)</label>
                        <select
                          value={formData.duration}
                          onChange={(e) => setFormData({...formData, duration: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="30">30 minutes</option>
                          <option value="60">1 hour</option>
                          <option value="90">1.5 hours</option>
                          <option value="120">2 hours</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agenda</label>
                      <textarea
                        value={formData.agenda}
                        onChange={(e) => setFormData({...formData, agenda: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Meeting agenda and topics to discuss"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="host_video"
                          checked={formData.host_video}
                          onChange={(e) => setFormData({...formData, host_video: e.target.checked})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                        />
                        <label htmlFor="host_video" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          Host video on
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="participant_video"
                          checked={formData.participant_video}
                          onChange={(e) => setFormData({...formData, participant_video: e.target.checked})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                        />
                        <label htmlFor="participant_video" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          Participant video on
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Participants</label>
                      <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700">
                        <div className="space-y-2">
                          {users.map((user) => (
                            <label key={user.id} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.participants.includes(user.id)}
                                onChange={() => toggleParticipant(user.id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{user.name} ({user.email})</span>
                            </label>
                          ))}
                        </div>
                        {users.length === 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">No users available</p>
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
                        {editingMeeting ? 'Update Meeting' : 'Schedule Meeting'}
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

export default Meetings