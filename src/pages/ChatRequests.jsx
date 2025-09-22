import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import api from '../services/api'

const ChatRequests = () => {
  const [receivedRequests, setReceivedRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('received')
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')

  useEffect(() => {
    fetchRequests()
    fetchUsers()
  }, [])

  const fetchRequests = async () => {
    try {
      const [receivedResponse, sentResponse] = await Promise.all([
        api.get('/chat-requests/received'),
        api.get('/chat-requests/sent')
      ])
      
      setReceivedRequests(receivedResponse.data.data || [])
      setSentRequests(sentResponse.data.data || [])
    } catch (error) {
      console.error('Failed to fetch chat requests:', error)
      setReceivedRequests([])
      setSentRequests([])
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

  const sendChatRequest = async (e) => {
    e.preventDefault()
    try {
      await api.post('/chat-requests/send', {
        to_user_id: selectedUserId
      })
      setIsSendModalOpen(false)
      setSelectedUserId('')
      fetchRequests()
      alert('Chat request sent successfully!')
    } catch (error) {
      console.error('Failed to send chat request:', error)
      alert('Failed to send chat request: ' + (error.response?.data?.message || error.message))
    }
  }

  const acceptRequest = async (requestId) => {
    try {
      await api.post(`/chat-requests/${requestId}/accept`)
      fetchRequests()
      alert('Chat request accepted!')
    } catch (error) {
      console.error('Failed to accept request:', error)
      alert('Failed to accept request')
    }
  }

  const declineRequest = async (requestId) => {
    try {
      await api.post(`/chat-requests/${requestId}/decline`)
      fetchRequests()
      alert('Chat request declined!')
    } catch (error) {
      console.error('Failed to decline request:', error)
      alert('Failed to decline request')
    }
  }

  const cancelRequest = async (requestId) => {
    if (window.confirm('Are you sure you want to cancel this chat request?')) {
      try {
        await api.delete(`/chat-requests/${requestId}`)
        fetchRequests()
        alert('Chat request cancelled!')
      } catch (error) {
        console.error('Failed to cancel request:', error)
        alert('Failed to cancel request')
      }
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 0:
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
      case 1:
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Accepted</span>
      case 2:
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Declined</span>
      default:
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Chat Requests</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage chat connection requests</p>
        </div>
        <button
          onClick={() => setIsSendModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <i className="fa fa-plus"></i>
          <span>Send Request</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('received')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'received'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Received ({receivedRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sent'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Sent ({sentRequests.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'received' && (
            <div className="space-y-4">
              {receivedRequests.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fa fa-inbox text-gray-400 text-4xl mb-4"></i>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No received requests</h3>
                  <p className="text-gray-500 dark:text-gray-400">You haven't received any chat requests yet.</p>
                </div>
              ) : (
                receivedRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <img
                        src={request.sender_photo ? (request.sender_photo.startsWith('http') ? request.sender_photo : `http://localhost:8000${request.sender_photo}`) : '/assets/images/avatar.png'}
                        alt={request.sender_name}
                        className="h-12 w-12 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = '/assets/images/avatar.png'
                        }}
                      />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{request.sender_name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{request.sender_email}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Sent: {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(request.status)}
                      {request.status === 0 && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => acceptRequest(request.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => declineRequest(request.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'sent' && (
            <div className="space-y-4">
              {sentRequests.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fa fa-paper-plane text-gray-400 text-4xl mb-4"></i>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No sent requests</h3>
                  <p className="text-gray-500 dark:text-gray-400">You haven't sent any chat requests yet.</p>
                </div>
              ) : (
                sentRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <img
                        src={request.receiver_photo ? (request.receiver_photo.startsWith('http') ? request.receiver_photo : `http://localhost:8000${request.receiver_photo}`) : '/assets/images/avatar.png'}
                        alt={request.receiver_name}
                        className="h-12 w-12 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = '/assets/images/avatar.png'
                        }}
                      />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{request.receiver_name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{request.receiver_email}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Sent: {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(request.status)}
                      {request.status === 0 && (
                        <button
                          onClick={() => cancelRequest(request.id)}
                          className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Send Request Modal */}
      <Transition appear show={isSendModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsSendModalOpen(false)}>
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
                    Send Chat Request
                  </Dialog.Title>

                  <form onSubmit={sendChatRequest} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select User</label>
                      <select
                        required
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a user to send request</option>
                        {users.filter(user => 
                          !sentRequests.some(req => req.owner_id == user.id) &&
                          !receivedRequests.some(req => req.from_id == user.id)
                        ).map((user) => (
                          <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsSendModalOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Send Request
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

export default ChatRequests