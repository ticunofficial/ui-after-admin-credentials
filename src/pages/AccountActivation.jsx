import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../services/api'

const AccountActivation = () => {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading') // 'loading', 'success', 'error'
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const activationCode = searchParams.get('code')
    if (activationCode) {
      activateAccount(activationCode)
    } else {
      setStatus('error')
      setMessage('Invalid activation link. No activation code found.')
    }
  }, [searchParams])

  const activateAccount = async (code) => {
    try {
      const response = await api.post('/auth/activate-account', {
        activation_code: code
      })
      
      if (response.data.success) {
        setStatus('success')
        setMessage(response.data.message)
        setUser(response.data.user)
      } else {
        setStatus('error')
        setMessage(response.data.message)
      }
    } catch (error) {
      setStatus('error')
      setMessage(error.response?.data?.message || 'Account activation failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">Activating Account</h2>
              <p className="mt-2 text-sm text-gray-600">Please wait while we activate your account...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
                <i className="fa fa-check text-green-600 text-2xl"></i>
              </div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">Account Activated!</h2>
              <p className="mt-2 text-sm text-gray-600">{message}</p>
              {user && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    Welcome, <strong>{user.name}</strong>!<br />
                    Email: {user.email}
                  </p>
                </div>
              )}
              <div className="mt-6">
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Continue to Login
                </Link>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100">
                <i className="fa fa-times text-red-600 text-2xl"></i>
              </div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">Activation Failed</h2>
              <p className="mt-2 text-sm text-gray-600">{message}</p>
              <div className="mt-6 space-y-3">
                <Link
                  to="/register"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Register Again
                </Link>
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AccountActivation