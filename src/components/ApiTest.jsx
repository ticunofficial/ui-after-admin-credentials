import { useState, useEffect } from 'react'
import api from '../services/api'

function ApiTest() {
  const [status, setStatus] = useState('Testing...')
  const [products, setProducts] = useState([])

  useEffect(() => {
    testApiConnection()
  }, [])

  const testApiConnection = async () => {
    try {
      // Test basic API connection
      const response = await api.get('/test')
      setStatus('✅ API Connected Successfully')
      setProducts([response.data]) // Wrap in array for display
    } catch (error) {
      setStatus(`❌ API Connection Failed: ${error.message}`)
      console.error('API Error:', error)
    }
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Laravel API Connection Test</h2>
      <p className="mb-4 text-gray-700 dark:text-gray-300">{status}</p>
      
      {products.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Response from API:</h3>
          <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600">
            {JSON.stringify(products[0], null, 2)}
          </pre>
        </div>
      )}
      
      <button 
        onClick={testApiConnection}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Test Again
      </button>
    </div>
  )
}

export default ApiTest