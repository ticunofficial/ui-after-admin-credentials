import { useState, useEffect } from 'react'
import api from '../services/api'

const Settings = () => {
  const [settings, setSettings] = useState({
    app_name: '',
    company_name: '',
    enable_group_chat: false,
    members_can_add_group: false
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings')
      const settingsData = response.data.data || response.data || {}
      setSettings({
        app_name: settingsData.app_name || '',
        company_name: settingsData.company_name || '',
        enable_group_chat: settingsData.enable_group_chat || false,
        members_can_add_group: settingsData.members_can_add_group || false
      })
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.post('/settings', settings)
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-gray-900 dark:text-white">Loading settings...</div>
  }

  return (
    <div className="p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              App Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={settings.app_name}
              onChange={(e) => setSettings({...settings, app_name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={settings.company_name}
              onChange={(e) => setSettings({...settings, company_name: e.target.value})}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="enable_group_chat"
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              checked={settings.enable_group_chat}
              onChange={(e) => setSettings({...settings, enable_group_chat: e.target.checked})}
            />
            <label htmlFor="enable_group_chat" className="text-sm text-gray-700 dark:text-gray-300">
              Enable Group Chat
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="members_can_add_group"
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              checked={settings.members_can_add_group}
              onChange={(e) => setSettings({...settings, members_can_add_group: e.target.checked})}
            />
            <label htmlFor="members_can_add_group" className="text-sm text-gray-700 dark:text-gray-300">
              Members Can Add Groups
            </label>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings