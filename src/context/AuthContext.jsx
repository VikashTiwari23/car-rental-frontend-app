import React, { createContext, useState, useContext, useEffect } from 'react'
const AuthContext = createContext(null)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [initialized, setInitialized] = useState(false)
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user')
      const storedToken = localStorage.getItem('token')
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser))
        setToken(storedToken)
      }
    } catch (error) {
      console.error('Error loading auth state:', error)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    } finally {
      setInitialized(true)
    }
  }, [])
  const login = (userData, authToken) => {
    try {
      setUser(userData)
      setToken(authToken)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('token', authToken)
    } catch (error) {
      console.error('Error saving auth state:', error)
    }
  }
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }
  const isAuthenticated = !!token
  const isAdmin = user?.role === 'ROLE_ADMIN'
  if (!initialized) {
    return <div className="loading">Loading...</div>
  }
  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
export default AuthContext