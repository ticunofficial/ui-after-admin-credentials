import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  })
  
  useEffect(() => {
    // Load remembered credentials on component mount
    const rememberedEmail = localStorage.getItem('remembered_email')
    const rememberedPassword = localStorage.getItem('remembered_password')
    const wasRemembered = localStorage.getItem('remember_me') === 'true'
    
    if (wasRemembered && rememberedEmail) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail,
        password: rememberedPassword || '',
        remember: true
      }))
    }
  }, [])
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Handle remember me functionality
      if (formData.remember) {
        localStorage.setItem('remembered_email', formData.email)
        localStorage.setItem('remembered_password', formData.password)
        localStorage.setItem('remember_me', 'true')
        
        // Set extended session (30 days)
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + 30)
        localStorage.setItem('session_expiry', expiryDate.toISOString())
      } else {
        // Clear remembered credentials
        localStorage.removeItem('remembered_email')
        localStorage.removeItem('remembered_password')
        localStorage.removeItem('remember_me')
        localStorage.removeItem('session_expiry')
      }
      
      await login(formData)
      setSuccess('Login successful!')
      navigate('/app/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider) => {
    setLoading(true)
    setError('')
    
    try {
      // Demo social login data
      const demoSocialData = {
        provider: provider,
        access_token: 'demo_access_token',
        social_id: `demo_${provider}_${Date.now()}`,
        email: `demo@${provider}.com`,
        name: `Demo ${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        avatar: `https://via.placeholder.com/150?text=${provider.charAt(0).toUpperCase()}`
      }
      
      const response = await api.post('/auth/social/login', demoSocialData)
      
      if (response.data.success) {
        // Set extended session for social login
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + 30)
        localStorage.setItem('session_expiry', expiryDate.toISOString())
        localStorage.setItem('social_login', 'true')
        
        setSuccess(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login successful!`)
        setTimeout(() => {
          navigate('/app/dashboard')
        }, 1000)
      }
    } catch (error) {
      setError(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login failed: ` + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 items-center justify-center p-12">
        <div className="text-center text-white max-w-md">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <span className="text-blue-200">THINKERS</span>
              <span className="text-purple-200">CLUB</span>
            </h1>
            <p className="text-xl text-blue-100">Admin Dashboard</p>
          </div>
          <div className="space-y-6 text-blue-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <i className="fa fa-users text-xl"></i>
              </div>
              <div className="text-left">
                <h3 className="font-semibold">User Management</h3>
                <p className="text-sm text-blue-200">Manage users, roles & permissions</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <i className="fa fa-chart-line text-xl"></i>
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-sm text-blue-200">Track performance & insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <i className="fa fa-comments text-xl"></i>
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Communication</h3>
                <p className="text-sm text-blue-200">Monitor conversations & chats</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="lg:hidden mb-6">
                <h1 className="text-2xl font-bold">
                  <span className="text-blue-600">THINKERS</span>
                  <span className="text-purple-600">CLUB</span>
                </h1>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-600 mt-2">Sign in to your admin account</p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <i className="fa fa-exclamation-circle text-red-500 mr-3"></i>
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              </div>
            )}
            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <i className="fa fa-check-circle text-green-500 mr-3"></i>
                  <span className="text-green-700 text-sm">{success}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <i className="fa fa-envelope absolute left-3 top-3 text-gray-400"></i>
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full px-4 py-3 pl-11 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <i className="fa fa-lock absolute left-3 top-3 text-gray-400"></i>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formData.remember}
                    onChange={handleChange}
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me for 30 days</span>
                </label>
                <Link to="/app/password-reset" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <i className="fa fa-sign-in mr-2"></i>
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Social Login Section */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  disabled={loading}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <i className="fab fa-google text-red-500 mr-2"></i>
                  Google
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('facebook')}
                  disabled={loading}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <i className="fab fa-facebook-f text-blue-600 mr-2"></i>
                  Facebook
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-500 font-medium">
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login