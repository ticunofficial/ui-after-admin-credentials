import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [step, setStep] = useState('register') // 'register', 'activation', 'success'
  const [activationCode, setActivationCode] = useState('')
  const [registeredEmail, setRegisteredEmail] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const response = await api.post('/auth/register-with-activation', formData)
      
      if (response.data.success) {
        setRegisteredEmail(formData.email)
        setSuccess('Registration successful! Please check your email for activation link.')
        setStep('activation')
        
        // For demo, show activation code
        if (response.data.activation_code) {
          setSuccess(`Registration successful! For demo, activation code: ${response.data.activation_code}`)
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }
  
  const handleActivation = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await api.post('/auth/activate-account', {
        activation_code: activationCode
      })
      
      if (response.data.success) {
        setSuccess('Account activated successfully! You can now login.')
        setStep('success')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Activation failed')
    } finally {
      setLoading(false)
    }
  }
  
  const handleResendActivation = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await api.post('/auth/resend-activation', {
        email: registeredEmail
      })
      
      if (response.data.success) {
        setSuccess('Activation email resent! Please check your inbox.')
        
        // For demo, show new activation code
        if (response.data.activation_code) {
          setSuccess(`Activation email resent! For demo, new code: ${response.data.activation_code}`)
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend activation email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Register
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your account
          </p>
        </div>

        {step === 'register' && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name: <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email: <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password: <span className="text-red-500">*</span>
              <i className="fa fa-question-circle ml-2 text-gray-400" title="Minimum 8 characters required, no spaces allowed"></i>
            </label>
            <div className="mt-1 relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength="8"
                className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`fa ${showPassword ? 'fa-eye' : 'fa-eye-slash'} text-gray-400`}></i>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
              Confirm Password: <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 relative">
              <input
                id="password_confirmation"
                name="password_confirmation"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                minLength="8"
                className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm Password"
                value={formData.password_confirmation}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <i className={`fa ${showConfirmPassword ? 'fa-eye' : 'fa-eye-slash'} text-gray-400`}></i>
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>

          <div className="text-center">
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Already have membership?
            </Link>
          </div>
          </form>
        )}
        
        {step === 'activation' && (
          <form className="mt-8 space-y-6" onSubmit={handleActivation}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}
            
            <div className="text-center mb-6">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
                <i className="fa fa-envelope text-blue-600 text-xl"></i>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Activate Your Account</h3>
              <p className="mt-2 text-sm text-gray-600">
                We've sent an activation link to <strong>{registeredEmail}</strong>
              </p>
            </div>
            
            <div>
              <label htmlFor="activationCode" className="block text-sm font-medium text-gray-700">
                Activation Code
              </label>
              <input
                id="activationCode"
                type="text"
                required
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter activation code from email"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Activating...' : 'Activate Account'}
            </button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendActivation}
                disabled={loading}
                className="font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
              >
                Didn't receive the email? Resend activation link
              </button>
            </div>
          </form>
        )}
        
        {step === 'success' && (
          <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
              <i className="fa fa-check text-green-600 text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Account Activated Successfully!
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Your account has been activated. You will be redirected to login shortly.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Login
            </Link>
          </div>
        )}
        
        {step !== 'success' && (
          <div className="text-center">
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Already have membership?
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Register