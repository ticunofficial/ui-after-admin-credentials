// Integration helper for React-Laravel connection
import api from './api'

export const integrationService = {
  // Test connection
  async testConnection() {
    try {
      const response = await api.get('/test')
      return response.data
    } catch (error) {
      console.error('Connection test failed:', error)
      throw error
    }
  },

  // Authentication
  async login(credentials) {
    try {
      const response = await api.post('/login', credentials)
      if (response.data.success) {
        localStorage.setItem('token', response.data.data.access_token)
        localStorage.setItem('user', JSON.stringify(response.data.data.user))
      }
      return response.data
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  },

  async logout() {
    try {
      await api.get('/logout')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  },

  // Dashboard data
  async getDashboard() {
    try {
      const response = await api.get('/dashboard')
      return response.data
    } catch (error) {
      console.error('Dashboard fetch failed:', error)
      throw error
    }
  },

  // Users
  async getUsers() {
    try {
      const response = await api.get('/users')
      return response.data
    } catch (error) {
      console.error('Users fetch failed:', error)
      throw error
    }
  },

  // Chat
  async getUsersList() {
    try {
      const response = await api.get('/users-list')
      return response.data
    } catch (error) {
      console.error('Users list fetch failed:', error)
      throw error
    }
  },

  async getConversations() {
    try {
      const response = await api.get('/conversations')
      return response.data
    } catch (error) {
      console.error('Conversations fetch failed:', error)
      throw error
    }
  },

  async sendMessage(messageData) {
    try {
      const response = await api.post('/send-message', messageData)
      return response.data
    } catch (error) {
      console.error('Send message failed:', error)
      throw error
    }
  }
}

export default integrationService