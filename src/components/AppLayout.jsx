import { useState, useEffect, Fragment } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { usePermissions } from '../contexts/PermissionContext'
import { Outlet, useLocation, Link } from 'react-router-dom'
import { Dialog, Menu, Transition, Disclosure } from '@headlessui/react'
import api from '../services/api'

const AppLayout = () => {
  const { user, logout } = useAuth()
  const { theme, resolvedTheme, toggleTheme } = useTheme()
  const { getFilteredNavigation, userRole, isSuperAdmin, loading } = usePermissions()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const location = useLocation()
  
  useEffect(() => {
    fetchNotifications()
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])
  
  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications')
      const data = response.data.data || []
      setNotifications(data.slice(0, 5)) // Show only latest 5
      setUnreadCount(data.filter(n => !n.is_read).length)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }
  
  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`)
      fetchNotifications()
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const allNavigation = [
    { 
      name: 'Dashboard', 
      href: 'dashboard', 
      icon: 'fa-chart-line', 
      current: location.pathname.includes('dashboard')
      // No permissions required - everyone can see dashboard
    },
    {
      name: 'User Management',
      icon: 'fa-users',
      current: location.pathname.includes('users') || location.pathname.includes('roles'),
      permissions: ['manage_users', 'manage_roles'],
      children: [
        { name: 'Users', href: 'users', icon: 'fa-user', current: location.pathname.includes('users'), permissions: ['manage_users'] },
        { name: 'Roles', href: 'roles', icon: 'fa-users-cog', current: location.pathname.includes('roles'), permissions: ['manage_roles'] }
      ]
    },
    { 
      name: 'Conversations', 
      href: 'chat', 
      icon: 'fa-comments', 
      current: location.pathname.includes('chat')
      // No permissions required - all users should be able to chat
    },
    { 
      name: 'Transactions', 
      href: 'transactions', 
      icon: 'fa-credit-card', 
      current: location.pathname.includes('transactions'),
      permissions: ['view_transactions']
    },
    { 
      name: 'Subscriptions', 
      href: 'subscriptions', 
      icon: 'fa-crown', 
      current: location.pathname.includes('subscriptions'),
      permissions: ['manage_subscriptions']
    },
    { 
      name: 'Jobs', 
      href: 'jobs', 
      icon: 'fa-briefcase', 
      current: location.pathname.includes('jobs'),
      permissions: ['manage_jobs']
    },
    { 
      name: 'Meetings', 
      href: 'meetings', 
      icon: 'fa-video', 
      current: location.pathname.includes('meetings'),
      permissions: ['manage_meetings']
    },
    { 
      name: 'Notifications', 
      href: 'notifications', 
      icon: 'fa-bell', 
      current: location.pathname.includes('notifications')
    },
    { 
      name: 'Payments', 
      href: 'payments', 
      icon: 'fa-credit-card', 
      current: location.pathname.includes('payments'),
      permissions: ['view_payments']
    },
    { 
      name: 'Investors', 
      href: 'investors', 
      icon: 'fa-chart-line', 
      current: location.pathname.includes('investors'),
      permissions: ['manage_investors']
    },
    { 
      name: 'Reported Users', 
      href: 'reported-users', 
      icon: 'fa-flag', 
      current: location.pathname.includes('reported-users'),
      permissions: ['moderate_users']
    },
    { 
      name: 'Parent Groups', 
      href: 'parent-groups', 
      icon: 'fa-layer-group', 
      current: location.pathname.includes('parent-groups'),
      permissions: ['manage_groups']
    },
    { 
      name: 'Groups', 
      href: 'groups', 
      icon: 'fa-users', 
      current: location.pathname.includes('groups'),
      permissions: ['manage_groups']
    },
    { 
      name: 'Blocked Users', 
      href: 'blocked-users', 
      icon: 'fa-user-slash', 
      current: location.pathname.includes('blocked-users'),
      permissions: ['moderate_users']
    },
    { 
      name: 'Chat Requests', 
      href: 'chat-requests', 
      icon: 'fa-comment-dots', 
      current: location.pathname.includes('chat-requests')
      // No permissions required - all users should be able to manage chat requests
    },
    { 
      name: 'Email Verification', 
      href: 'email-verification', 
      icon: 'fa-envelope-circle-check', 
      current: location.pathname.includes('email-verification'),
      permissions: ['manage_settings']
    },
    { 
      name: 'Password Reset', 
      href: 'password-reset', 
      icon: 'fa-key', 
      current: location.pathname.includes('password-reset'),
      permissions: ['manage_settings']
    },
    { 
      name: 'Job Applications', 
      href: 'job-applications', 
      icon: 'fa-file-text', 
      current: location.pathname.includes('job-applications'),
      permissions: ['manage_jobs']
    },
    { 
      name: 'Frontend CMS', 
      href: 'frontend-cms', 
      icon: 'fa-globe', 
      current: location.pathname.includes('frontend-cms'),
      permissions: ['manage_content']
    },
    { 
      name: 'Google Meet', 
      href: 'google-meet', 
      icon: 'fab fa-google', 
      current: location.pathname.includes('google-meet'),
      permissions: ['manage_meetings']
    },
    { 
      name: 'Social Auth', 
      href: 'social-auth', 
      icon: 'fa-share-alt', 
      current: location.pathname.includes('social-auth'),
      permissions: ['manage_settings']
    },
    { 
      name: 'Admin Users', 
      href: 'admin-users', 
      icon: 'fa-user-cog', 
      current: location.pathname.includes('admin-users'),
      permissions: ['manage_admin_users']
    },
    { 
      name: 'Settings', 
      href: 'settings', 
      icon: 'fa-cog', 
      current: location.pathname.includes('settings'),
      permissions: ['manage_settings']
    },
  ]

  const navigation = getFilteredNavigation(allNavigation)

  // Show loading spinner while permissions are being fetched
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading permissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-800 px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                    <img
                      className="h-8 w-8"
                      src="/assets/images/logo-30x30.png"
                      alt="THINKERS CLUB"
                    />
                    <span className="ml-3 text-xl font-bold">
                      <span className="text-blue-600">THINKERS</span>
                      <span className="text-purple-600">CLUB</span>
                    </span>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul className="flex flex-1 flex-col gap-y-1">
                      {navigation.map((item) => (
                        <li key={item.name}>
                          {item.children ? (
                            <Disclosure as="div" defaultOpen={item.current}>
                              {({ open }) => (
                                <>
                                  <Disclosure.Button className={`group flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm leading-6 font-semibold ${
                                    item.current
                                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                  }`}>
                                    <i className={`fa ${item.icon} h-5 w-5 shrink-0`} />
                                    {item.name}
                                    <i className={`fa fa-chevron-right ml-auto h-4 w-4 shrink-0 transition-transform ${
                                      open ? 'rotate-90' : ''
                                    }`} />
                                  </Disclosure.Button>
                                  <Disclosure.Panel className="mt-1 px-2">
                                    <ul className="space-y-1">
                                      {item.children.map((subItem) => (
                                        <li key={subItem.name}>
                                          <Link
                                            to={subItem.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`group flex gap-x-3 rounded-md py-2 pl-8 pr-2 text-sm leading-6 font-medium ${
                                              subItem.current
                                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                          >
                                            <i className={`fa ${subItem.icon} h-4 w-4 shrink-0`} />
                                            {subItem.name}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  </Disclosure.Panel>
                                </>
                              )}
                            </Disclosure>
                          ) : (
                            <Link
                              to={item.href}
                              onClick={() => setSidebarOpen(false)}
                              className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                                item.current
                                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                            >
                              <i className={`fa ${item.icon} h-5 w-5 shrink-0`} />
                              {item.name}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <img
              className="h-8 w-8"
              src="/assets/images/logo-30x30.png"
              alt="THINKERS CLUB"
            />
            <span className="ml-3 text-xl font-bold">
              <span className="text-blue-600">THINKERS</span>
              <span className="text-purple-600">CLUB</span>
            </span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  {item.children ? (
                    <Disclosure as="div" defaultOpen={item.current}>
                      {({ open }) => (
                        <>
                          <Disclosure.Button className={`group flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm leading-6 font-semibold ${
                            item.current
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                              : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}>
                            <i className={`fa ${item.icon} h-5 w-5 shrink-0`} />
                            {item.name}
                            <i className={`fa fa-chevron-right ml-auto h-4 w-4 shrink-0 transition-transform ${
                              open ? 'rotate-90' : ''
                            }`} />
                          </Disclosure.Button>
                          <Disclosure.Panel className="mt-1 px-2">
                            <ul className="space-y-1">
                              {item.children.map((subItem) => (
                                <li key={subItem.name}>
                                  <Link
                                    to={subItem.href}
                                    className={`group flex gap-x-3 rounded-md py-2 pl-8 pr-2 text-sm leading-6 font-medium ${
                                      subItem.current
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                  >
                                    <i className={`fa ${subItem.icon} h-4 w-4 shrink-0`} />
                                    {subItem.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </Disclosure.Panel>
                        </>
                      )}
                    </Disclosure>
                  ) : (
                    <Link
                      to={item.href}
                      className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                        item.current
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <i className={`fa ${item.icon} h-5 w-5 shrink-0`} />
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 shadow-sm sm:px-6 lg:px-8">
          {/* Left side - Mobile menu + Search */}
          <div className="flex items-center gap-x-4">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <i className="fa fa-bars h-6 w-6" />
            </button>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-600 lg:hidden" />

            <div className="relative w-80">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <i className="fa fa-search h-4 w-4 text-gray-400" />
              </div>
              <input
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-9 pr-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Search..."
                type="search"
              />
            </div>
          </div>

          {/* Right side - Theme Toggle + Notifications + Profile */}
          <div className="flex items-center gap-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={`Current: ${theme} (${resolvedTheme})`}
            >
              <span className="text-lg">
                {theme === 'system' ? '⚙️' :
                 theme === 'light' ? '☀️' : '🌙'}
              </span>
            </button>
              <Menu as="div" className="relative">
                <Menu.Button className="-m-2.5 p-2.5 text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-100 relative">
                  <span className="sr-only">View notifications</span>
                  <i className="fa fa-bell h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2.5 w-80 origin-top-right rounded-md bg-white dark:bg-gray-800 py-2 shadow-lg ring-1 ring-gray-900/5 dark:ring-gray-700 focus:outline-none">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-600 flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                      <Link to="/app/notifications" className="text-xs text-blue-600 hover:text-blue-700">
                        View All
                      </Link>
                    </div>
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <Menu.Item key={notification.id}>
                          {({ active }) => (
                            <div 
                              className={`px-4 py-3 cursor-pointer ${ active ? 'bg-gray-50 dark:bg-gray-700' : '' } ${
                                !notification.is_read ? 'border-l-2 border-l-blue-500' : ''
                              }`}
                              onClick={() => markAsRead(notification.id)}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                                    {notification.notification}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {new Date(notification.created_at).toLocaleString()}
                                  </p>
                                </div>
                                {!notification.is_read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                                )}
                              </div>
                            </div>
                          )}
                        </Menu.Item>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <i className="fa fa-bell-slash text-gray-400 text-2xl mb-2"></i>
                        <p className="text-sm text-gray-500 dark:text-gray-400">No notifications</p>
                      </div>
                    )}
                  </Menu.Items>
                </Transition>
              </Menu>

            <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:lg:bg-gray-600" />

            {/* Profile dropdown */}
              <Menu as="div" className="relative">
                <Menu.Button className="-m-1.5 flex items-center p-1.5">
                  <span className="sr-only">Open user menu</span>
                  <img
                    className="h-8 w-8 rounded-full bg-gray-50 object-cover"
                    src={user?.photo_url ? (user.photo_url.startsWith('http') ? user.photo_url : `http://localhost:8000${user.photo_url}`) : '/assets/images/avatar.png'}
                    alt={user?.name || 'User'}
                    onError={(e) => {
                      e.target.src = '/assets/images/avatar.png'
                    }}
                  />
                  <span className="hidden lg:flex lg:items-center">
                    <span className="ml-4 text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                      {user?.name}
                    </span>
                    <i className="ml-2 fa fa-chevron-down h-5 w-5 text-gray-400 dark:text-gray-300" />
                  </span>
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-gray-900/5 dark:ring-gray-700 focus:outline-none">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-600">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                    </div>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/app/profile"
                          className={`flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 ${
                            active ? 'bg-gray-50 dark:bg-gray-700' : ''
                          }`}
                        >
                          <i className="fa fa-user mr-3 h-4 w-4 text-gray-400 dark:text-gray-300" />
                          Your profile
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/app/settings"
                          className={`flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 ${
                            active ? 'bg-gray-50 dark:bg-gray-700' : ''
                          }`}
                        >
                          <i className="fa fa-cog mr-3 h-4 w-4 text-gray-400 dark:text-gray-300" />
                          Settings
                        </Link>
                      )}
                    </Menu.Item>
                    <div className="border-t border-gray-100">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={logout}
                            className={`flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 ${
                              active ? 'bg-gray-50 dark:bg-gray-700' : ''
                            }`}
                          >
                            <i className="fa fa-sign-out mr-3 h-4 w-4 text-gray-400 dark:text-gray-300" />
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
          </div>
        </div>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppLayout