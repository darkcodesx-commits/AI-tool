
import React, { useState } from 'react';
import { BusinessProfile } from '../types';

export const Scheduler: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [step, setStep] = useState<'SELECT' | 'SUMMARY' | 'SUCCESS'>('SELECT');
  const [selectedDate, setSelectedDate] = useState<number>(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Mock Business Data
  const business: BusinessProfile = {
    name: "Apollo Dental Clinic",
    type: "Healthcare",
    address: "Sector 18, Noida, UP",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  };

  const dates = [
    { day: 'Mon', date: '12', status: 'available' },
    { day: 'Tue', date: '13', status: 'busy' },
    { day: 'Wed', date: '14', status: 'available' },
    { day: 'Thu', date: '15', status: 'available' },
    { day: 'Fri', date: '16', status: 'limited' },
  ];

  const slots = [
    { time: '10:00 AM', aiScore: 90, label: 'Recommended' },
    { time: '11:30 AM', aiScore: 60, label: '' },
    { time: '02:00 PM', aiScore: 40, label: '' },
    { time: '04:15 PM', aiScore: 85, label: 'Popular' },
  ];

  const handleConfirm = () => {
    // Simulate API call
    setTimeout(() => setStep('SUCCESS'), 1000);
  };

  if (step === 'SUCCESS') {
    return (
        <div className="w-full max-w-4xl mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
             <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 animate-float">
                <svg className="w-12 h-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
             </div>
             <h2 className="text-4xl font-display font-bold text-white mb-2">Booking Confirmed!</h2>
             <p className="text-gray-400 mb-8 max-w-md">
                Your appointment with {business.name} is set for <span className="text-neon-blue">{selectedSlot}</span> on <span className="text-neon-blue">Mon, 12th Aug</span>.
             </p>
             <div className="flex gap-4">
                <button onClick={onBack} className="bg-white/10 hover:bg-white/20 px-8 py-3 rounded-xl font-bold transition-all">Back to Home</button>
                <button className="bg-neon-blue/20 text-neon-blue border border-neon-blue/50 hover:bg-neon-blue/30 px-8 py-3 rounded-xl font-bold transition-all">Add to Calendar</button>
             </div>
        </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 relative z-10 flex flex-col h-full justify-start pt-20">
      <button 
        onClick={() => step === 'SUMMARY' ? setStep('SELECT') : onBack()}
        className="absolute top-4 left-4 md:left-0 text-gray-400 hover:text-white flex items-center gap-2 transition-colors mb-8"
      >
        ← {step === 'SUMMARY' ? 'Back' : 'Home'}
      </button>

      {/* Business Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8 items-center md:items-start animate-fade-in-up">
         <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
            <img src={business.image} alt={business.name} className="w-full h-full object-cover" />
         </div>
         <div className="text-center md:text-left">
            <h1 className="text-3xl font-display font-bold text-white">{business.name}</h1>
            <div className="flex items-center gap-2 justify-center md:justify-start text-gray-400 text-sm mt-1">
                <span>{business.type}</span>
                <span>•</span>
                <span>{business.address}</span>
                <span>•</span>
                <span className="text-yellow-400 flex items-center gap-1">★ {business.rating}</span>
            </div>
         </div>
      </div>

      <div className="glass-card p-6 md:p-8 rounded-2xl animate-fade-in-up delay-100">
        
        {step === 'SELECT' && (
            <>
                <header className="mb-8 border-b border-white/5 pb-4">
                <h2 className="text-xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-neon-blue">
                    Select Date & Time
                </h2>
                </header>

                {/* Date Selector */}
                <div className="mb-8">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">August 2024</label>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {dates.map((d, i) => (
                    <button
                        key={i}
                        onClick={() => setSelectedDate(i)}
                        disabled={d.status === 'busy'}
                        className={`flex-shrink-0 w-20 h-24 rounded-xl flex flex-col items-center justify-center transition-all duration-300 border ${
                        selectedDate === i 
                            ? 'bg-green-400/20 border-green-400 text-white scale-105 shadow-[0_0_15px_rgba(74,222,128,0.3)]' 
                            : d.status === 'busy' 
                            ? 'bg-white/5 border-transparent opacity-50 cursor-not-allowed'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        }`}
                    >
                        <span className="text-xs uppercase tracking-wider mb-1">{d.day}</span>
                        <span className="text-2xl font-bold font-display">{d.date}</span>
                        <span className={`w-1 h-1 rounded-full mt-2 ${d.status === 'busy' ? 'bg-red-500' : d.status === 'limited' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                    </button>
                    ))}
                </div>
                </div>

                {/* Slot Selector */}
                <div className="mb-8">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Available Slots</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {slots.map((s, i) => (
                        <button
                        key={i}
                        onClick={() => setSelectedSlot(s.time)}
                        className={`relative p-4 rounded-xl border text-left transition-all ${
                            selectedSlot === s.time
                            ? 'bg-neon-blue/20 border-neon-blue text-white shadow-[0_0_15px_rgba(0,243,255,0.2)]'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/30 hover:bg-white/10'
                        }`}
                        >
                        <span className="block text-lg font-bold font-display">{s.time}</span>
                        {s.label && (
                            <span className="text-[10px] uppercase tracking-wider text-green-400 mt-1 block">
                            {s.label}
                            </span>
                        )}
                        {s.aiScore > 80 && (
                            <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-br from-neon-blue to-purple-500 rounded-full flex items-center justify-center animate-pulse">
                            <span className="text-[8px] font-bold">AI</span>
                            </div>
                        )}
                        </button>
                    ))}
                    </div>
                </div>

                {/* Action */}
                <button 
                onClick={() => setStep('SUMMARY')}
                disabled={!selectedSlot}
                className={`w-full py-4 rounded-xl font-bold tracking-wide transition-all ${
                    selectedSlot 
                    ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-lg shadow-neon-blue/25 hover:shadow-neon-blue/40 hover:scale-[1.01]' 
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                >
                CONTINUE
                </button>
            </>
        )}

        {step === 'SUMMARY' && (
            <div className="animate-fade-in-up">
                 <header className="mb-6 border-b border-white/5 pb-4">
                    <h2 className="text-xl font-display font-bold text-white">
                        Review Booking
                    </h2>
                </header>
                
                <div className="space-y-4 mb-8">
                    <div className="flex justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-gray-400">Service</span>
                        <span className="font-bold">General Consultation</span>
                    </div>
                    <div className="flex justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-gray-400">Date</span>
                        <span className="font-bold">Monday, Aug 12</span>
                    </div>
                    <div className="flex justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-gray-400">Time</span>
                        <span className="font-bold text-neon-blue">{selectedSlot}</span>
                    </div>
                </div>

                <div className="bg-neon-blue/10 border border-neon-blue/20 p-4 rounded-xl mb-8 flex gap-3">
                    <svg className="w-5 h-5 text-neon-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-gray-300">
                        Cancellation is free up to 2 hours before the appointment. 
                        A confirmation SMS will be sent to your registered number.
                    </p>
                </div>

                <button 
                onClick={handleConfirm}
                className="w-full py-4 rounded-xl font-bold tracking-wide transition-all bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-lg shadow-neon-blue/25 hover:shadow-neon-blue/40 hover:scale-[1.01]"
                >
                CONFIRM APPOINTMENT
                </button>
            </div>
        )}

      </div>
    </div>
  );
};
