import { useState, useEffect, Fragment, useRef } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import api from '../services/api'

const JobApplications = () => {
  const [applications, setApplications] = useState([])
  const [jobs, setJobs] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingApplication, setEditingApplication] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    job_id: '',
    name: '',
    email: '',
    phone: '',
    experience: '',
    notice_period: '',
    current_job: '',
    resume: ''
  })
  const resumeInputRef = useRef(null)

  useEffect(() => {
    fetchApplications()
    fetchJobs()
    fetchStats()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await api.get('/job-applications')
      setApplications(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch applications:', error)
      setApplications([])
    } finally {
      setLoading(false)
    }
  }

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs')
      setJobs(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
      setJobs([])
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/job-applications-stats')
      setStats(response.data.data || {})
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      setStats({})
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingApplication) {
        await api.put(`/job-applications/${editingApplication.id}`, formData)
        alert('Application updated successfully!')
      } else {
        await api.post('/job-applications', formData)
        alert('Application submitted successfully!')
      }
      setIsModalOpen(false)
      setEditingApplication(null)
      resetForm()
      fetchApplications()
      fetchStats()
    } catch (error) {
      console.error('Failed to save application:', error)
      alert('Failed to save application: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleEdit = (application) => {
    setEditingApplication(application)
    setFormData({
      job_id: application.job_id || '',
      name: application.name || '',
      email: application.email || '',
      phone: application.phone || '',
      experience: application.experience || '',
      notice_period: application.notice_period || '',
      current_job: application.current_job || '',
      resume: application.resume || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (applicationId, applicantName) => {
    if (window.confirm(`Are you sure you want to delete ${applicantName}'s application?`)) {
      try {
        await api.delete(`/job-applications/${applicationId}`)
        fetchApplications()
        fetchStats()
        alert('Application deleted successfully!')
      } catch (error) {
        console.error('Failed to delete application:', error)
        alert('Failed to delete application')
      }
    }
  }

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a PDF, DOC, or DOCX file')
      event.target.value = ''
      return
    }
    
    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB')
      event.target.value = ''
      return
    }
    
    setUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('resume', file)
      
      const response = await api.post('/job-applications/upload-resume', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      if (response.data.success) {
        setFormData({...formData, resume: response.data.resume_url})
        alert('Resume uploaded successfully!')
      }
    } catch (error) {
      console.error('Failed to upload resume:', error)
      alert('Failed to upload resume: ' + (error.response?.data?.message || error.message))
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const resetForm = () => {
    setFormData({
      job_id: '',
      name: '',
      email: '',
      phone: '',
      experience: '',
      notice_period: '',
      current_job: '',
      resume: ''
    })
  }

  const openCreateModal = () => {
    resetForm()
    setEditingApplication(null)
    setIsModalOpen(true)
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Job Applications</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage job applications and candidates</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <i className="fa fa-plus"></i>
          <span>Add Application</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalApplications || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <i className="fa fa-file-text text-white text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Applications</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todayApplications || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <i className="fa fa-calendar-day text-white text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unique Applicants</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.uniqueApplicants || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <i className="fa fa-users text-white text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Jobs with Applications</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.jobsWithApplications || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-500">
              <i className="fa fa-briefcase text-white text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Job</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Experience</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Notice Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Resume</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Applied Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
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
                    <div className="text-sm text-gray-500 dark:text-gray-400">{application.current_job}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {application.notice_period}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {application.resume ? (
                      <a
                        href={`http://localhost:8000${application.resume}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900 text-sm flex items-center space-x-1"
                      >
                        <i className="fa fa-download"></i>
                        <span>Download</span>
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">No resume</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(application.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(application)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Edit Application"
                      >
                        <i className="fa fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(application.id, application.name)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Delete Application"
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {applications.length === 0 && (
          <div className="text-center py-12">
            <i className="fa fa-file-text text-gray-400 text-4xl mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No applications found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">No job applications have been submitted yet.</p>
            <button
              onClick={openCreateModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Application
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Application Modal */}
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
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {editingApplication ? 'Edit Application' : 'Add New Application'}
                  </Dialog.Title>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Position</label>
                        <select
                          required
                          value={formData.job_id}
                          onChange={(e) => setFormData({...formData, job_id: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select a job</option>
                          {jobs.map((job) => (
                            <option key={job.id} value={job.id}>{job.title} - {job.company_name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter email address"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter phone number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience</label>
                        <input
                          type="text"
                          required
                          value={formData.experience}
                          onChange={(e) => setFormData({...formData, experience: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., 3 years"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notice Period</label>
                        <input
                          type="text"
                          required
                          value={formData.notice_period}
                          onChange={(e) => setFormData({...formData, notice_period: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., 30 days"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Job</label>
                      <input
                        type="text"
                        required
                        value={formData.current_job}
                        onChange={(e) => setFormData({...formData, current_job: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Current job title and company"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resume</label>
                      <div className="flex items-center space-x-3">
                        <input
                          ref={resumeInputRef}
                          type="file"
                          onChange={handleResumeUpload}
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => resumeInputRef.current?.click()}
                          disabled={uploading}
                          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center space-x-2"
                        >
                          <i className="fa fa-upload"></i>
                          <span>{uploading ? 'Uploading...' : 'Upload Resume'}</span>
                        </button>
                        {formData.resume && (
                          <a
                            href={`http://localhost:8000${formData.resume}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900 text-sm flex items-center space-x-1"
                          >
                            <i className="fa fa-file"></i>
                            <span>View Resume</span>
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Supported formats: PDF, DOC, DOCX (Max 2MB)
                      </p>
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
                        disabled={uploading}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {editingApplication ? 'Update Application' : 'Submit Application'}
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

export default JobApplications