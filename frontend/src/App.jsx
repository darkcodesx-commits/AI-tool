import { useState } from 'react'
import DoctorList from './components/DoctorList'
import Chatbot from './components/Chatbot'

function App() {
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showChatbot, setShowChatbot] = useState(false)

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor)
    setShowChatbot(true)
  }

  const handleBackToList = () => {
    setShowChatbot(false)
    setSelectedDoctor(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">
            🏥 AI Appointment System
          </h1>
          <p className="text-gray-600 mt-1">
            Book your appointment with our AI assistant
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!showChatbot ? (
          <DoctorList onSelectDoctor={handleSelectDoctor} />
        ) : (
          <Chatbot 
            doctor={selectedDoctor} 
            onBack={handleBackToList}
          />
        )}
      </main>

      <footer className="mt-12 py-6 text-center text-gray-600">
        <p>© 2024 AI Appointment System - Powered by AI Receptionist</p>
      </footer>
    </div>
  )
}

export default App

