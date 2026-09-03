import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../App.css'
const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">CarRental</Link>
      </div>
      <div className="navbar-links">
        <Link to="/">Browse Cars</Link>
        {isAuthenticated && !isAdmin && <Link to="/my-bookings">My Bookings</Link>}
        {isAdmin && <Link to="/admin">Admin Dashboard</Link>}
        {isAuthenticated ? (
          <div className="navbar-user">
            <span>Welcome, {user?.name}</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        ) : (
          <div className="navbar-auth">
            <Link to="/login" className="btn-primary">Login</Link>
            <Link to="/signup" className="btn-secondary">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  )
}
export default Navbar