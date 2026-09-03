import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { carService } from '../services/api'
import '../App.css'
const CarList = () => {
  const [cars, setCars] = useState([])
  const [filteredCars, setFilteredCars] = useState([])
  const [filters, setFilters] = useState({ model: '', fuelType: '', minPrice: '', maxPrice: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  useEffect(() => {
    fetchCars()
  }, [])
  const fetchCars = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await carService.getAllCars()
      const data = response.data
      setCars(Array.isArray(data) ? data : [])
      setFilteredCars(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Failed to load cars')
      setCars([])
      setFilteredCars([])
    } finally {
      setLoading(false)
    }
  }
  const applyFilters = () => {
    let result = [...cars]
    if (filters.model) {
      result = result.filter(car =>
        car.model.toLowerCase().includes(filters.model.toLowerCase()) ||
        car.brand.toLowerCase().includes(filters.model.toLowerCase())
      )
    }
    if (filters.fuelType) {
      result = result.filter(car => car.fuelType === filters.fuelType)
    }
    if (filters.minPrice) {
      result = result.filter(car => car.pricePerDay >= parseFloat(filters.minPrice))
    }
    if (filters.maxPrice) {
      result = result.filter(car => car.pricePerDay <= parseFloat(filters.maxPrice))
    }
    setFilteredCars(result)
  }
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }
  const handleBookNow = (carId) => {
    navigate(`/booking/${carId}`)
  }
  if (loading) return <div className="loading">Loading cars...</div>
  return (
    <div className="car-list-container">
      <h2>Available Cars</h2>
      {error && <div className="error-message">{error}</div>}
      <div className="filters">
        <input type="text" name="model" placeholder="Search by model/brand" value={filters.model} onChange={handleFilterChange} />
        <select name="fuelType" value={filters.fuelType} onChange={handleFilterChange}>
          <option value="">All Fuel Types</option>
          <option value="PETROL">Petrol</option>
          <option value="DIESEL">Diesel</option>
          <option value="ELECTRIC">Electric</option>
          <option value="HYBRID">Hybrid</option>
        </select>
        <input type="number" name="minPrice" placeholder="Min Price" value={filters.minPrice} onChange={handleFilterChange} />
        <input type="number" name="maxPrice" placeholder="Max Price" value={filters.maxPrice} onChange={handleFilterChange} />
        <button onClick={applyFilters} className="btn-primary">Apply Filters</button>
      </div>
      {filteredCars.length === 0 && !error ? (
        <p className="no-results">No cars found. {cars.length === 0 ? 'The fleet is empty.' : 'Try adjusting your filters.'}</p>
      ) : (
        <div className="cars-grid">
          {filteredCars.map(car => (
            <div key={car.id} className="car-card">
              <div className="car-image" style={{ backgroundColor: '#e2e8f0' }}>
                {car.imageUrl ? <img src={car.imageUrl} alt={`${car.brand} ${car.model}`} onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<span>${car.brand} ${car.model}</span>` }} /> : <span>{car.brand} {car.model}</span>}
              </div>
              <div className="car-details">
                <h3>{car.brand} {car.model}</h3>
                <p className="car-year">{car.year} | {car.color} | {car.transmission}</p>
                <p className="car-fuel">Fuel: {car.fuelType}</p>
                <p className="car-price">₹{car.pricePerDay}/day</p>
                <span className={`status-badge ${car.available ? 'available' : 'unavailable'}`}>
                  {car.available ? 'Available' : 'Booked'}
                </span>
                {car.available && (
                  <button onClick={() => handleBookNow(car.id)} className="btn-primary">Book Now</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
export default CarList