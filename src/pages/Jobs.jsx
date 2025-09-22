import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import api from '../services/api'

const Jobs = () => {
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [activeTab, setActiveTab] = useState('jobs')
  const [formData, setFormData] = useState({
    job_post: '',
    email: '',
    company_name: '',
    job_type: [],
    doj: '',
    apply_by: '',
    salary: '',
    hiring_from: '',
    about_company: '',
    about_job: '',
    who_can_apply: '',
    skill_required: '',
    add_perks_of_job: ''
  })

  const jobTypes = [
    { value: 'internship', label: 'Internship' },
    { value: 'work_from_home', label: 'Work From Home' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'full_time', label: 'Full Time' }
  ]

  useEffect(() => {
    fetchJobs()
    fetchApplications()
    fetchStats()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs')
      const data = response.data.data || []
      setJobs(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async () => {
    try {
      const response = await api.get('/job-applications')
      const data = response.data.data || []
      setApplications(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch applications:', error)
      setApplications([])
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/job-stats')
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
      if (editingJob) {
        await api.put(`/jobs/${editingJob.id}`, formData)
      } else {
        await api.post('/jobs', formData)
      }
      setIsModalOpen(false)
      setEditingJob(null)
      resetForm()
      fetchJobs()
      fetchStats()
    } catch (error) {
      console.error('Failed to save job:', error)
    }
  }

  const handleEdit = (job) => {
    setEditingJob(job)
    let jobTypes = []
    try {
      jobTypes = JSON.parse(job.job_type || '[]')
      if (!Array.isArray(jobTypes)) jobTypes = []
    } catch {
      jobTypes = []
    }
    
    setFormData({
      job_post: job.job_post || '',
      email: job.email || '',
      company_name: job.company_name || '',
      job_type: jobTypes,
      doj: job.doj || '',
      apply_by: job.apply_by || '',
      salary: job.salary || '',
      hiring_from: job.hiring_from || '',
      about_company: job.about_company || '',
      about_job: job.about_job || '',
      who_can_apply: job.who_can_apply || '',
      skill_required: job.skill_required || '',
      add_perks_of_job: job.add_perks_of_job || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (jobId, jobTitle) => {
    if (window.confirm(`Are you sure you want to delete "${jobTitle}"?`)) {
      try {
        await api.delete(`/jobs/${jobId}`)
        fetchJobs()
        fetchStats()
      } catch (error) {
        console.error('Failed to delete job:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      job_post: '',
      email: '',
      company_name: '',
      job_type: [],
      doj: '',
      apply_by: '',
      salary: '',
      hiring_from: '',
      about_company: '',
      about_job: '',
      who_can_apply: '',
      skill_required: '',
      add_perks_of_job: ''
    })
  }

  const openCreateModal = () => {
    resetForm()
    setEditingJob(null)
    setIsModalOpen(true)
  }

  const toggleJobType = (type) => {
    setFormData(prev => ({
      ...prev,
      job_type: prev.job_type.includes(type)
        ? prev.job_type.filter(t => t !== type)
        : [...prev.job_type, type]
    }))
  }

  const isJobExpired = (applyBy) => {
    return new Date(applyBy) < new Date()
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Job Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage job postings and applications</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <i className="fa fa-plus"></i>
          <span>Post Job</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalJobs || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <i className="fa fa-briefcase text-white text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Jobs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeJobs || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <i className="fa fa-check-circle text-white text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Applications</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalApplications || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <i className="fa fa-users text-white text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expired Jobs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.expiredJobs || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-500">
              <i className="fa fa-times-circle text-white text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'jobs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Job Postings ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'applications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Applications ({applications.length})
          </button>
        </nav>
      </div>

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{job.job_post}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{job.company_name}</p>
                  <div className="flex items-center mt-2">
                    {isJobExpired(job.apply_by) ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Expired
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                    <span className="ml-2 text-xs text-gray-500">{job.applications_count} applications</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(job)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                  >
                    <i className="fa fa-edit"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(job.id, job.job_post)}
                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Salary:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{job.salary}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Apply by:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{new Date(job.apply_by).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Location:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{job.hiring_from}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1">
                {(() => {
                  try {
                    const jobTypes = JSON.parse(job.job_type || '[]')
                    const typeLabels = {
                      'internship': 'Internship',
                      'work_from_home': 'Work From Home', 
                      'part_time': 'Part Time',
                      'full_time': 'Full Time'
                    }
                    return Array.isArray(jobTypes) ? jobTypes.map((type, index) => (
                      <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {typeLabels[type] || type}
                      </span>
                    )) : []
                  } catch {
                    return []
                  }
                })()}
              </div>
            </div>
          ))}

          {jobs.length === 0 && (
            <div className="col-span-full text-center py-12">
              <i className="fa fa-briefcase text-gray-400 text-4xl mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No jobs posted</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first job posting to get started.</p>
              <button
                onClick={openCreateModal}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Post Job
              </button>
            </div>
          )}
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Job</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Experience</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Notice Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Applied Date</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {applications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{application.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{application.email}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{application.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{application.job_title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{application.company_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{application.experience}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{application.notice_period}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(application.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {applications.length === 0 && (
            <div className="text-center py-12">
              <i className="fa fa-users text-gray-400 text-4xl mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No applications yet</h3>
              <p className="text-gray-500 dark:text-gray-400">Job applications will appear here once users apply.</p>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Job Modal */}
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
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all max-h-[90vh] overflow-y-auto">
                  <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}
                  </Dialog.Title>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title</label>
                        <input
                          type="text"
                          required
                          value={formData.job_post}
                          onChange={(e) => setFormData({...formData, job_post: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., Senior Software Engineer"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
                        <input
                          type="text"
                          required
                          value={formData.company_name}
                          onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Company name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="contact@company.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Salary</label>
                        <input
                          type="text"
                          required
                          value={formData.salary}
                          onChange={(e) => setFormData({...formData, salary: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., ₹5-8 LPA"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job Type</label>
                      <div className="flex flex-wrap gap-2">
                        {jobTypes.map((type) => (
                          <label key={type.value} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.job_type.includes(type.value)}
                              onChange={() => toggleJobType(type.value)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{type.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Joining</label>
                        <input
                          type="text"
                          required
                          value={formData.doj}
                          onChange={(e) => setFormData({...formData, doj: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Immediate/1 month"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apply By</label>
                        <input
                          type="date"
                          required
                          value={formData.apply_by}
                          onChange={(e) => setFormData({...formData, apply_by: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                        <input
                          type="text"
                          required
                          value={formData.hiring_from}
                          onChange={(e) => setFormData({...formData, hiring_from: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="City, State"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">About Company</label>
                      <textarea
                        required
                        value={formData.about_company}
                        onChange={(e) => setFormData({...formData, about_company: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Brief description about the company"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Description</label>
                      <textarea
                        required
                        value={formData.about_job}
                        onChange={(e) => setFormData({...formData, about_job: e.target.value})}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Detailed job description and responsibilities"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Who Can Apply</label>
                        <input
                          type="text"
                          required
                          value={formData.who_can_apply}
                          onChange={(e) => setFormData({...formData, who_can_apply: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., Fresh graduates, 2+ years exp"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skills Required</label>
                        <input
                          type="text"
                          required
                          value={formData.skill_required}
                          onChange={(e) => setFormData({...formData, skill_required: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., React, Node.js, Python"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Perks</label>
                      <input
                        type="text"
                        required
                        value={formData.add_perks_of_job}
                        onChange={(e) => setFormData({...formData, add_perks_of_job: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Health insurance, Flexible hours, Remote work"
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
                        {editingJob ? 'Update Job' : 'Post Job'}
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

export default Jobs