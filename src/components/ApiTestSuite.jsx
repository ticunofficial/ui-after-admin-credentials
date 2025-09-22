import { useState } from 'react'
import api from '../services/api'

const ApiTestSuite = () => {
  const [results, setResults] = useState({})
  const [testing, setTesting] = useState(false)

  const endpoints = [
    { name: 'Test Connection', method: 'GET', url: '/test', auth: false },
    { name: 'Login', method: 'POST', url: '/login', auth: false, data: { email: 'admin@test.com', password: 'password' } },
    { name: 'Dashboard Data', method: 'GET', url: '/dashboard', auth: true },
    { name: 'Users List', method: 'GET', url: '/users', auth: true },
    { name: 'Roles List', method: 'GET', url: '/roles', auth: true },
    { name: 'Permissions List', method: 'GET', url: '/permissions', auth: true },
    { name: 'Profile', method: 'GET', url: '/profile', auth: true },
    { name: 'Conversations', method: 'GET', url: '/conversations', auth: true },
    { name: 'Users List (Chat)', method: 'GET', url: '/users-list', auth: true },
    { name: 'Dashboard Stats', method: 'GET', url: '/dashboard/stats', auth: true },
    { name: 'Transactions', method: 'GET', url: '/transactions', auth: true },
    { name: 'Transaction Stats', method: 'GET', url: '/transactions/stats', auth: true },
    { name: 'Settings', method: 'GET', url: '/settings', auth: true },
    { name: 'Products', method: 'GET', url: '/products', auth: false }
  ]

  const testEndpoint = async (endpoint) => {
    try {
      let response
      if (endpoint.method === 'POST') {
        response = await api.post(endpoint.url, endpoint.data || {})
      } else {
        response = await api.get(endpoint.url)
      }
      
      return {
        status: 'success',
        statusCode: response.status,
        data: response.data,
        message: 'Success'
      }
    } catch (error) {
      return {
        status: 'error',
        statusCode: error.response?.status || 0,
        data: error.response?.data || null,
        message: error.message
      }
    }
  }

  const testAllEndpoints = async () => {
    setTesting(true)
    setResults({})
    
    for (const endpoint of endpoints) {
      const result = await testEndpoint(endpoint)
      setResults(prev => ({
        ...prev,
        [endpoint.name]: result
      }))
    }
    
    setTesting(false)
  }

  const getStatusColor = (status, statusCode) => {
    if (status === 'success') {
      return statusCode >= 200 && statusCode < 300 ? 'text-green-600' : 'text-yellow-600'
    }
    return 'text-red-600'
  }

  const getStatusIcon = (status, statusCode) => {
    if (status === 'success') {
      return statusCode >= 200 && statusCode < 300 ? 'fa-check-circle' : 'fa-exclamation-triangle'
    }
    return 'fa-times-circle'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">API Test Suite</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Test all Laravel API endpoints</p>
            </div>
            <button
              onClick={testAllEndpoints}
              disabled={testing}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {testing ? 'Testing...' : 'Test All Endpoints'}
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-4">
            {endpoints.map((endpoint) => {
              const result = results[endpoint.name]
              
              return (
                <div
                  key={endpoint.name}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {endpoint.method}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">{endpoint.name}</span>
                      {endpoint.auth && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          AUTH
                        </span>
                      )}
                    </div>
                    
                    {result && (
                      <div className="flex items-center space-x-2">
                        <i className={`fa ${getStatusIcon(result.status, result.statusCode)} ${getStatusColor(result.status, result.statusCode)}`}></i>
                        <span className={`text-sm font-medium ${getStatusColor(result.status, result.statusCode)}`}>
                          {result.statusCode}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                      {endpoint.method} {endpoint.url}
                    </code>
                  </div>

                  {result && (
                    <div className="mt-3">
                      <div className="text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Status: </span>
                        <span className={getStatusColor(result.status, result.statusCode)}>
                          {result.message}
                        </span>
                      </div>
                      
                      {result.data && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600">
                            Response Data
                          </summary>
                          <pre className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded text-xs overflow-x-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApiTestSuite