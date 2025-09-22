import { useState, useEffect, useRef } from 'react'
import { usePermissions } from '../contexts/PermissionContext'
import ProtectedRoute from '../components/ProtectedRoute'
import api from '../services/api'

const FrontendCMS = () => {
  const [cmsData, setCmsData] = useState({})
  const [cmsKeys, setCmsKeys] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeSection, setActiveSection] = useState('landing')
  const imageInputRefs = useRef({})

  useEffect(() => {
    fetchCmsData()
    fetchCmsKeys()
  }, [])

  const fetchCmsData = async () => {
    try {
      const response = await api.get('/front-cms')
      setCmsData(response.data.data || {})
    } catch (error) {
      console.error('Failed to fetch CMS data:', error)
      setCmsData({})
    } finally {
      setLoading(false)
    }
  }

  const fetchCmsKeys = async () => {
    try {
      const response = await api.get('/front-cms/keys')
      setCmsKeys(response.data.data || {})
    } catch (error) {
      console.error('Failed to fetch CMS keys:', error)
      setCmsKeys({})
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.post('/front-cms', cmsData)
      alert('CMS content saved successfully!')
    } catch (error) {
      console.error('Failed to save CMS data:', error)
      alert('Failed to save CMS data')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (key, value) => {
    setCmsData(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleImageUpload = async (key, event) => {
    const file = event.target.files[0]
    if (!file) return
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF)')
      event.target.value = ''
      return
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      event.target.value = ''
      return
    }
    
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('image_type', key)
      
      const response = await api.post('/front-cms/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      if (response.data.success) {
        handleInputChange(key, response.data.image_url)
        alert('Image uploaded successfully!')
      }
    } catch (error) {
      console.error('Failed to upload image:', error)
      alert('Failed to upload image: ' + (error.response?.data?.message || error.message))
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const renderImageField = (key, label) => (
    <div key={key} className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="flex items-center space-x-3">
        <input
          ref={el => imageInputRefs.current[key] = el}
          type="file"
          onChange={(e) => handleImageUpload(key, e)}
          accept="image/*"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => imageInputRefs.current[key]?.click()}
          disabled={uploading}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          <i className="fa fa-upload"></i>
          <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
        </button>
        {cmsData[key] && (
          <div className="flex items-center space-x-2">
            <img
              src={`http://localhost:8000${cmsData[key]}`}
              alt={label}
              className="h-12 w-12 object-cover rounded border"
              onError={(e) => {
                e.target.src = '/assets/images/placeholder.png'
              }}
            />
            <a
              href={`http://localhost:8000${cmsData[key]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-900 text-sm"
            >
              View
            </a>
          </div>
        )}
      </div>
    </div>
  )

  const renderTextField = (key, label, type = 'text') => (
    <div key={key} className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={cmsData[key] || ''}
          onChange={(e) => handleInputChange(key, e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      ) : (
        <input
          type={type}
          value={cmsData[key] || ''}
          onChange={(e) => handleInputChange(key, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      )}
    </div>
  )

  const sections = {
    landing: {
      title: 'Landing Page',
      icon: 'fa-home',
      fields: [
        'landing_title',
        'landing_subtitle', 
        'landing_description',
        'landing_image'
      ]
    },
    features: {
      title: 'Features Section',
      icon: 'fa-star',
      fields: [
        'features_title',
        'features_description',
        'features_image',
        'feature_1_title',
        'feature_1_description', 
        'feature_1_image',
        'feature_2_title',
        'feature_2_description',
        'feature_2_image',
        'feature_3_title',
        'feature_3_description',
        'feature_3_image',
        'feature_4_title',
        'feature_4_description',
        'feature_4_image'
      ]
    },
    testimonials: {
      title: 'Testimonials',
      icon: 'fa-quote-left',
      fields: [
        'testimonials_title',
        'testimonial_1_name',
        'testimonial_1_text',
        'testimonial_1_image',
        'testimonial_2_name',
        'testimonial_2_text',
        'testimonial_2_image',
        'testimonial_3_name',
        'testimonial_3_text',
        'testimonial_3_image'
      ]
    },
    chat: {
      title: 'Start Chat Section',
      icon: 'fa-comments',
      fields: [
        'start_chat_title',
        'start_chat_description',
        'start_chat_image'
      ]
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute permissions={['manage front cms']}>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Frontend CMS</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your website content and images</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <i className="fa fa-save"></i>
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <nav className="space-y-2">
            {Object.entries(sections).map(([key, section]) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeSection === key
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <i className={`fa ${section.icon}`}></i>
                <span className="font-medium">{section.title}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <i className={`fa ${sections[activeSection]?.icon}`}></i>
              <span>{sections[activeSection]?.title}</span>
            </h2>
          </div>

          <div className="space-y-6">
            {sections[activeSection]?.fields.map(key => {
              const label = cmsKeys[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
              
              if (key.includes('image')) {
                return renderImageField(key, label)
              } else if (key.includes('description') || key.includes('text')) {
                return renderTextField(key, label, 'textarea')
              } else {
                return renderTextField(key, label)
              }
            })}
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Uploading image...</span>
          </div>
        </div>
      )}
      </div>
    </ProtectedRoute>
  )
}

export default FrontendCMS