import { useState } from 'react'
import api from '../services/api'

const EmailVerification = () => {
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('send') // 'send' or 'verify'
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')

  const sendVerificationEmail = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    try {
      const response = await api.post('/email/verify', { email })
      
      if (response.data.success) {
        setMessage('Verification email sent! Check your inbox.')
        setMessageType('success')
        setStep('verify')
        // For demo purposes, show the token
        if (response.data.verification_token) {
          setMessage(`Verification email sent! For demo: ${response.data.verification_token}`)
        }
      } else {
        setMessage(response.data.message)
        setMessageType('error')
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to send verification email')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const verifyEmail = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    try {
      const response = await api.post('/email/verify-token', { email, token })
      
      if (response.data.success) {
        setMessage('Email verified successfully!')
        setMessageType('success')
        setStep('success')
      } else {
        setMessage(response.data.message)
        setMessageType('error')
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to verify email')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const resendVerification = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const response = await api.post('/email/resend-verification', { email })
      
      if (response.data.success) {
        setMessage('Verification email resent!')
        setMessageType('success')
        // For demo purposes, show the token
        if (response.data.verification_token) {
          setMessage(`Verification email resent! For demo: ${response.data.verification_token}`)
        }
      } else {
        setMessage(response.data.message)
        setMessageType('error')
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to resend verification email')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const checkVerificationStatus = async () => {
    if (!email) return
    
    try {
      const response = await api.get(`/email/verification-status/${encodeURIComponent(email)}`)
      
      if (response.data.success) {
        if (response.data.is_verified) {
          setMessage(`Email is already verified (${new Date(response.data.verified_at).toLocaleString()})`)
          setMessageType('success')
          setStep('success')
        } else {
          setMessage('Email is not verified yet')
          setMessageType('info')
        }
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to check verification status')
      setMessageType('error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <i className="fa fa-envelope text-blue-600 dark:text-blue-400 text-xl"></i>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Email Verification
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {step === 'send' && 'Enter your email to receive verification link'}
            {step === 'verify' && 'Enter the verification token from your email'}
            {step === 'success' && 'Your email has been verified successfully!'}
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

        {step === 'send' && (
          <form className="mt-8 space-y-6" onSubmit={sendVerificationEmail}>
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
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email address"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  'Send Verification Email'
                )}
              </button>
              
              <button
                type="button"
                onClick={checkVerificationStatus}
                className="group relative flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Check Status
              </button>
            </div>
          </form>
        )}

        {step === 'verify' && (
          <form className="mt-8 space-y-6" onSubmit={verifyEmail}>
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Verification Token
              </label>
              <input
                id="token"
                name="token"
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter verification token from email"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  'Verify Email'
                )}
              </button>
              
              <button
                type="button"
                onClick={resendVerification}
                disabled={loading}
                className="group relative flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Resend
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('send')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
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
              Email Verified Successfully!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Your email address has been verified. You can now access all features.
            </p>
            <button
              onClick={() => {
                setStep('send')
                setEmail('')
                setToken('')
                setMessage('')
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Verify Another Email
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default EmailVerification