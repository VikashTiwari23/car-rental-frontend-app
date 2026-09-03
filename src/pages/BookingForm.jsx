import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { carService, bookingService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import '../App.css'
const BookingForm = () => {
  const { carId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [car, setCar] = useState(null)
  const [formData, setFormData] = useState({ startDate: '', endDate: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [carLoading, setCarLoading] = useState(true)
  const [totalPrice, setTotalPrice] = useState(0)
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchCar()
  }, [carId, isAuthenticated, navigate])
  const fetchCar = async () => {
    try {
      setCarLoading(true)
      setError('')
      const response = await carService.getCarById(carId)
      setCar(response.data)
    } catch (err) {
      setError(err.message || 'Car not found')
      setCar(null)
    } finally {
      setCarLoading(false)
    }
  }
  const calculateTotal = (start, end) => {
    if (start && end && car) {
      const startDate = new Date(start)
      const endDate = new Date(end)
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
      if (days > 0) {
        setTotalPrice(days * car.pricePerDay)
      } else {
        setTotalPrice(0)
      }
    }
  }
  const handleChange = (e) => {
    const { name, value } = e.target
    const newData = { ...formData, [name]: value }
    setFormData(newData)
    calculateTotal(name === 'startDate' ? value : formData.startDate, name === 'endDate' ? value : formData.endDate)
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    if (!formData.startDate || !formData.endDate) {
      setError('Please select both start and end dates')
      setLoading(false)
      return
    }
    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    if (endDate < startDate) {
      setError('End date must be after start date')
      setLoading(false)
      return
    }
    try {
      await bookingService.createBooking({
        carId: parseInt(carId),
        startDate: formData.startDate,
        endDate: formData.endDate
      })
      setSuccess('Booking created successfully! Awaiting admin approval.')
      setTimeout(() => navigate('/my-bookings'), 2000)
    } catch (err) {
      setError(err.message || 'Booking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  if (carLoading) return <div className="loading">Loading car details...</div>
  if (!car && !carLoading) return <div className="error-message">{error || 'Car not found'} <button onClick={() => navigate('/')} className="btn-primary">Back to Cars</button></div>
  return (
    <div className="booking-form-container">
      <div className="booking-card">
        <h2>Book Your Ride</h2>
        <div className="car-summary">
          <h3>{car.brand} {car.model}</h3>
          <p>{car.year} | {car.color} | {car.fuelType} | {car.transmission}</p>
          <p className="price">${car.pricePerDay}/day</p>
        </div>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} min={new Date().toISOString().split('T')[0]} required />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} min={formData.startDate || new Date().toISOString().split('T')[0]} required />
            </div>
          </div>
          {totalPrice > 0 && (
            <div className="total-price">
              <span>Total Price:</span>
              <span className="amount">${totalPrice.toFixed(2)}</span>
            </div>
          )}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Processing...' : 'Confirm Booking'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/')}>Cancel</button>
        </form>
      </div>
    </div>
  )
}
export default BookingForm