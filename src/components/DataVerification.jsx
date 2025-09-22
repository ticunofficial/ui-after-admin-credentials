import { useState, useEffect } from 'react'
import api from '../services/api'

const DataVerification = () => {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(false)

  const dataChecks = [
    {
      name: 'Dashboard Data',
      endpoint: '/dashboard',
      expectedFields: ['userCount', 'roles', 'transactionCount', 'income'],
      description: 'Admin dashboard statistics'
    },
    {
      name: 'Users List',
      endpoint: '/users',
      expectedFields: ['data'],
      description: 'All users with roles'
    },
    {
      name: 'Roles List',
      endpoint: '/roles',
      expectedFields: ['data'],
      description: 'All roles with user counts'
    },
    {
      name: 'Permissions',
      endpoint: '/permissions',
      expectedFields: ['data'],
      description: 'Available permissions'
    },
    {
      name: 'User Profile',
      endpoint: '/profile',
      expectedFields: ['name', 'email'],
      description: 'Current user profile'
    },
    {
      name: 'Chat Users',
      endpoint: '/users-list',
      expectedFields: ['data'],
      description: 'Users available for chat'
    },
    {
      name: 'Conversations',
      endpoint: '/conversations',
      expectedFields: ['data'],
      description: 'Chat conversations'
    },
    {
      name: 'Transaction Stats',
      endpoint: '/transactions/stats',
      expectedFields: ['totalRevenue', 'monthlyRevenue'],
      description: 'Transaction statistics'
    },
    {
      name: 'Transactions List',
      endpoint: '/transactions',
      expectedFields: ['data'],
      description: 'All transactions'
    },
    {
      name: 'Settings',
      endpoint: '/settings',
      expectedFields: ['app_name', 'company_name'],
      description: 'Application settings'
    },
    {
      name: 'Products',
      endpoint: '/products',
      expectedFields: ['data'],
      description: 'Available products'
    }
  ]

  const checkData = async (check) => {
    try {
      const response = await api.get(check.endpoint)
      const data = response.data.data || response.data
      
      const hasExpectedFields = check.expectedFields.every(field => {
        return data && (data.hasOwnProperty(field) || (Array.isArray(data) && data.length > 0))
      })

      return {
        status: 'success',
        statusCode: response.status,
        hasData: !!data,
        dataCount: Array.isArray(data) ? data.length : Object.keys(data || {}).length,
        hasExpectedFields,
        sampleData: Array.isArray(data) ? data.slice(0, 2) : data,
        message: 'Data retrieved successfully'
      }
    } catch (error) {
      return {
        status: 'error',
        statusCode: error.response?.status || 0,
        hasData: false,
        dataCount: 0,
        hasExpectedFields: false,
        sampleData: null,
        message: error.message
      }
    }
  }

  const verifyAllData = async () => {
    setLoading(true)
    setResults({})
    
    for (const check of dataChecks) {
      const result = await checkData(check)
      setResults(prev => ({
        ...prev,
        [check.name]: result
      }))
    }
    
    setLoading(false)
  }

  const getStatusColor = (result) => {
    if (result.status === 'success' && result.hasData && result.hasExpectedFields) {
      return 'text-green-600'
    } else if (result.status === 'success' && result.hasData) {
      return 'text-yellow-600'
    }
    return 'text-red-600'
  }

  const getStatusIcon = (result) => {
    if (result.status === 'success' && result.hasData && result.hasExpectedFields) {
      return 'fa-check-circle'
    } else if (result.status === 'success' && result.hasData) {
      return 'fa-exclamation-triangle'
    }
    return 'fa-times-circle'
  }

  const getStatusText = (result) => {
    if (result.status === 'success' && result.hasData && result.hasExpectedFields) {
      return 'Complete'
    } else if (result.status === 'success' && result.hasData) {
      return 'Partial'
    }
    return 'Failed'
  }

  useEffect(() => {
    verifyAllData()
  }, [])

  const successCount = Object.values(results).filter(r => r.status === 'success' && r.hasData && r.hasExpectedFields).length
  const partialCount = Object.values(results).filter(r => r.status === 'success' && r.hasData && !r.hasExpectedFields).length
  const failedCount = Object.values(results).filter(r => r.status === 'error' || !r.hasData).length

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Verification</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Verify Laravel data is properly flowing to React</p>
            </div>
            <button
              onClick={verifyAllData}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Checking...' : 'Verify All Data'}
            </button>
          </div>
          
          {Object.keys(results).length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{successCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Complete</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{partialCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Partial</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{failedCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="grid gap-4">
            {dataChecks.map((check) => {
              const result = results[check.name]
              
              return (
                <div
                  key={check.name}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-900 dark:text-white">{check.name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{check.description}</span>
                    </div>
                    
                    {result && (
                      <div className="flex items-center space-x-2">
                        <i className={`fa ${getStatusIcon(result)} ${getStatusColor(result)}`}></i>
                        <span className={`text-sm font-medium ${getStatusColor(result)}`}>
                          {getStatusText(result)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                      GET {check.endpoint}
                    </code>
                  </div>

                  {result && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                        <span className={getStatusColor(result)}>{result.statusCode}</span>
                        
                        <span className="font-medium text-gray-700 dark:text-gray-300">Data Count:</span>
                        <span className="text-gray-900 dark:text-white">{result.dataCount}</span>
                        
                        <span className="font-medium text-gray-700 dark:text-gray-300">Expected Fields:</span>
                        <span className={result.hasExpectedFields ? 'text-green-600' : 'text-red-600'}>
                          {result.hasExpectedFields ? 'Present' : 'Missing'}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Expected: {check.expectedFields.join(', ')}
                      </div>
                      
                      {result.sampleData && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600">
                            Sample Data
                          </summary>
                          <pre className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded text-xs overflow-x-auto max-h-40">
                            {JSON.stringify(result.sampleData, null, 2)}
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

export default DataVerification