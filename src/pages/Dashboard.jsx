import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    monthlyRevenue: 0,
    totalTransactions: 0,
    subscriptions: 0,
    meetings: 0,
    roles: []
  })
  const [chartData, setChartData] = useState({
    userGrowth: [],
    revenueChart: [],
    transactionStats: { successful: 0, failed: 0, pending: 0 }
  })
  const [timeRange, setTimeRange] = useState('7d')
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchDashboardData()
  }, [])
  
  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, transactionStatsRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/transactions/stats')
      ])
      
      const data = dashboardRes.data.data
      const transactionData = transactionStatsRes.data.data
      
      if (data.userCount !== undefined) {
        setStats({
          totalUsers: data.userCount,
          activeUsers: data.activeUsers || data.userCount,
          monthlyRevenue: data.monthlyIncome || data.income || 0,
          totalTransactions: data.transactionCount || 0,
          subscriptions: data.subscriptions || 0,
          meetings: data.meetings || 0,
          roles: data.roles || stats.roles,
          recentUsers: data.recentUsers || [],
          recentTransactions: data.recentTransactions || []
        })
        
        // Generate mock chart data for demonstration
        setChartData({
          userGrowth: generateUserGrowthData(),
          revenueChart: generateRevenueData(),
          transactionStats: {
            successful: transactionData?.successfulTransactions || 0,
            failed: transactionData?.failedTransactions || 0,
            pending: transactionData?.pendingTransactions || 0
          }
        })
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const generateUserGrowthData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      users: Math.floor(Math.random() * 50) + 20 + i * 2
    }))
  }
  
  const generateRevenueData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    return months.map(month => ({
      month,
      revenue: Math.floor(Math.random() * 50000) + 10000
    }))
  }

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: 'fa-users', color: 'blue' },
    { title: 'Active Users', value: stats.activeUsers.toLocaleString(), icon: 'fa-user-check', color: 'green' },
    { title: 'Monthly Revenue', value: `₹${stats.monthlyRevenue.toLocaleString()}`, icon: 'fa-rupee-sign', color: 'purple' },
    { title: 'Transactions', value: stats.totalTransactions.toLocaleString(), icon: 'fa-credit-card', color: 'orange' }
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow border">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Welcome back, {user?.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg transition-transform group-hover:scale-110 ${
                  stat.color === 'blue' ? 'bg-blue-100' :
                  stat.color === 'green' ? 'bg-green-100' :
                  stat.color === 'purple' ? 'bg-purple-100' : 'bg-orange-100'
                }`}>
                  <i className={`fa ${stat.icon} text-xl ${
                    stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'purple' ? 'text-purple-600' : 'text-orange-600'
                  }`}></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{stat.value}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <i className="fa fa-arrow-up text-xs mr-1"></i>
                  <span>+12%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">vs last month</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* User Growth Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Growth</h3>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between space-x-2">
            {chartData.userGrowth.slice(-10).map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600 cursor-pointer"
                  style={{ height: `${(item.users / Math.max(...chartData.userGrowth.map(d => d.users))) * 200}px` }}
                  title={`${item.users} users`}
                ></div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 transform -rotate-45 origin-left">
                  {item.date.split('/').slice(0, 2).join('/')}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Transaction Status Pie Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transaction Status</h3>
          <div className="flex items-center justify-center h-48">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200 dark:text-gray-600"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-green-500"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${(chartData.transactionStats.successful / (chartData.transactionStats.successful + chartData.transactionStats.failed + chartData.transactionStats.pending)) * 100}, 100`}
                  strokeLinecap="round"
                  fill="transparent"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {Math.round((chartData.transactionStats.successful / (chartData.transactionStats.successful + chartData.transactionStats.failed + chartData.transactionStats.pending)) * 100) || 0}%
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Successful</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{chartData.transactionStats.successful}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Failed</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{chartData.transactionStats.failed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{chartData.transactionStats.pending}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Revenue Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Revenue</h3>
        <div className="h-64 flex items-end justify-between space-x-4">
          {chartData.revenueChart.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t transition-all hover:from-purple-600 hover:to-purple-500 cursor-pointer"
                style={{ height: `${(item.revenue / Math.max(...chartData.revenueChart.map(d => d.revenue))) * 200}px` }}
                title={`₹${item.revenue.toLocaleString()}`}
              ></div>
              <span className="text-sm text-gray-600 dark:text-gray-400 mt-2">{item.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Roles */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Roles</h3>
          <div className="space-y-3">
            {stats.roles.map((role, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{role.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{role.users_count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            <button 
              onClick={() => window.location.href = '/app/transactions'}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {stats.recentUsers?.map((user, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                  <i className="fa fa-user-plus text-sm text-blue-600 dark:text-blue-400"></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name} registered</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(user.created_at).toLocaleString()}</p>
                </div>
              </div>
            )) || []}
            {stats.recentTransactions?.map((transaction, index) => (
              <div key={`tx-${index}`} className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                  <i className="fa fa-credit-card text-sm text-green-600 dark:text-green-400"></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Payment received ₹{transaction.amount}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(transaction.created_at).toLocaleString()}</p>
                </div>
              </div>
            )) || []}
          </div>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Add User', icon: 'fa-user-plus', href: '/app/users', color: 'blue' },
            { name: 'Manage Roles', icon: 'fa-users-cog', href: '/app/roles', color: 'purple' },
            { name: 'Transactions', icon: 'fa-credit-card', href: '/app/transactions', color: 'green' },
            { name: 'Settings', icon: 'fa-cog', href: '/app/settings', color: 'gray' }
          ].map((action, index) => (
            <button
              key={index}
              onClick={() => window.location.href = action.href}
              className="group p-4 text-center border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md hover:border-blue-200 dark:hover:border-blue-400 transition-all bg-white dark:bg-gray-700"
            >
              <div className={`w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${
                action.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' :
                action.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900' :
                action.color === 'green' ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-600'
              }`}>
                <i className={`fa ${action.icon} text-lg ${
                  action.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                  action.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                  action.color === 'green' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'
                }`}></i>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{action.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard