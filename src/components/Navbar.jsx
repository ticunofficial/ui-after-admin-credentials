import { Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'

const Navbar = () => {
  const { theme, resolvedTheme, toggleTheme } = useTheme()
  const { isAuthenticated, user, logout } = useAuth()
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-800 dark:text-white">
              <span className="text-blue-600">THINKERS</span>
              <span className="text-purple-600">CLUB</span>
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Home
              </Link>
              <Link to="/about" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                About
              </Link>
              <Link to="/contact" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Contact
              </Link>
              <Link to="/api-test" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                API Test
              </Link>
            </div>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={`Current: ${theme} (${resolvedTheme})`}
            >
              <span className="text-lg">
                {theme === 'system' ? '⚙️' :
                 theme === 'light' ? '☀️' : '🌙'}
              </span>
            </button>

            {/* Auth Menu */}
            {isAuthenticated ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <i className="fa fa-user"></i>
                  <span>{user?.name || 'User'}</span>
                  <i className="fa fa-chevron-down text-xs"></i>
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
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/app/dashboard"
                          className={`block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 ${
                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                          }`}
                        >
                          <i className="fa fa-dashboard mr-2"></i>
                          Dashboard
                        </Link>
                      )}
                    </Menu.Item>
                    <div className="border-t border-gray-100 dark:border-gray-700">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={logout}
                            className={`block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 ${
                              active ? 'bg-gray-100 dark:bg-gray-700' : ''
                            }`}
                          >
                            <i className="fa fa-sign-out mr-2"></i>
                            Logout
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <i className="fa fa-user"></i>
                  <span>Account</span>
                  <i className="fa fa-chevron-down text-xs"></i>
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
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/login"
                          className={`block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 ${
                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                          }`}
                        >
                          <i className="fa fa-sign-in mr-2"></i>
                          Login
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/register"
                          className={`block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 ${
                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                          }`}
                        >
                          <i className="fa fa-user-plus mr-2"></i>
                          Register
                        </Link>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar