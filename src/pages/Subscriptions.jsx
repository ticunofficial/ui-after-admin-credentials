import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import api from '../services/api'

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([])
  const [userSubscriptions, setUserSubscriptions] = useState([])
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUserSubModalOpen, setIsUserSubModalOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState(null)
  const [activeTab, setActiveTab] = useState('plans')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: ''
  })
  const [userSubFormData, setUserSubFormData] = useState({
    user_id: '',
    subscription_plan_id: '',
    plan_amount: '',
    starts_at: new Date().toISOString().split('T')[0],
    ends_at: '',
    status: 1
  })

  useEffect(() => {
    fetchSubscriptions()
    fetchUserSubscriptions()
    fetchUsers()
    fetchStats()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/subscriptions')
      const data = response.data.data || []
      setSubscriptions(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error)
      setSubscriptions([])
    } finally {
      setLoading(false)
    }
  }

  const fetchUserSubscriptions = async () => {
    try {
      const response = await api.get('/user-subscriptions')
      const data = response.data.data || []
      setUserSubscriptions(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch user subscriptions:', error)
      setUserSubscriptions([])
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users')
      const data = response.data.data || []
      setUsers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setUsers([])
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/subscription-stats')
      const data = response.data.data || {}
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      setStats({})
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingSubscription) {
        await api.put(`/subscriptions/${editingSubscription.id}`, formData)
      } else {
        await api.post('/subscriptions', formData)
      }
      setIsModalOpen(false)
      setEditingSubscription(null)
      resetForm()
      fetchSubscriptions()
    } catch (error) {
      console.error('Failed to save subscription:', error)
    }
  }

  const handleEdit = (subscription) => {
    setEditingSubscription(subscription)
    setFormData({
      name: subscription.name,
      description: subscription.description || '',
      price: subscription.price
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (subscriptionId, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await api.delete(`/subscriptions/${subscriptionId}`)
        fetchSubscriptions()
      } catch (error) {
        console.error('Failed to delete subscription:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: ''
    })
  }

  const resetUserSubForm = () => {
    setUserSubFormData({
      user_id: '',
      subscription_plan_id: '',
      plan_amount: '',
      starts_at: new Date().toISOString().split('T')[0],
      ends_at: '',
      status: 1
    })
  }

  const handleUserSubSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/user-subscriptions', userSubFormData)
      setIsUserSubModalOpen(false)
      resetUserSubForm()
      fetchUserSubscriptions()
      fetchStats()
    } catch (error) {
      console.error('Failed to create user subscription:', error)
    }
  }

  const toggleSubscriptionStatus = async (subscriptionId, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1
      await api.put(`/user-subscriptions/${subscriptionId}/status`, { status: newStatus })
      fetchUserSubscriptions()
      fetchStats()
    } catch (error) {
      console.error('Failed to toggle subscription status:', error)
    }
  }

  const openUserSubModal = () => {
    resetUserSubForm()
    setIsUserSubModalOpen(true)
  }

  const openCreateModal = () => {
    resetForm()
    setEditingSubscription(null)
    setIsModalOpen(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 1: return 'bg-green-100 text-green-800'
      case 0: return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-red-100 text-red-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 1: return 'Active'
      case 0: return 'Pending'
      default: return 'Inactive'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Subscription Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage subscription plans and user subscriptions</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={openUserSubModal}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <i className="fa fa-user-plus"></i>
            <span>Assign Subscription</span>
          </button>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <i className="fa fa-plus"></i>
            <span>Add Plan</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Plans</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPlans || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <i className="fa fa-list text-white text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeSubscriptions || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <i className="fa fa-users text-white text-xl"></i>
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
              <i className="fa fa-chart-line text-white text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('plans')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'plans'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Subscription Plans ({subscriptions.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            User Subscriptions ({userSubscriptions.length})
          </button>
        </nav>
      </div>

      {/* Subscription Plans Tab */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((subscription) => (
            <div key={subscription.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{subscription.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subscription.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(subscription)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                  >
                    <i className="fa fa-edit"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(subscription.id, subscription.name)}
                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Price</span>
                  <span className="text-lg font-bold text-green-600">₹{subscription.price}</span>
                </div>
                
                <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}

          {subscriptions.length === 0 && (
            <div className="col-span-full text-center py-12">
              <i className="fa fa-credit-card text-gray-400 text-4xl mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No subscription plans</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first subscription plan to get started.</p>
              <button
                onClick={openCreateModal}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Plan
              </button>
            </div>
          )}
        </div>
      )}

      {/* User Subscriptions Tab */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {userSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{subscription.user_name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{subscription.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{subscription.plan_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">₹{subscription.plan_amount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleSubscriptionStatus(subscription.id, subscription.status)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors ${getStatusColor(subscription.status)} hover:opacity-80`}
                        title={`Click to ${subscription.status === 1 ? 'deactivate' : 'activate'} subscription`}
                      >
                        {getStatusText(subscription.status)}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div>{new Date(subscription.starts_at).toLocaleDateString()} - {new Date(subscription.ends_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleSubscriptionStatus(subscription.id, subscription.status)}
                          className={`p-1 rounded hover:bg-gray-50 ${
                            subscription.status === 1 ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                          }`}
                          title={subscription.status === 1 ? 'Deactivate' : 'Activate'}
                        >
                          <i className={`fa ${subscription.status === 1 ? 'fa-pause' : 'fa-play'}`}></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {userSubscriptions.length === 0 && (
            <div className="text-center py-12">
              <i className="fa fa-users text-gray-400 text-4xl mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No user subscriptions</h3>
              <p className="text-gray-500 dark:text-gray-400">User subscriptions will appear here once users subscribe to plans.</p>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
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
                    {editingSubscription ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
                  </Dialog.Title>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Basic Plan, Premium Plan"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Describe the features and benefits of this plan"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {editingSubscription ? 'Update Plan' : 'Create Plan'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Assign User Subscription Modal */}
      <Transition appear show={isUserSubModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsUserSubModalOpen(false)}>
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
                    Assign Subscription to User
                  </Dialog.Title>

                  <form onSubmit={handleUserSubSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select User</label>
                      <select
                        required
                        value={userSubFormData.user_id}
                        onChange={(e) => setUserSubFormData({...userSubFormData, user_id: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Choose a user</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Plan</label>
                      <select
                        required
                        value={userSubFormData.subscription_plan_id}
                        onChange={(e) => {
                          const selectedPlan = subscriptions.find(s => s.id == e.target.value)
                          setUserSubFormData({
                            ...userSubFormData, 
                            subscription_plan_id: e.target.value,
                            plan_amount: selectedPlan ? selectedPlan.price : ''
                          })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Choose a plan</option>
                        {subscriptions.map(plan => (
                          <option key={plan.id} value={plan.id}>{plan.name} - ₹{plan.price}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={userSubFormData.plan_amount}
                        onChange={(e) => setUserSubFormData({...userSubFormData, plan_amount: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                        <input
                          type="date"
                          required
                          value={userSubFormData.starts_at}
                          onChange={(e) => setUserSubFormData({...userSubFormData, starts_at: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                        <input
                          type="date"
                          required
                          value={userSubFormData.ends_at}
                          onChange={(e) => setUserSubFormData({...userSubFormData, ends_at: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                      <select
                        value={userSubFormData.status}
                        onChange={(e) => setUserSubFormData({...userSubFormData, status: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={1}>Active</option>
                        <option value={0}>Pending</option>
                        <option value={-1}>Inactive</option>
                      </select>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsUserSubModalOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Assign Subscription
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

export default Subscriptions