import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VotePage from './pages/VotePage'
import ResultsPage from './pages/ResultsPage'
import AdminPage from './pages/AdminPage'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="spinner" style={{ marginTop: '4rem' }} />
  return user ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="spinner" style={{ marginTop: '4rem' }} />
  if (!user) return <Navigate to="/login" replace />
  if (!user.is_admin) return <Navigate to="/vote" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="spinner" style={{ marginTop: '4rem' }} />
  return user ? <Navigate to={user.is_admin ? '/admin' : '/vote'} replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/vote" replace />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/vote" element={<PrivateRoute><VotePage /></PrivateRoute>} />
          <Route path="/results" element={<PrivateRoute><ResultsPage /></PrivateRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
