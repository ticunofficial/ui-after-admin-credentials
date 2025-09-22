import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const Chat = () => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showNewConversation, setShowNewConversation] = useState(false)
  const [allUsers, setAllUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('contacts') // contacts, groups, blocked
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)
  const pollIntervalRef = useRef(null)

  useEffect(() => {
    fetchConversations()
    fetchAllUsers()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Start polling for new messages when a conversation is selected
    if (selectedConversation) {
      startPolling()
    } else {
      stopPolling()
    }
    
    return () => stopPolling()
  }, [selectedConversation])

  const startPolling = () => {
    stopPolling() // Clear any existing interval
    pollIntervalRef.current = setInterval(() => {
      if (selectedConversation) {
        fetchMessages(selectedConversation.id, false) // false = don't scroll
      }
      // Also refresh conversations list every 10 seconds
      if (Date.now() % 10000 < 2000) {
        fetchConversations()
      }
    }, 2000) // Poll every 2 seconds
  }

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const fetchConversations = async () => {
    try {
      const response = await api.get('/conversations')
      const data = response.data.data || response.data || []
      setConversations(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAllUsers = async () => {
    try {
      const response = await api.get('/users')
      const data = response.data.data || []
      setAllUsers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setAllUsers([])
    }
  }

  const fetchMessages = async (conversationId, shouldScroll = true) => {
    try {
      const response = await api.get(`/users/${conversationId}/conversation`)
      const messageData = response.data.data || response.data || []
      const newMessages = Array.isArray(messageData) ? messageData : []
      
      // Only update if messages have changed
      setMessages(prevMessages => {
        if (JSON.stringify(prevMessages) !== JSON.stringify(newMessages)) {
          if (shouldScroll) {
            setTimeout(() => scrollToBottom(), 100)
          }
          return newMessages
        }
        return prevMessages
      })
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const selectConversation = async (conversation) => {
    setSelectedConversation(conversation)
    await fetchMessages(conversation.id, true)
  }

  const sendMessage = async (e, messageData = null) => {
    if (e) e.preventDefault()
    
    let messageContent, messageType = 0
    
    if (messageData) {
      // File or image message
      messageContent = messageData.url
      messageType = messageData.type // 1 for image, 2 for file
    } else {
      // Text message
      if (!newMessage.trim() || !selectedConversation) return
      messageContent = newMessage
      setNewMessage('')
    }

    // Add message to local state immediately
    const tempMessage = {
      id: `temp_${Date.now()}_${Math.random()}`,
      message: messageContent,
      from_id: String(user?.id),
      to_id: selectedConversation.id,
      message_type: messageType,
      file_name: messageData?.fileName,
      file_size: messageData?.fileSize,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, tempMessage])

    try {
      const response = await api.post('/send-message', {
        to_id: selectedConversation.id,
        message: messageContent,
        message_type: messageType
      })
      
      // Update with server response if needed
      if (response.data.success) {
        // Keep the temp message as is, just change ID to mark as sent
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMessage.id ? { ...msg, id: Date.now() } : msg
          )
        )
        // Refresh conversations list to show new conversation
        fetchConversations()
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      // Remove failed message from local state
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
      if (!messageData) {
        setNewMessage(messageContent) // Restore message text for text messages
      }
      alert('Failed to send message. Please try again.')
    }
  }
  
  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file || !selectedConversation) return
    
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await api.post('/chat/upload-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      if (response.data.success) {
        await sendMessage(null, {
          url: response.data.file_url,
          type: 2, // File type
          fileName: response.data.file_name,
          fileSize: response.data.file_size
        })
      }
    } catch (error) {
      console.error('Failed to upload file:', error)
      alert('Failed to upload file: ' + (error.response?.data?.message || error.message))
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }
  
  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file || !selectedConversation) return
    
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await api.post('/chat/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      if (response.data.success) {
        await sendMessage(null, {
          url: response.data.image_url,
          type: 1, // Image type
          fileName: response.data.file_name,
          fileSize: response.data.file_size
        })
      }
    } catch (error) {
      console.error('Failed to upload image:', error)
      alert('Failed to upload image: ' + (error.response?.data?.message || error.message))
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }
  
  const renderMessage = (message) => {
    const messageType = message.message_type || 0
    
    switch (messageType) {
      case 1: // Image
        return (
          <div className="space-y-2">
            <img
              src={`http://localhost:8000${message.message}`}
              alt="Shared image"
              className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(`http://localhost:8000${message.message}`, '_blank')}
              onError={(e) => {
                e.target.src = '/assets/images/file-error.png'
              }}
            />
            {message.file_name && (
              <p className="text-xs opacity-75">{message.file_name}</p>
            )}
          </div>
        )
      case 2: // File
        return (
          <div className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-600 rounded-lg">
            <div className="p-2 bg-blue-500 rounded-lg">
              <i className="fa fa-file text-white"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{message.file_name || 'File'}</p>
              {message.file_size && (
                <p className="text-xs opacity-75">{(message.file_size / 1024).toFixed(1)} KB</p>
              )}
            </div>
            <a
              href={`http://localhost:8000${message.message}`}
              download
              className="p-2 text-blue-500 hover:text-blue-700 transition-colors"
              title="Download file"
            >
              <i className="fa fa-download"></i>
            </a>
          </div>
        )
      default: // Text
        return (
          <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {message.message || 'Message content unavailable'}
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700" style={{ height: 'calc(100vh - 120px)' }}>
      <div className="flex h-full">
        {/* Left Sidebar - Conversations */}
        <div className="w-80 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 flex-shrink-0">
          <div className="p-4 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Conversations</h3>
            <button
              onClick={() => setShowNewConversation(true)}
              className="p-2 text-blue-600 hover:text-blue-700 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
              title="New Conversation"
            >
              <i className="fa fa-plus"></i>
            </button>
          </div>
          
          <div className="p-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <i className="fa fa-search text-gray-400 dark:text-gray-500"></i>
              </div>
              <input
                type="search"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-y-auto" style={{ height: 'calc(100vh - 280px)' }}>
            {!Array.isArray(conversations) || conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <i className="fa fa-comments-o text-4xl mb-4"></i>
                <p>No conversations found</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => selectConversation(conversation)}
                  className={`p-4 border-b border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-blue-50 dark:bg-blue-900 border-r-2 border-r-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className="relative">
                      <img
                        src={conversation.photo_url || '/assets/images/avatar.png'}
                        alt={conversation.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {conversation.is_online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">{conversation.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {conversation.last_message || 'No messages yet'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side - Chat Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={selectedConversation.photo_url || '/assets/images/avatar.png'}
                      alt={selectedConversation.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="ml-3">
                      <div className="font-medium text-gray-900 dark:text-white">{selectedConversation.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedConversation.is_online ? (
                          <span className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            Online
                          </span>
                        ) : 'Offline'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                      <i className="fa fa-phone"></i>
                    </button>
                    <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                      <i className="fa fa-video-camera"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900" style={{ height: 'calc(100vh - 280px)', maxHeight: 'calc(100vh - 280px)' }}>
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                    <i className="fa fa-comment-o text-4xl mb-4"></i>
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Array.isArray(messages) && messages.map((message, index) => {
                      const isOwnMessage = String(message.from_id) === String(user?.id)
                      const isPending = typeof message.id === 'string' && message.id.startsWith('temp_')
                      const showAvatar = index === 0 || messages[index - 1]?.from_id !== message.from_id
                      
                      return (
                        <div
                          key={`${message.id}_${index}`}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-4' : 'mt-1'}`}
                        >
                          <div className={`flex items-end space-x-2 max-w-sm lg:max-w-lg xl:max-w-2xl ${
                            isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''
                          }`}>
                            {showAvatar ? (
                              <img
                                src={isOwnMessage ? user?.photo_url || '/assets/images/avatar.png' : selectedConversation.photo_url || '/assets/images/avatar.png'}
                                alt="Avatar"
                                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 flex-shrink-0"></div>
                            )}
                            <div
                              className={`px-4 py-3 rounded-2xl relative shadow-sm ${
                                isOwnMessage
                                  ? `bg-blue-500 text-white ${showAvatar ? 'rounded-br-md' : 'rounded-r-md'} ${isPending ? 'opacity-70' : ''}`
                                  : `bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 ${showAvatar ? 'rounded-bl-md' : 'rounded-l-md'}`
                              }`}
                            >
                              {renderMessage(message)}
                              <div className={`text-xs mt-2 flex items-center justify-between ${
                                isOwnMessage ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                <span>
                                  {message.created_at ? 
                                    new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
                                    'Now'
                                  }
                                </span>
                                {isPending && isOwnMessage && (
                                  <span className="ml-2 text-xs">⏳</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  {/* File Upload Inputs */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                  />
                  <input
                    ref={imageInputRef}
                    type="file"
                    onChange={handleImageUpload}
                    className="hidden"
                    accept="image/*"
                  />
                  
                  {/* Upload Buttons */}
                  <div className="flex space-x-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                      title="Upload file"
                    >
                      <i className="fa fa-paperclip"></i>
                    </button>
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={uploading}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                      title="Upload image"
                    >
                      <i className="fa fa-image"></i>
                    </button>
                  </div>
                  
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage(e)
                        }
                      }}
                      placeholder={uploading ? "Uploading..." : "Type a message... (Press Enter to send)"}
                      disabled={uploading}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none disabled:opacity-50"
                      autoFocus
                    />
                    {uploading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || uploading}
                    className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    <i className="fa fa-paper-plane"></i>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <i className="fa fa-comments text-6xl mb-4"></i>
                <h3 className="text-xl font-medium mb-2">Welcome to Chat</h3>
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      {showNewConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-96 max-h-96">
            <div className="p-4 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">New Conversation</h3>
              <button
                onClick={() => {
                setShowNewConversation(false)
                setSearchQuery('')
                setActiveTab('contacts')
              }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <i className="fa fa-times"></i>
              </button>
            </div>
            <div className="p-4">
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 dark:border-gray-600 mb-4">
                <button
                  onClick={() => setActiveTab('contacts')}
                  className={`px-4 py-2 text-sm font-medium ${activeTab === 'contacts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  My Contacts
                </button>
                <button
                  onClick={() => setActiveTab('groups')}
                  className={`px-4 py-2 text-sm font-medium ${activeTab === 'groups' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Groups
                </button>
                <button
                  onClick={() => setActiveTab('blocked')}
                  className={`px-4 py-2 text-sm font-medium ${activeTab === 'blocked' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Blocked Users
                </button>
              </div>

              {/* Search */}
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              />

              {/* New Group Button */}
              {activeTab === 'groups' && (
                <button
                  onClick={() => alert('Create new group functionality coming soon!')}
                  className="w-full mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
                >
                  <i className="fa fa-plus mr-2"></i>
                  Create New Group
                </button>
              )}

              {/* Content */}
              <div className="max-h-64 overflow-y-auto">
                {activeTab === 'contacts' && (
                  allUsers
                    .filter(u => u.id !== user?.id)
                    .filter(u => 
                      searchQuery === '' || 
                      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      u.email.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((contact) => (
                      <div
                        key={contact.id}
                        onClick={() => {
                          selectConversation({
                            id: contact.id,
                            name: contact.name,
                            email: contact.email,
                            photo_url: contact.photo_url,
                            is_online: contact.is_online
                          })
                          setShowNewConversation(false)
                          setSearchQuery('')
                        }}
                        className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer rounded-md"
                      >
                        <img
                          src={contact.photo_url || '/assets/images/avatar.png'}
                          alt={contact.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="ml-3 flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">{contact.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{contact.email}</div>
                        </div>
                        {contact.is_online && (
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                    ))
                )}

                {activeTab === 'groups' && (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <i className="fa fa-users text-4xl mb-4"></i>
                    <p>No groups yet</p>
                    <p className="text-sm">Create your first group to get started</p>
                  </div>
                )}

                {activeTab === 'blocked' && (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <i className="fa fa-user-slash text-4xl mb-4"></i>
                    <p>No blocked users</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Chat