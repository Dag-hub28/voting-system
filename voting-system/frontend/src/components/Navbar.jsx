import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path ? 'active' : ''

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">🗳️</span>
        <span className="brand-text">VoteSecure</span>
      </div>

      {user && (
        <div className="navbar-links">
          {!user.is_admin && (
            <>
              <Link to="/vote" className={`nav-link ${isActive('/vote')}`}>Vote</Link>
              <Link to="/results" className={`nav-link ${isActive('/results')}`}>Results</Link>
            </>
          )}
          {user.is_admin && (
            <Link to="/admin" className={`nav-link ${isActive('/admin')}`}>Admin Panel</Link>
          )}
        </div>
      )}

      <div className="navbar-right">
        {user ? (
          <div className="user-info">
            <span className="user-name">
              {user.is_admin && <span className="admin-badge">Admin</span>}
              {user.username}
            </span>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div className="auth-links">
            <Link to="/login" className={`nav-link ${isActive('/login')}`}>Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </div>
        )}
      </div>
    </nav>
  )
}
