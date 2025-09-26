import React, { useState } from 'react'
import api from '../../services/api'

const PaymentForm = ({ productId }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePayment = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await api.post('/payment', { product_id: productId })
      
      if (response.data.success) {
        window.location.href = response.data.payment_url
      } else {
        setError(response.data.message || 'Payment failed')
      }
    } catch (err) {
      setError('Payment processing failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="payment-form">
      <form onSubmit={handlePayment}>
        <button 
          type="submit" 
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
        {error && <div className="alert alert-danger mt-2">{error}</div>}
      </form>
    </div>
  )
}

export default PaymentForm