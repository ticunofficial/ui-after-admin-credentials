import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import api from '../services/api'

const Transactions = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    dateRange: 'all',
    search: ''
  })
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalTransactions: 0,
    successfulTransactions: 0,
    failedTransactions: 0,
    pendingTransactions: 0
  })
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })

  useEffect(() => {
    fetchTransactions()
    fetchStats()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions')
      const transactionData = response.data.data || response.data.transactions || []
      setTransactions(Array.isArray(transactionData) ? transactionData : [])
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/transactions/stats')
      const statsData = response.data.data || response.data || {}
      setStats({
        totalRevenue: statsData.totalRevenue || 0,
        monthlyRevenue: statsData.monthlyRevenue || 0,
        totalTransactions: statsData.totalTransactions || 0,
        successfulTransactions: statsData.successfulTransactions || 0,
        failedTransactions: statsData.failedTransactions || 0,
        pendingTransactions: statsData.pendingTransactions || 0
      })
    } catch (error) {
      console.error('Failed to fetch transaction stats:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'subscription':
        return 'fa-crown'
      case 'product':
        return 'fa-shopping-bag'
      case 'meeting':
        return 'fa-video'
      default:
        return 'fa-credit-card'
    }
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000)
  }
  
  const exportTransactions = async () => {
    try {
      const response = await api.get('/transactions/export', {
        params: filters,
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      showNotification('Transactions exported successfully!')
    } catch (error) {
      console.error('Failed to export transactions:', error)
      showNotification('Failed to export transactions', 'error')
    }
  }
  
  const updateTransactionStatus = async () => {
    try {
      await api.patch(`/transactions/${selectedTransaction.id}/status`, { status: newStatus })
      fetchTransactions()
      fetchStats()
      setIsStatusModalOpen(false)
      showNotification('Transaction status updated successfully!')
    } catch (error) {
      console.error('Failed to update transaction status:', error)
      showNotification('Failed to update transaction status', 'error')
    }
  }
  
  const openStatusModal = (transaction, status) => {
    setSelectedTransaction(transaction)
    setNewStatus(status)
    setIsStatusModalOpen(true)
  }
  
  const viewTransactionDetails = async (transaction) => {
    try {
      const response = await api.get(`/transactions/${transaction.id}/receipt`)
      if (response.data.success) {
        setSelectedTransaction(response.data.data)
        setIsDetailsModalOpen(true)
      }
    } catch (error) {
      console.error('Failed to fetch transaction details:', error)
      showNotification('Failed to fetch transaction details', 'error')
    }
  }
  
  const refreshData = () => {
    setLoading(true)
    fetchTransactions()
    fetchStats()
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = !filters.search || 
      transaction.user_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      transaction.ref?.toLowerCase().includes(filters.search.toLowerCase()) ||
      transaction.id?.toString().includes(filters.search)
    
    const matchesStatus = filters.status === 'all' || transaction.status?.toLowerCase() === filters.status.toLowerCase()
    
    const matchesType = filters.type === 'all' || (
      (filters.type === 'subscription' && transaction.subscription_plan_id) ||
      (filters.type === 'product' && !transaction.subscription_plan_id) ||
      (filters.type === 'meeting' && transaction.ref?.includes('meeting'))
    )
    
    const matchesDate = filters.dateRange === 'all' || (() => {
      const transactionDate = new Date(transaction.created_at)
      const now = new Date()
      
      switch (filters.dateRange) {
        case 'today':
          return transactionDate.toDateString() === now.toDateString()
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return transactionDate >= weekAgo
        case 'month':
          return transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear()
        case 'year':
          return transactionDate.getFullYear() === now.getFullYear()
        default:
          return true
      }
    })()
    
    return matchesSearch && matchesStatus && matchesType && matchesDate
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Monitor and manage all payment transactions</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={refreshData}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <i className="fa fa-refresh"></i>
            <span>Refresh</span>
          </button>
          <button
            onClick={exportTransactions}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <i className="fa fa-download"></i>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{stats.totalRevenue?.toLocaleString()}</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">All time</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <i className="fa fa-rupee-sign text-white text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{stats.monthlyRevenue?.toLocaleString()}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">This month</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <i className="fa fa-chart-line text-white text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Successful</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.successfulTransactions?.toLocaleString()}</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">Completed</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <i className="fa fa-check-circle text-white text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.failedTransactions?.toLocaleString()}</p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">Unsuccessful</p>
            </div>
            <div className="p-3 rounded-lg bg-red-500">
              <i className="fa fa-times-circle text-white text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="successful">Successful</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="subscription">Subscription</option>
              <option value="product">Product</option>
              <option value="meeting">Meeting</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>

          <div className="flex items-end space-x-2">
            <button
              onClick={() => setFilters({ status: 'all', type: 'all', dateRange: 'all', search: '' })}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <i className="fa fa-times mr-2"></i>
              Clear
            </button>
            <button
              onClick={refreshData}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i className="fa fa-search mr-2"></i>
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Transaction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product/Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 mr-3`}>
                        <i className={`fa ${getTypeIcon(transaction.type)} text-gray-600 dark:text-gray-400`}></i>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{transaction.transaction_id}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{transaction.payment_method}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-8 w-8 rounded-full mr-3"
                        src={transaction.user_photo || '/assets/images/avatar.png'}
                        alt={transaction.user_name}
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{transaction.user_name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{transaction.user_email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{transaction.product_name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{transaction.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">₹{transaction.amount?.toLocaleString()}</div>
                    {transaction.currency && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">{transaction.currency}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div>{new Date(transaction.created_at).toLocaleDateString()}</div>
                    <div>{new Date(transaction.created_at).toLocaleTimeString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => viewTransactionDetails(transaction)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="View Details"
                      >
                        <i className="fa fa-eye"></i>
                      </button>
                      {transaction.status === 'pending' && (
                        <>
                          <button
                            onClick={() => openStatusModal(transaction, 'successful')}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Mark as Successful"
                          >
                            <i className="fa fa-check"></i>
                          </button>
                          <button
                            onClick={() => openStatusModal(transaction, 'failed')}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Mark as Failed"
                          >
                            <i className="fa fa-times"></i>
                          </button>
                        </>
                      )}
                      {transaction.status === 'successful' && (
                        <button
                          onClick={() => viewTransactionDetails(transaction)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="View Receipt"
                        >
                          <i className="fa fa-download"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <i className="fa fa-credit-card text-gray-400 text-4xl mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No transactions found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
      
      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            <i className={`fa ${
              notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'
            }`}></i>
            <span>{notification.message}</span>
          </div>
        </div>
      )}
      
      {/* Transaction Details Modal */}
      <Transition appear show={isDetailsModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsDetailsModalOpen(false)}>
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
                    Transaction Details
                  </Dialog.Title>
                  
                  {selectedTransaction && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Transaction ID</p>
                          <p className="font-medium text-gray-900 dark:text-white">{selectedTransaction.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTransaction.status)}`}>
                            {selectedTransaction.status}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedTransaction.user_name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{selectedTransaction.user_email}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                          <p className="font-medium text-gray-900 dark:text-white">₹{selectedTransaction.amount?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                          <p className="font-medium text-gray-900 dark:text-white">{new Date(selectedTransaction.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      {selectedTransaction.subscription_name && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Subscription</p>
                          <p className="font-medium text-gray-900 dark:text-white">{selectedTransaction.subscription_name}</p>
                        </div>
                      )}
                      
                      {selectedTransaction.ref && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Reference</p>
                          <p className="font-medium text-gray-900 dark:text-white">{selectedTransaction.ref}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setIsDetailsModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      
      {/* Status Update Modal */}
      <Transition appear show={isStatusModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsStatusModalOpen(false)}>
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
                    Update Transaction Status
                  </Dialog.Title>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Are you sure you want to mark this transaction as <strong>{newStatus}</strong>?
                  </p>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setIsStatusModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={updateTransactionStatus}
                      className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                        newStatus === 'successful' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      Confirm
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

export default Transactions