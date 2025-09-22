import { useState } from 'react'
import api from '../services/api'

const PasswordReset = () => {
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('email') // 'email', 'reset', 'success'
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')

  const sendResetEmail = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    try {
      const response = await api.post('/password/forgot', { email })
      
      if (response.data.success) {
        setMessage('Password reset email sent! Check your inbox.')
        setMessageType('success')
        setStep('reset')
        // For demo purposes, show the token
        if (response.data.reset_token) {
          setMessage(`Password reset email sent! For demo: ${response.data.reset_token}`)
        }
      } else {
        setMessage(response.data.message)
        setMessageType('error')
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to send reset email')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const verifyToken = async () => {
    if (!token) return false
    
    try {
      const response = await api.post('/password/verify-token', { email, token })
      return response.data.success
    } catch (error) {
      setMessage(error.response?.data?.message || 'Invalid token')
      setMessageType('error')
      return false
    }
  }

  const resetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    // Validate passwords match
    if (password !== passwordConfirmation) {
      setMessage('Passwords do not match')
      setMessageType('error')
      setLoading(false)
      return
    }
    
    // Validate password length
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters')
      setMessageType('error')
      setLoading(false)
      return
    }
    
    try {
      const response = await api.post('/password/reset', {
        email,
        token,
        password,
        password_confirmation: passwordConfirmation
      })
      
      if (response.data.success) {
        setMessage('Password reset successfully!')
        setMessageType('success')
        setStep('success')
      } else {
        setMessage(response.data.message)
        setMessageType('error')
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to reset password')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleTokenChange = async (e) => {
    const newToken = e.target.value
    setToken(newToken)
    
    // Auto-verify token when it looks complete (60 characters)
    if (newToken.length === 60) {
      const isValid = await verifyToken()
      if (isValid) {
        setMessage('Token verified! Enter your new password.')
        setMessageType('success')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <i className="fa fa-key text-red-600 dark:text-red-400 text-xl"></i>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {step === 'email' && 'Enter your email to receive reset instructions'}
            {step === 'reset' && 'Enter the reset token and your new password'}
            {step === 'success' && 'Your password has been reset successfully!'}
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`rounded-md p-4 ${
            messageType === 'success' ? 'bg-green-50 border border-green-200' :
            messageType === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                <i className={`fa ${
                  messageType === 'success' ? 'fa-check-circle text-green-400' :
                  messageType === 'error' ? 'fa-exclamation-circle text-red-400' :
                  'fa-info-circle text-blue-400'
                }`}></i>
              </div>
              <div className="ml-3">
                <p className={`text-sm ${
                  messageType === 'success' ? 'text-green-800' :
                  messageType === 'error' ? 'text-red-800' :
                  'text-blue-800'
                }`}>
                  {message}
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 'email' && (
          <form className="mt-8 space-y-6" onSubmit={sendResetEmail}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  'Send Reset Email'
                )}
              </button>
            </div>
          </form>
        )}

        {step === 'reset' && (
          <form className="mt-8 space-y-6" onSubmit={resetPassword}>
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reset Token
              </label>
              <input
                id="token"
                name="token"
                type="text"
                required
                value={token}
                onChange={handleTokenChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Enter reset token from email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Enter new password (min 6 characters)"
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="passwordConfirmation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                id="passwordConfirmation"
                name="passwordConfirmation"
                type="password"
                required
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Confirm new password"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !token || password.length < 6 || password !== passwordConfirmation}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Resetting...
                  </div>
                ) : (
                  'Reset Password'
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
              >
                ← Back to email entry
              </button>
            </div>
          </form>
        )}

        {step === 'success' && (
          <div className="mt-8 text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900 mb-4">
              <i className="fa fa-check text-green-600 dark:text-green-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Password Reset Successfully!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Your password has been updated. You can now login with your new password.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setStep('email')
                  setEmail('')
                  setToken('')
                  setPassword('')
                  setPasswordConfirmation('')
                  setMessage('')
                }}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Reset Another Password
              </button>
              <a
                href="/app/login"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Login
              </a>
            </div>
          </div>
        )}

        {/* Password Requirements */}
        {step === 'reset' && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Password Requirements:</h4>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li className={`flex items-center ${password.length >= 6 ? 'text-green-600 dark:text-green-400' : ''}`}>
                <i className={`fa ${password.length >= 6 ? 'fa-check' : 'fa-times'} mr-2`}></i>
                At least 6 characters
              </li>
              <li className={`flex items-center ${password && passwordConfirmation && password === passwordConfirmation ? 'text-green-600 dark:text-green-400' : ''}`}>
                <i className={`fa ${password && passwordConfirmation && password === passwordConfirmation ? 'fa-check' : 'fa-times'} mr-2`}></i>
                Passwords match
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default PasswordReset