import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import api from '../services/api'

const Payments = () => {
  const [orders, setOrders] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('orders')
  const [checkoutData, setCheckoutData] = useState({
    subscription_id: '',
    payment_method: 'card',
    user_id: 1
  })

  useEffect(() => {
    fetchOrders()
    fetchSubscriptions()
    fetchPaymentMethods()
    fetchStats()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders')
      setOrders(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/subscriptions')
      setSubscriptions(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error)
      setSubscriptions([])
    }
  }

  const fetchPaymentMethods = async () => {
    try {
      const response = await api.get('/payment/methods')
      setPaymentMethods(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch payment methods:', error)
      setPaymentMethods([])
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/payment-stats')
      setStats(response.data.data || {})
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      setStats({})
    }
  }

  const handleCheckout = async (subscriptionId) => {
    setCheckoutData({ ...checkoutData, subscription_id: subscriptionId })
    setIsCheckoutOpen(true)
  }

  const processPayment = async (e) => {
    e.preventDefault()
    try {
      // Create order
      const orderResponse = await api.post('/payment/create-order', checkoutData)
      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.message)
      }

      const { order_id } = orderResponse.data

      // Simulate payment processing
      setTimeout(async () => {
        try {
          const verifyResponse = await api.post('/payment/verify', { order_id })
          if (verifyResponse.data.success) {
            setIsCheckoutOpen(false)
            fetchOrders()
            fetchStats()
            alert('Payment successful!')
          }
        } catch (error) {
          console.error('Payment verification failed:', error)
          alert('Payment verification failed!')
        }
      }, 2000)

      alert('Processing payment...')
    } catch (error) {
      console.error('Payment failed:', error)
      alert('Payment failed: ' + error.message)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="h-12 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage payments and subscriptions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOrders || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <i className="fa fa-shopping-cart text-white text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedOrders || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <i className="fa fa-check-circle text-white text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{(stats.totalRevenue || 0).toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <i className="fa fa-rupee-sign text-white text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{(stats.monthlyRevenue || 0).toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-500">
              <i className="fa fa-calendar-alt text-white text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'orders'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'subscriptions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Available Plans ({subscriptions.length})
          </button>
        </nav>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subscription</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{order.order_id}</div>
                      {order.payment_id && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">Payment: {order.payment_id}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{order.user_name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{order.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{order.subscription_name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">₹{order.amount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {orders.length === 0 && (
            <div className="text-center py-12">
              <i className="fa fa-shopping-cart text-gray-400 text-4xl mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No orders found</h3>
              <p className="text-gray-500 dark:text-gray-400">Orders will appear here once customers make purchases.</p>
            </div>
          )}
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((subscription) => (
            <div key={subscription.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{subscription.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{subscription.description}</p>
                <div className="text-3xl font-bold text-blue-600 mb-4">
                  ₹{subscription.price}
                  <span className="text-sm font-normal text-gray-500">/month</span>
                </div>
                <button
                  onClick={() => handleCheckout(subscription.id)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Subscribe Now
                </button>
              </div>
            </div>
          ))}

          {subscriptions.length === 0 && (
            <div className="col-span-full text-center py-12">
              <i className="fa fa-crown text-gray-400 text-4xl mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No subscription plans</h3>
              <p className="text-gray-500 dark:text-gray-400">Create subscription plans to start accepting payments.</p>
            </div>
          )}
        </div>
      )}

      {/* Checkout Modal */}
      <Transition appear show={isCheckoutOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsCheckoutOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Complete Payment
                  </Dialog.Title>

                  <form onSubmit={processPayment} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subscription Plan</label>
                      <select
                        required
                        value={checkoutData.subscription_id}
                        onChange={(e) => setCheckoutData({...checkoutData, subscription_id: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select subscription</option>
                        {subscriptions.map((sub) => (
                          <option key={sub.id} value={sub.id}>{sub.name} - ₹{sub.price}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Method</label>
                      <div className="space-y-2">
                        {paymentMethods.map((method) => (
                          <label key={method.id} className="flex items-center">
                            <input
                              type="radio"
                              name="payment_method"
                              value={method.id}
                              checked={checkoutData.payment_method === method.id}
                              onChange={(e) => setCheckoutData({...checkoutData, payment_method: e.target.value})}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                              <i className={`fa ${method.icon} mr-2`}></i>
                              {method.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Amount:</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          ₹{subscriptions.find(s => s.id == checkoutData.subscription_id)?.price || 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsCheckoutOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Pay Now
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

export default Payments