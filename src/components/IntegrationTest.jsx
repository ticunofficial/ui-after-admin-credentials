import React, { useState } from 'react'
import integrationService from '../services/integration'

const IntegrationTest = () => {
  const [testResults, setTestResults] = useState({})
  const [loading, setLoading] = useState(false)

  const runTest = async (testName, testFunction) => {
    setLoading(true)
    try {
      const result = await testFunction()
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: true, data: result }
      }))
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: false, error: error.message }
      }))
    }
    setLoading(false)
  }

  const tests = [
    {
      name: 'Connection Test',
      fn: () => integrationService.testConnection()
    },
    {
      name: 'Dashboard Data',
      fn: () => integrationService.getDashboard()
    },
    {
      name: 'Users List',
      fn: () => integrationService.getUsers()
    }
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Laravel-React Integration Test</h2>
      
      <div className="grid gap-4">
        {tests.map(test => (
          <div key={test.name} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">{test.name}</h3>
              <button
                onClick={() => runTest(test.name, test.fn)}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test'}
              </button>
            </div>
            
            {testResults[test.name] && (
              <div className={`mt-2 p-3 rounded ${
                testResults[test.name].success 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {testResults[test.name].success ? (
                  <div>
                    <div className="font-medium">✅ Success</div>
                    <pre className="text-xs mt-1 overflow-auto">
                      {JSON.stringify(testResults[test.name].data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div>
                    <div className="font-medium">❌ Failed</div>
                    <div className="text-sm">{testResults[test.name].error}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h4 className="font-semibold mb-2">Integration Status</h4>
        <div className="text-sm">
          <div>API Base URL: {process.env.VITE_API_URL || 'http://admin.test/api'}</div>
          <div>Token: {localStorage.getItem('token') ? '✅ Present' : '❌ Missing'}</div>
        </div>
      </div>
    </div>
  )
}

export default IntegrationTest