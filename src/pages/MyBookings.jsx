import React, { useState, useEffect } from 'react'
import { bookingService } from '../services/api'
import '../App.css'
const MyBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancellingId, setCancellingId] = useState(null)
  useEffect(() => {
    fetchBookings()
  }, [])
  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await bookingService.getMyBookings()
      const data = response.data
      setBookings(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Failed to load bookings')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }
  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return
    setCancellingId(id)
    try {
      await bookingService.cancelBooking(id)
      fetchBookings()
    } catch (err) {
      setError(err.message || 'Failed to cancel booking')
    } finally {
      setCancellingId(null)
    }
  }
  const getStatusClass = (status) => {
    switch (status) {
      case 'APPROVED': return 'status-approved'
      case 'PENDING': return 'status-pending'
      case 'CANCELLED': return 'status-cancelled'
      default: return ''
    }
  }
  if (loading) return <div className="loading">Loading bookings...</div>
  return (
    <div className="my-bookings-container">
      <h2>My Bookings</h2>
      {error && <div className="error-message">{error}</div>}
      {bookings.length === 0 && !error ? (
        <p className="no-bookings">You have no bookings yet. <a href="/">Browse cars</a> to get started.</p>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking.id} className="booking-card">
              <div className="booking-info">
                <h3>{booking.car ? `${booking.car.brand} ${booking.car.model}` : 'Unknown Car'}</h3>
                <p>From: {booking.startDate} To: {booking.endDate}</p>
                <p>Total: ${booking.totalPrice}</p>
                <span className={`status-badge ${getStatusClass(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
              {booking.status === 'PENDING' && (
                <button 
                  onClick={() => handleCancel(booking.id)} 
                  className="btn-danger"
                  disabled={cancellingId === booking.id}
                >
                  {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
export default MyBookings