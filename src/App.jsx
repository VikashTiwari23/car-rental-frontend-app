import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import CarList from './pages/CarList'
import BookingForm from './pages/BookingForm'
import MyBookings from './pages/MyBookings'
import AdminDashboard from './pages/AdminDashboard'
import './App.css'
const PrivateRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />
  return children
}
const AppRoutes = () => {
  const { isAuthenticated, isAdmin } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to={isAdmin ? "/admin" : "/"} replace /> : <Login />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />} />
      <Route path="/" element={<CarList />} />
      <Route path="/booking/:carId" element={<PrivateRoute><BookingForm /></PrivateRoute>} />
      <Route path="/my-bookings" element={<PrivateRoute><MyBookings /></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <AppRoutes />
          </main>
          <footer className="footer">
            <p>College Project Made by Vikash Kuldeep Priyanshu Ritik Vineet</p>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  )
}
export default App