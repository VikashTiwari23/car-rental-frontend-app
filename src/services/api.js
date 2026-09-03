import axios from 'axios'
const API_BASE_URL = 'http://localhost:8080/api'
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
      if (error.response.status === 403) {
        return Promise.reject({ message: 'You do not have permission to perform this action.' })
      }
    } else if (error.request) {
      return Promise.reject({ message: 'Cannot connect to server. Please ensure the backend is running on port 8080.' })
    } else {
      return Promise.reject({ message: 'An unexpected error occurred.' })
    }
    return Promise.reject(error)
  }
)
export const authService = {
  login: async (data) => {
    try {
      const response = await api.post('/auth/login', data)
      return response
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Login failed. Please check your credentials.')
    }
  },
  signup: async (data) => {
    try {
      const response = await api.post('/auth/signup', data)
      return response
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Registration failed. Please try again.')
    }
  },
}
export const carService = {
  getAllCars: async () => {
    try {
      return await api.get('/cars')
    } catch (error) {
      throw new Error('Failed to load cars. Please try again.')
    }
  },
  getAvailableCars: async (startDate, endDate) => {
    try {
      return await api.get('/cars/available', { params: { startDate, endDate } })
    } catch (error) {
      throw new Error('Failed to load available cars.')
    }
  },
  getCarById: async (id) => {
    try {
      return await api.get(`/cars/${id}`)
    } catch (error) {
      throw new Error('Car not found.')
    }
  },
  getCarsByFuelType: async (fuelType) => {
    try {
      return await api.get(`/cars/fuel-type/${fuelType}`)
    } catch (error) {
      throw new Error('Failed to filter cars.')
    }
  },
  createCar: async (data) => {
    try {
      return await api.post('/cars', data)
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to add car.')
    }
  },
  updateCar: async (id, data) => {
    try {
      return await api.put(`/cars/${id}`, data)
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update car.')
    }
  },
  deleteCar: async (id) => {
    try {
      return await api.delete(`/cars/${id}`)
    } catch (error) {
      throw new Error('Failed to delete car.')
    }
  },
}
export const bookingService = {
  createBooking: async (data) => {
    try {
      return await api.post('/bookings', data)
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create booking.')
    }
  },
  getMyBookings: async () => {
    try {
      return await api.get('/bookings/my-bookings')
    } catch (error) {
      throw new Error('Failed to load your bookings.')
    }
  },
  getAllBookings: async () => {
    try {
      return await api.get('/bookings')
    } catch (error) {
      throw new Error('Failed to load bookings.')
    }
  },
  approveBooking: async (id) => {
    try {
      return await api.put(`/bookings/${id}/approve`)
    } catch (error) {
      throw new Error('Failed to approve booking.')
    }
  },
  cancelBooking: async (id) => {
    try {
      return await api.put(`/bookings/${id}/cancel`)
    } catch (error) {
      throw new Error('Failed to cancel booking.')
    }
  },
}
export const adminService = {
  getAllBookings: async () => {
    try {
      return await api.get('/admin/bookings')
    } catch (error) {
      throw new Error('Failed to load bookings.')
    }
  },
  approveBooking: async (id) => {
    try {
      return await api.put(`/admin/bookings/${id}/approve`)
    } catch (error) {
      throw new Error('Failed to approve booking.')
    }
  },
  cancelBooking: async (id) => {
    try {
      return await api.put(`/admin/bookings/${id}/cancel`)
    } catch (error) {
      throw new Error('Failed to cancel booking.')
    }
  },
  getAllCustomers: async () => {
    try {
      return await api.get('/admin/customers')
    } catch (error) {
      throw new Error('Failed to load customers.')
    }
  },
}