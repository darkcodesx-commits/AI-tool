import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

function Chatbot({ doctor, onBack }) {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [sessionId, setSessionId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [appointmentData, setAppointmentData] = useState(null)
  const [isBooking, setIsBooking] = useState(false)
  const [bookingResult, setBookingResult] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // Initialize chat with greeting
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setSessionId(newSessionId)
    
    const initialMessage = {
      text: `Hello! I'm your AI assistant. I'll help you book an appointment with ${doctor.name} (${doctor.specialization}). What's your name?`,
      sender: 'bot',
      timestamp: new Date()
    }
    setMessages([initialMessage])
  }, [doctor])

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        message: inputMessage,
        session_id: sessionId,
        doctor_id: doctor.id
      })

      const botMessage = {
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
      setAppointmentData(response.data.appointment_data)

      // If conversation is complete, book the appointment
      if (response.data.is_complete && response.data.appointment_data) {
        await bookAppointment(response.data.appointment_data)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const bookAppointment = async (data) => {
    if (!data.doctor_id || !data.patient_name || !data.phone || !data.date || !data.time) {
      return
    }

    setIsBooking(true)
    try {
      const appointmentPayload = {
        doctor_id: doctor.id,
        patient_name: data.patient_name,
        phone: data.phone,
        problem: data.problem,
        date: data.date,
        time: data.time
      }

      const response = await axios.post(
        `${API_BASE_URL}/book-appointment`,
        appointmentPayload
      )

      setBookingResult({
        success: true,
        message: 'Appointment booked successfully!',
        appointment: response.data.appointment
      })

      // Add success message to chat
      const successMessage = {
        text: `✅ Great! Your appointment has been confirmed!\n\nAppointment ID: ${response.data.appointment_id}\nDate: ${data.date}\nTime: ${data.time}\n\nYou will receive a confirmation notification shortly.`,
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, successMessage])
    } catch (error) {
      console.error('Error booking appointment:', error)
      const errorMsg = error.response?.data?.detail || 'Failed to book appointment. Please try again.'
      
      setBookingResult({
        success: false,
        message: errorMsg
      })

      const errorMessage = {
        text: `❌ ${errorMsg}\n\nWould you like to try booking again?`,
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsBooking(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-t-lg shadow-md p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
          <div>
            <h3 className="font-semibold text-gray-800">{doctor.name}</h3>
            <p className="text-sm text-gray-600">{doctor.specialization}</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          AI Assistant
        </div>
      </div>

      {/* Chat Messages */}
      <div className="bg-gray-50 h-[500px] overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-lg px-4 py-2 ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-800 shadow-sm'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              <p className={`text-xs mt-1 ${
                msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {msg.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-b-lg shadow-md p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading || isBooking}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading || isBooking}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>

      {/* Booking Status */}
      {isBooking && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800">Booking your appointment...</p>
        </div>
      )}

      {bookingResult && (
        <div className={`mt-4 rounded-lg p-4 ${
          bookingResult.success
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          <p className={bookingResult.success ? 'text-green-800' : 'text-red-800'}>
            {bookingResult.message}
          </p>
        </div>
      )}
    </div>
  )
}

export default Chatbot

