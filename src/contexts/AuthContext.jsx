import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'
import { isTokenExpired, clearAuthData } from '../utils/auth'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check session expiry on app load
    checkSessionExpiry()
    
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // Skip API fetch for test admin token
      if (token === 'TEST_ADMIN_TOKEN') {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
        setLoading(false)
      } else {
        fetchUser()
      }
    } else {
      setLoading(false)
    }
  }, [token])
  
  const checkSessionExpiry = () => {
    const token = localStorage.getItem('token')
    const sessionExpiry = localStorage.getItem('session_expiry')
    const rememberMe = localStorage.getItem('remember_me') === 'true'
    const socialLogin = localStorage.getItem('social_login') === 'true'
    
    // Check JWT token expiry first
    if (token && token !== 'TEST_ADMIN_TOKEN' && isTokenExpired(token)) {
      logout()
      return
    }
    
    if (sessionExpiry) {
      const expiryDate = new Date(sessionExpiry)
      const now = new Date()
      
      if (now > expiryDate) {
        logout()
        return
      }
      
      // Extend session if remember me or social login
      if (rememberMe || socialLogin) {
        const newExpiryDate = new Date()
        newExpiryDate.setDate(newExpiryDate.getDate() + 30)
        localStorage.setItem('session_expiry', newExpiryDate.toISOString())
      }
    }
  }

  const fetchUser = async () => {
    try {
      const response = await api.get('/profile')
      if (response.data.success) {
        setUser(response.data.data)
      } else {
        logout()
      }
    } catch (error) {
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    // Test-only admin bypass
    if (
      credentials?.email === 'admin123@gmail.com' &&
      credentials?.password === 'Admin@123'
    ) {
      const newToken = 'TEST_ADMIN_TOKEN'
      const userData = {
        id: 0,
        name: 'Admin Tester',
        email: 'admin123@gmail.com',
        role_name: 'admin',
        is_super_admin: true
      }
      setToken(newToken)
      setUser(userData)
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('is_super_admin', 'true')
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      return { success: true, data: { access_token: newToken, user: userData } }
    }

    const response = await api.post('/login', credentials)
    
    if (response.data.success) {
      const { access_token: newToken, user: userData } = response.data.data
      
      setToken(newToken)
      setUser(userData)
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userData))
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      
      return response.data
    } else {
      throw new Error(response.data.message || 'Login failed')
    }
  }

  const register = async (userData) => {
    const response = await api.post('/register', userData)
    return response.data
  }

  const logout = async () => {
    try {
      if (token && !isTokenExpired(token)) {
        await api.get('/logout')
      }
    } catch (error) {
      // Ignore 401 errors on logout - token already invalid
      if (error.response?.status !== 401) {
        console.error('Logout API error:', error)
      }
    } finally {
      setToken(null)
      setUser(null)
      clearAuthData()
      localStorage.removeItem('is_super_admin')
      delete api.defaults.headers.common['Authorization']
      window.location.href = '/login'
    }
  }

  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const value = {
    user,
    token,
    login,
    register,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!token
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}