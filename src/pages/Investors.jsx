import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import api from '../services/api'

const Investors = () => {
  const [investors, setInvestors] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInvestor, setEditingInvestor] = useState(null)
  const [activeTab, setActiveTab] = useState('pitches')
  const [formData, setFormData] = useState({
    problem_opportunity: '',
    solution_technology: '',
    current_stage: '',
    unique_value_proposition: '',
    competitive_advantage: '',
    target_customer_segment: '',
    channels_strategies: '',
    revenue_streams: '',
    costs_expenditures: '',
    plan_24_month: '',
    why_applying: '',
    capital_required: '',
    investment_preferred: 'equity',
    equity_amount: '',
    debt_amount: '',
    equity_offered: ''
  })

  const investmentTypes = [
    { value: 'equity', label: 'Equity Investment', color: 'blue' },
    { value: 'debt', label: 'Debt Financing', color: 'green' },
    { value: 'hybrid', label: 'Hybrid (Equity + Debt)', color: 'purple' }
  ]

  const currentStages = [
    'Idea Stage',
    'Prototype Stage',
    'MVP Stage',
    'Early Revenue',
    'Growth Stage',
    'Expansion Stage'
  ]

  useEffect(() => {
    fetchInvestors()
    fetchStats()
  }, [])

  const fetchInvestors = async () => {
    try {
      const response = await api.get('/investors')
      setInvestors(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch investors:', error)
      setInvestors([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/investor-stats')
      setStats(response.data.data || {})
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      setStats({})
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingInvestor) {
        await api.put(`/investors/${editingInvestor.id}`, formData)
      } else {
        await api.post('/investors', formData)
      }
      setIsModalOpen(false)
      setEditingInvestor(null)
      resetForm()
      fetchInvestors()
      fetchStats()
    } catch (error) {
      console.error('Failed to save investor pitch:', error)
    }
  }

  const handleEdit = (investor) => {
    setEditingInvestor(investor)
    setFormData({
      problem_opportunity: investor.problem_opportunity || '',
      solution_technology: investor.solution_technology || '',
      current_stage: investor.current_stage || '',
      unique_value_proposition: investor.unique_value_proposition || '',
      competitive_advantage: investor.competitive_advantage || '',
      target_customer_segment: investor.target_customer_segment || '',
      channels_strategies: investor.channels_strategies || '',
      revenue_streams: investor.revenue_streams || '',
      costs_expenditures: investor.costs_expenditures || '',
      plan_24_month: investor.plan_24_month || '',
      why_applying: investor.why_applying || '',
      capital_required: investor.capital_required || '',
      investment_preferred: investor.investment_preferred || 'equity',
      equity_amount: investor.equity_amount || '',
      debt_amount: investor.debt_amount || '',
      equity_offered: investor.equity_offered || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (investorId) => {
    if (window.confirm('Are you sure you want to delete this investor pitch?')) {
      try {
        await api.delete(`/investors/${investorId}`)
        fetchInvestors()
        fetchStats()
      } catch (error) {
        console.error('Failed to delete investor pitch:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      problem_opportunity: '',
      solution_technology: '',
      current_stage: '',
      unique_value_proposition: '',
      competitive_advantage: '',
      target_customer_segment: '',
      channels_strategies: '',
      revenue_streams: '',
      costs_expenditures: '',
      plan_24_month: '',
      why_applying: '',
      capital_required: '',
      investment_preferred: 'equity',
      equity_amount: '',
      debt_amount: '',
      equity_offered: ''
    })
  }

  const openCreateModal = () => {
    resetForm()
    setEditingInvestor(null)
    setIsModalOpen(true)
  }

  const getInvestmentTypeConfig = (type) => {
    return investmentTypes.find(t => t.value === type) || investmentTypes[0]
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Investor Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage investor pitches and funding opportunities</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <i className="fa fa-plus"></i>
          <span>Create Pitch</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pitches</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPitches || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <i className="fa fa-chart-line text-white text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Capital</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalCapitalRequired || 0)}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <i className="fa fa-money-bill text-white text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Capital</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.avgCapitalRequired || 0)}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <i className="fa fa-calculator text-white text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Equity Pitches</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.equityPitches || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-500">
              <i className="fa fa-handshake text-white text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Investor Pitches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {investors.map((investor) => {
          const typeConfig = getInvestmentTypeConfig(investor.investment_preferred)
          return (
            <div key={investor.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      typeConfig.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                      typeConfig.color === 'green' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {typeConfig.label}
                    </span>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {investor.current_stage}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">By: {investor.creator_name}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(investor)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                  >
                    <i className="fa fa-edit"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(investor.id)}
                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Problem/Opportunity</h4>
                  <p className="text-sm text-gray-900 dark:text-white line-clamp-2">{investor.problem_opportunity}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Solution</h4>
                  <p className="text-sm text-gray-900 dark:text-white line-clamp-2">{investor.solution_technology}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Capital Required</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(investor.capital_required)}</p>
                  </div>
                  {investor.equity_offered && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Equity Offered</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{investor.equity_offered}%</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {investors.length === 0 && (
          <div className="col-span-full text-center py-12">
            <i className="fa fa-chart-line text-gray-400 text-4xl mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No investor pitches</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first investor pitch to get started.</p>
            <button
              onClick={openCreateModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Pitch
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Investor Modal */}
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
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all max-h-[90vh] overflow-y-auto">
                  <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {editingInvestor ? 'Edit Investor Pitch' : 'Create New Investor Pitch'}
                  </Dialog.Title>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Stage</label>
                        <select
                          required
                          value={formData.current_stage}
                          onChange={(e) => setFormData({...formData, current_stage: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select stage</option>
                          {currentStages.map((stage) => (
                            <option key={stage} value={stage}>{stage}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Investment Type</label>
                        <select
                          value={formData.investment_preferred}
                          onChange={(e) => setFormData({...formData, investment_preferred: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {investmentTypes.map((type) => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Problem/Opportunity</label>
                      <textarea
                        required
                        value={formData.problem_opportunity}
                        onChange={(e) => setFormData({...formData, problem_opportunity: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Describe the problem or opportunity your startup addresses"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Solution/Technology</label>
                      <textarea
                        required
                        value={formData.solution_technology}
                        onChange={(e) => setFormData({...formData, solution_technology: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Describe your solution and technology"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capital Required (₹)</label>
                        <input
                          type="number"
                          required
                          value={formData.capital_required}
                          onChange={(e) => setFormData({...formData, capital_required: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="1000000"
                        />
                      </div>

                      {formData.investment_preferred !== 'debt' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Equity Offered (%)</label>
                          <input
                            type="number"
                            value={formData.equity_offered}
                            onChange={(e) => setFormData({...formData, equity_offered: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="10"
                            min="0"
                            max="100"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Revenue Streams</label>
                        <input
                          type="text"
                          required
                          value={formData.revenue_streams}
                          onChange={(e) => setFormData({...formData, revenue_streams: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Subscription, Sales, etc."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unique Value Proposition</label>
                        <textarea
                          required
                          value={formData.unique_value_proposition}
                          onChange={(e) => setFormData({...formData, unique_value_proposition: e.target.value})}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="What makes your solution unique?"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Customer Segment</label>
                        <textarea
                          required
                          value={formData.target_customer_segment}
                          onChange={(e) => setFormData({...formData, target_customer_segment: e.target.value})}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Who are your target customers?"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">24-Month Plan</label>
                      <textarea
                        required
                        value={formData.plan_24_month}
                        onChange={(e) => setFormData({...formData, plan_24_month: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="What are your plans for the next 24 months?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Why Applying for Investment</label>
                      <textarea
                        required
                        value={formData.why_applying}
                        onChange={(e) => setFormData({...formData, why_applying: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Why are you seeking investment?"
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
                        {editingInvestor ? 'Update Pitch' : 'Create Pitch'}
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

export default Investors