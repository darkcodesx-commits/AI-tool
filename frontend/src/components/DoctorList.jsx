import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

function DoctorList({ onSelectDoctor }) {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/doctors`)
      setDoctors(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to load doctors. Make sure the backend server is running.')
      console.error('Error fetching doctors:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Loading doctors...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchDoctors}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Available Doctors
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {doctor.name}
                </h3>
                <p className="text-blue-600 font-medium mt-1">
                  {doctor.specialization}
                </p>
              </div>
              <div className="text-3xl">👨‍⚕️</div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Available:</span> {doctor.available_from} - {doctor.available_to}
              </p>
            </div>
            
            <button
              onClick={() => onSelectDoctor(doctor)}
              className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Book Appointment
            </button>
          </div>
        ))}
      </div>

      {doctors.length === 0 && (
        <div className="text-center py-12 text-gray-600">
          <p>No doctors available at the moment.</p>
        </div>
      )}
    </div>
  )
}

export default DoctorList

