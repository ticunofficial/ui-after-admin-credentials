import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
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
import Navbar from './components/Navbar'
import ApiTest from './components/ApiTest'
import ApiTestSuite from './components/ApiTestSuite'
import DataVerification from './components/DataVerification'
import AppLayout from './components/AppLayout'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PermissionProvider>
        <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Navbar />
              <Home />
            </div>
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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/activate" element={<AccountActivation />} />
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
          <Route path="/app" element={<AppLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="chat" element={<Chat />} />
            <Route path="users" element={<Users />} />
            <Route path="roles" element={<Roles />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="meetings" element={<Meetings />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="payments" element={<Payments />} />
            <Route path="investors" element={<Investors />} />
            <Route path="reported-users" element={<ReportedUsers />} />
            <Route path="parent-groups" element={<ParentGroups />} />
            <Route path="groups" element={<Groups />} />
            <Route path="blocked-users" element={<BlockedUsers />} />
            <Route path="chat-requests" element={<ChatRequests />} />
            <Route path="email-verification" element={<EmailVerification />} />
            <Route path="password-reset" element={<PasswordReset />} />
            <Route path="job-applications" element={<JobApplications />} />
            <Route path="frontend-cms" element={<FrontendCMS />} />
            <Route path="google-meet" element={<GoogleMeet />} />
            <Route path="social-auth" element={<SocialAuth />} />
            <Route path="admin-users" element={<AdminUsers />} />
            <Route path="settings" element={<Settings />} />
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