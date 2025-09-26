import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { PermissionProvider } from './contexts/PermissionContext'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Users from './pages/Users'
import Roles from './pages/Roles'
import Transactions from './pages/Transactions'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import Subscriptions from './pages/Subscriptions'
import Jobs from './pages/Jobs'
import Meetings from './pages/Meetings'
import Notifications from './pages/Notifications'
import Payments from './pages/Payments'
import Investors from './pages/Investors'
import ReportedUsers from './pages/ReportedUsers'
import ParentGroups from './pages/ParentGroups'
import Groups from './pages/Groups'
import BlockedUsers from './pages/BlockedUsers'
import ChatRequests from './pages/ChatRequests'
import EmailVerification from './pages/EmailVerification'
import PasswordReset from './pages/PasswordReset'
import JobApplications from './pages/JobApplications'
import FrontendCMS from './pages/FrontendCMS'
import GoogleMeet from './pages/GoogleMeet'
import SocialAuth from './pages/SocialAuth'
import AdminUsers from './pages/AdminUsers'
import AccountActivation from './pages/AccountActivation'
import PaymentForm from './components/Payment/PaymentForm.jsx'
import PaymentSuccess from './components/Payment/PaymentSuccess.jsx'
import PaymentCallback from './components/Payment/PaymentCallback.jsx'

// Auth Guard Component
const AuthGuard = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Guest Guard Component  
const GuestGuard = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  }
  
  return !isAuthenticated ? children : <Navigate to="/app/dashboard" replace />
}
import Navbar from './components/Navbar'
import ApiTest from './components/ApiTest'
import ApiTestSuite from './components/ApiTestSuite'
import DataVerification from './components/DataVerification'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PermissionProvider>
        <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <GuestGuard>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <Home />
              </div>
            </GuestGuard>
          } />
          <Route path="/about" element={
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Navbar />
              <About />
            </div>
          } />
          <Route path="/contact" element={
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Navbar />
              <Contact />
            </div>
          } />
          <Route path="/login" element={<GuestGuard><Login /></GuestGuard>} />
          <Route path="/register" element={<GuestGuard><Register /></GuestGuard>} />
          <Route path="/activate" element={<AccountActivation />} />
          <Route path="/payment/:id" element={<PaymentForm />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failure" element={<div>Payment Failed</div>} />
          <Route path="/callback" element={<PaymentCallback />} />
          <Route path="/api-test" element={
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Navbar />
              <ApiTest />
            </div>
          } />
          <Route path="/api-test-suite" element={
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Navbar />
              <ApiTestSuite />
            </div>
          } />
          <Route path="/data-verification" element={
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Navbar />
              <DataVerification />
            </div>
          } />
          
          {/* Authenticated Routes with AppLayout */}
          <Route path="/app" element={<AuthGuard><AppLayout /></AuthGuard>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="chat" element={<Chat />} />
            <Route path="users" element={<ProtectedRoute permissions={['manage_users']}><Users /></ProtectedRoute>} />
            <Route path="roles" element={<ProtectedRoute permissions={['manage_roles']}><Roles /></ProtectedRoute>} />
            <Route path="transactions" element={<ProtectedRoute permissions={['view_transactions']}><Transactions /></ProtectedRoute>} />
            <Route path="subscriptions" element={<ProtectedRoute permissions={['manage_subscriptions']}><Subscriptions /></ProtectedRoute>} />
            <Route path="jobs" element={<ProtectedRoute permissions={['manage_jobs']}><Jobs /></ProtectedRoute>} />
            <Route path="meetings" element={<ProtectedRoute permissions={['manage_meetings']}><Meetings /></ProtectedRoute>} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="payments" element={<ProtectedRoute permissions={['view_payments']}><Payments /></ProtectedRoute>} />
            <Route path="investors" element={<ProtectedRoute permissions={['manage_investors']}><Investors /></ProtectedRoute>} />
            <Route path="reported-users" element={<ProtectedRoute permissions={['moderate_users']}><ReportedUsers /></ProtectedRoute>} />
            <Route path="parent-groups" element={<ProtectedRoute permissions={['manage_groups']}><ParentGroups /></ProtectedRoute>} />
            <Route path="groups" element={<ProtectedRoute permissions={['manage_groups']}><Groups /></ProtectedRoute>} />
            <Route path="blocked-users" element={<ProtectedRoute permissions={['moderate_users']}><BlockedUsers /></ProtectedRoute>} />
            <Route path="chat-requests" element={<ChatRequests />} />
            <Route path="email-verification" element={<EmailVerification />} />
            <Route path="password-reset" element={<PasswordReset />} />
            <Route path="job-applications" element={<ProtectedRoute permissions={['manage_jobs']}><JobApplications /></ProtectedRoute>} />
            <Route path="frontend-cms" element={<ProtectedRoute permissions={['manage_content']}><FrontendCMS /></ProtectedRoute>} />
            <Route path="google-meet" element={<GoogleMeet />} />
            <Route path="social-auth" element={<SocialAuth />} />
            <Route path="admin-users" element={<ProtectedRoute permissions={['manage_admin_users']}><AdminUsers /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute permissions={['manage_settings']}><Settings /></ProtectedRoute>} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
        </Router>
        </PermissionProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App