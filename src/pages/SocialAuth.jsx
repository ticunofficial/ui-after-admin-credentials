import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const SocialAuth = () => {
  const { user, updateUser } = useAuth()
  const [providers, setProviders] = useState({})
  const [socialAccounts, setSocialAccounts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProviders()
    if (user?.id) {
      fetchSocialAccounts()
    }
  }, [user])

  const fetchProviders = async () => {
    try {
      const response = await api.get('/auth/social/providers')
      setProviders(response.data.data || {})
    } catch (error) {
      console.error('Failed to fetch providers:', error)
      setProviders({})
    } finally {
      setLoading(false)
    }
  }

  const fetchSocialAccounts = async () => {
    try {
      const response = await api.get(`/auth/social/accounts/${user.id}`)
      setSocialAccounts(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch social accounts:', error)
      setSocialAccounts([])
    }
  }

  const handleSocialLogin = async (provider) => {
    try {
      // In a real implementation, this would open OAuth popup/redirect
      // For demo, we'll simulate the OAuth flow
      
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
        if (response.data.user) {
          updateUser(response.data.user)
          fetchSocialAccounts()
          alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login successful!`)
        }
      }
    } catch (error) {
      console.error('Social login failed:', error)
      alert('Social login failed: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleUnlinkAccount = async (provider) => {
    if (window.confirm(`Are you sure you want to unlink your ${provider} account?`)) {
      try {
        await api.delete(`/auth/social/unlink/${user.id}/${provider}`)
        fetchSocialAccounts()
        alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} account unlinked successfully!`)
      } catch (error) {
        console.error('Failed to unlink account:', error)
        alert('Failed to unlink account')
      }
    }
  }

  const isAccountLinked = (provider) => {
    return socialAccounts.some(account => account.provider === provider)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Social Authentication</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Connect your social media accounts for easy login</p>
      </div>

      {/* Demo Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <i className="fa fa-info-circle text-blue-400"></i>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Demo Mode</h3>
            <div className="mt-1 text-sm text-blue-700">
              <p>This is a demo implementation. In production, this would integrate with actual OAuth providers (Google, Facebook, etc.).</p>
            </div>
          </div>
        </div>
      </div>

      {/* Social Providers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(providers).map(([key, provider]) => {
          const isLinked = isAccountLinked(key)
          const linkedAccount = socialAccounts.find(account => account.provider === key)
          
          return (
            <div key={key} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${provider.color}`}>
                    <i className={`${provider.icon} text-white text-xl`}></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{provider.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {isLinked ? 'Connected' : 'Not connected'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  {isLinked ? (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      <i className="fa fa-check mr-1"></i>
                      Linked
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      <i className="fa fa-times mr-1"></i>
                      Not Linked
                    </span>
                  )}
                </div>
              </div>

              {isLinked && linkedAccount && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Connected:</strong> {new Date(linkedAccount.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Provider ID:</strong> {linkedAccount.provider_id}
                  </p>
                </div>
              )}

              <div className="flex space-x-3">
                {!isLinked ? (
                  <button
                    onClick={() => handleSocialLogin(key)}
                    className={`flex-1 ${provider.color} text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2`}
                  >
                    <i className={provider.icon}></i>
                    <span>Connect {provider.name}</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleSocialLogin(key)}
                      className={`flex-1 ${provider.color} text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2`}
                    >
                      <i className={provider.icon}></i>
                      <span>Login with {provider.name}</span>
                    </button>
                    <button
                      onClick={() => handleUnlinkAccount(key)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                      title="Unlink Account"
                    >
                      <i className="fa fa-unlink"></i>
                    </button>
                  </>
                )}
              </div>

              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                {!isLinked ? (
                  <p>Connect your {provider.name} account to enable social login</p>
                ) : (
                  <p>You can login using your {provider.name} account or unlink it</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Account Status */}
      {user && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Status</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{socialAccounts.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Connected Accounts</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {user.email_verified_at ? '✓' : '✗'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Email Verified</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {user.is_active ? 'Active' : 'Inactive'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Account Status</div>
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <i className="fa fa-shield-alt text-yellow-400"></i>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
            <div className="mt-1 text-sm text-yellow-700">
              <p>Linking social accounts allows you to login using those services. You can unlink accounts at any time. Your account security is maintained through our secure authentication system.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SocialAuth