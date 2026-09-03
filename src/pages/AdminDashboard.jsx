import React, { useState, useEffect } from 'react'
import { adminService, carService } from '../services/api'
import '../App.css'
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings')
  const [bookings, setBookings] = useState([])
  const [cars, setCars] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCarForm, setShowCarForm] = useState(false)
  const [carForm, setCarForm] = useState({
    brand: '', model: '', year: '', color: '', fuelType: '',
    transmission: '', pricePerDay: '', licensePlate: '', available: true, imageUrl: ''
  })
  const [editingCarId, setEditingCarId] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  useEffect(() => {
    fetchData()
  }, [activeTab])
  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      if (activeTab === 'bookings') {
        const res = await adminService.getAllBookings()
        setBookings(Array.isArray(res.data) ? res.data : [])
      } else if (activeTab === 'cars') {
        const res = await carService.getAllCars()
        setCars(Array.isArray(res.data) ? res.data : [])
      } else if (activeTab === 'customers') {
        const res = await adminService.getAllCustomers()
        setCustomers(Array.isArray(res.data) ? res.data : [])
      }
    } catch (err) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }
  const handleApproveBooking = async (id) => {
    setActionLoading(`approve-${id}`)
    try {
      await adminService.approveBooking(id)
      fetchData()
    } catch (err) {
      setError(err.message || 'Failed to approve booking')
    } finally {
      setActionLoading(null)
    }
  }
  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return
    setActionLoading(`cancel-${id}`)
    try {
      await adminService.cancelBooking(id)
      fetchData()
    } catch (err) {
      setError(err.message || 'Failed to cancel booking')
    } finally {
      setActionLoading(null)
    }
  }
  const handleDeleteCar = async (id) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return
    setActionLoading(`delete-${id}`)
    try {
      await carService.deleteCar(id)
      fetchData()
    } catch (err) {
      setError(err.message || 'Failed to delete car')
    } finally {
      setActionLoading(null)
    }
  }
  const handleCarFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setCarForm({ ...carForm, [name]: type === 'checkbox' ? checked : value })
  }
  const resetCarForm = () => {
    setCarForm({
      brand: '', model: '', year: '', color: '', fuelType: '',
      transmission: '', pricePerDay: '', licensePlate: '', available: true, imageUrl: ''
    })
    setEditingCarId(null)
    setShowCarForm(false)
  }
  const handleCarSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setActionLoading('car-submit')
    try {
      if (editingCarId) {
        await carService.updateCar(editingCarId, carForm)
      } else {
        await carService.createCar(carForm)
      }
      resetCarForm()
      fetchData()
    } catch (err) {
      setError(err.message || 'Failed to save car')
    } finally {
      setActionLoading(null)
    }
  }
  const handleEditCar = (car) => {
    setCarForm({
      brand: car.brand || '', model: car.model || '', year: car.year || '', color: car.color || '',
      fuelType: car.fuelType || '', transmission: car.transmission || '', pricePerDay: car.pricePerDay || '',
      licensePlate: car.licensePlate || '', available: car.available !== false, imageUrl: car.imageUrl || ''
    })
    setEditingCarId(car.id)
    setShowCarForm(true)
  }
  if (loading) return <div className="loading">Loading dashboard...</div>
  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      {error && <div className="error-message">{error} <button onClick={fetchData} className="btn-primary" style={{ marginLeft: '10px' }}>Retry</button></div>}
      <div className="admin-tabs">
        <button className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}>Bookings</button>
        <button className={activeTab === 'cars' ? 'active' : ''} onClick={() => setActiveTab('cars')}>Cars</button>
        <button className={activeTab === 'customers' ? 'active' : ''} onClick={() => setActiveTab('customers')}>Customers</button>
      </div>
      {activeTab === 'bookings' && (
        <div className="bookings-table">
          {bookings.length === 0 ? (
            <p className="no-results">No bookings found.</p>
          ) : (
            <table>
              <thead>
                <tr><th>ID</th><th>Customer</th><th>Car</th><th>Start</th><th>End</th><th>Total</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{b.user ? b.user.name : 'Unknown'}</td>
                    <td>{b.car ? `${b.car.brand} ${b.car.model}` : 'Unknown'}</td>
                    <td>{b.startDate}</td>
                    <td>{b.endDate}</td>
                    <td>${b.totalPrice}</td>
                    <td><span className={`status-badge status-${b.status.toLowerCase()}`}>{b.status}</span></td>
                    <td>
                      {b.status === 'PENDING' && (
                        <button onClick={() => handleApproveBooking(b.id)} className="btn-success" disabled={actionLoading === `approve-${b.id}`}>
                          {actionLoading === `approve-${b.id}` ? '...' : 'Approve'}
                        </button>
                      )}
                      {b.status !== 'CANCELLED' && (
                        <button onClick={() => handleCancelBooking(b.id)} className="btn-danger" disabled={actionLoading === `cancel-${b.id}`}>
                          {actionLoading === `cancel-${b.id}` ? '...' : 'Cancel'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {activeTab === 'cars' && (
        <div className="cars-management">
          <button onClick={() => { setShowCarForm(true); setEditingCarId(null); setCarForm({ brand: '', model: '', year: '', color: '', fuelType: '', transmission: '', pricePerDay: '', licensePlate: '', available: true, imageUrl: '' }) }} className="btn-primary">Add New Car</button>
          {showCarForm && (
            <form onSubmit={handleCarSubmit} className="car-form">
              <h3>{editingCarId ? 'Edit Car' : 'Add New Car'}</h3>
              <div className="form-row">
                <input type="text" name="brand" placeholder="Brand" value={carForm.brand} onChange={handleCarFormChange} required />
                <input type="text" name="model" placeholder="Model" value={carForm.model} onChange={handleCarFormChange} required />
                <input type="number" name="year" placeholder="Year" value={carForm.year} onChange={handleCarFormChange} required />
              </div>
              <div className="form-row">
                <input type="text" name="color" placeholder="Color" value={carForm.color} onChange={handleCarFormChange} required />
                <select name="fuelType" value={carForm.fuelType} onChange={handleCarFormChange} required>
                  <option value="">Fuel Type</option>
                  <option value="PETROL">Petrol</option>
                  <option value="DIESEL">Diesel</option>
                  <option value="ELECTRIC">Electric</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
                <select name="transmission" value={carForm.transmission} onChange={handleCarFormChange} required>
                  <option value="">Transmission</option>
                  <option value="AUTOMATIC">Automatic</option>
                  <option value="MANUAL">Manual</option>
                </select>
              </div>
              <div className="form-row">
                <input type="number" step="0.01" name="pricePerDay" placeholder="Price/Day" value={carForm.pricePerDay} onChange={handleCarFormChange} required />
                <input type="text" name="licensePlate" placeholder="License Plate" value={carForm.licensePlate} onChange={handleCarFormChange} required />
                <input type="text" name="imageUrl" placeholder="Image URL" value={carForm.imageUrl} onChange={handleCarFormChange} />
              </div>
              <div className="form-row">
                <label><input type="checkbox" name="available" checked={carForm.available} onChange={handleCarFormChange} /> Available</label>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={actionLoading === 'car-submit'}>
                  {actionLoading === 'car-submit' ? 'Saving...' : (editingCarId ? 'Update' : 'Add')} Car
                </button>
                <button type="button" onClick={resetCarForm} className="btn-secondary">Cancel</button>
              </div>
            </form>
          )}
          {cars.length === 0 ? (
            <p className="no-results">No cars found. Add your first car!</p>
          ) : (
            <div className="cars-table">
              <table>
                <thead>
                  <tr><th>ID</th><th>Brand</th><th>Model</th><th>Year</th><th>Price/Day</th><th>Available</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {cars.map(car => (
                    <tr key={car.id}>
                      <td>{car.id}</td>
                      <td>{car.brand}</td>
                      <td>{car.model}</td>
                      <td>{car.year}</td>
                      <td>${car.pricePerDay}</td>
                      <td>{car.available ? 'Yes' : 'No'}</td>
                      <td>
                        <button onClick={() => handleEditCar(car)} className="btn-primary">Edit</button>
                        <button onClick={() => handleDeleteCar(car.id)} className="btn-danger" disabled={actionLoading === `delete-${car.id}`}>
                          {actionLoading === `delete-${car.id}` ? '...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {activeTab === 'customers' && (
        <div className="customers-table">
          {customers.length === 0 ? (
            <p className="no-results">No customers found.</p>
          ) : (
            <table>
              <thead>
                <tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th></tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone}</td>
                    <td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
export default AdminDashboard