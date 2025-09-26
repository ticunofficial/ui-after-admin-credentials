// Custom hook for API calls
import { useState, useEffect } from 'react'
import integrationService from '../services/integration'

export const useApi = (endpoint, options = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await integrationService[endpoint]?.(options.params)
        setData(result)
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (endpoint) {
      fetchData()
    }
  }, [endpoint, JSON.stringify(options.params)])

  return { data, loading, error, refetch: () => fetchData() }
}

export default useApi