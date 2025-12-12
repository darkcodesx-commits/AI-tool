
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Appointment } from '../types';

const chartData = [
  { name: 'Mon', bookings: 40, voice: 24, chat: 16 },
  { name: 'Tue', bookings: 30, voice: 18, chat: 12 },
  { name: 'Wed', bookings: 50, voice: 30, chat: 20 },
  { name: 'Thu', bookings: 45, voice: 25, chat: 20 },
  { name: 'Fri', bookings: 60, voice: 40, chat: 20 },
  { name: 'Sat', bookings: 75, voice: 50, chat: 25 },
  { name: 'Sun', bookings: 20, voice: 10, chat: 10 },
];

const mockAppointments: Appointment[] = [
    { id: '1', customerName: 'Rajesh Kumar', service: 'Dental Checkup', date: '2024-08-12', time: '10:00 AM', status: 'Confirmed', contact: '+91 98765 43210' },
    { id: '2', customerName: 'Priya Singh', service: 'Root Canal', date: '2024-08-12', time: '11:30 AM', status: 'Pending', contact: '+91 98765 12345' },
    { id: '3', customerName: 'Amit Shah', service: 'Cleaning', date: '2024-08-12', time: '02:00 PM', status: 'Cancelled', contact: '+91 98765 67890' },
    { id: '4', customerName: 'Sneha Gupta', service: 'Consultation', date: '2024-08-12', time: '04:00 PM', status: 'Confirmed', contact: '+91 98765 00000' },
];

export const Dashboard: React.FC = () => {
  const [tab, setTab] = useState<'OVERVIEW' | 'SCHEDULE'>('OVERVIEW');

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 z-10 relative space-y-8 pb-20">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
            <h2 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">
            Admin Dashboard
            </h2>
            <p className="text-gray-400">Welcome back, Apollo Clinic Admin</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-4">
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                <button 
                  onClick={() => setTab('OVERVIEW')}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${tab === 'OVERVIEW' ? 'bg-neon-blue text-black' : 'text-gray-400 hover:text-white'}`}
                >
                    Overview
                </button>
                <button 
                  onClick={() => setTab('SCHEDULE')}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${tab === 'SCHEDULE' ? 'bg-neon-blue text-black' : 'text-gray-400 hover:text-white'}`}
                >
                    Schedule
                </button>
            </div>
            <span className="hidden md:block px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-mono">
                ● ONLINE
            </span>
        </div>
      </header>

      {tab === 'OVERVIEW' ? (
        <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                { label: 'Total Appts', val: '324', color: 'text-neon-blue' },
                { label: 'AI Voice Calls', val: '1,208', color: 'text-neon-purple' },
                { label: 'Pending Requests', val: '12', color: 'text-yellow-400' },
                { label: 'Revenue (est)', val: '₹1.4L', color: 'text-green-400' },
                ].map((stat, i) => (
                <div key={i} className="glass-card p-6 rounded-xl border-l-4 border-l-neon-blue">
                    <p className="text-gray-400 text-xs uppercase tracking-wider">{stat.label}</p>
                    <p className={`text-3xl font-bold font-display mt-2 ${stat.color}`}>{stat.val}</p>
                </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-6 rounded-xl h-[350px]">
                <h3 className="text-xl font-bold mb-4 font-display">Weekly Activity</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorVoice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#00f3ff" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }} />
                    <Area type="monotone" dataKey="voice" stroke="#00f3ff" fillOpacity={1} fill="url(#colorVoice)" />
                    <Area type="monotone" dataKey="chat" stroke="#bc13fe" fillOpacity={0.3} fill="#bc13fe" />
                    </AreaChart>
                </ResponsiveContainer>
                </div>

                <div className="glass-card p-6 rounded-xl h-[350px]">
                <h3 className="text-xl font-bold mb-4 font-display">Booking Sources</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }} />
                    <Bar dataKey="bookings" fill="#bc13fe" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
                </div>
            </div>
        </>
      ) : (
        <div className="glass-card p-6 md:p-8 rounded-xl min-h-[500px]">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold font-display">Today's Schedule (Aug 12)</h3>
                <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm border border-white/10 rounded-lg hover:bg-white/5">Export CSV</button>
                    <button className="px-3 py-1 text-sm bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded-lg font-bold">+ New Appt</button>
                </div>
             </div>
             
             <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 text-gray-500 text-xs uppercase tracking-wider">
                            <th className="p-4">Time</th>
                            <th className="p-4">Patient Name</th>
                            <th className="p-4">Service</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Contact</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {mockAppointments.map(appt => (
                            <tr key={appt.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-4 font-mono text-neon-blue">{appt.time}</td>
                                <td className="p-4 font-bold">{appt.customerName}</td>
                                <td className="p-4 text-gray-300">{appt.service}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                        appt.status === 'Confirmed' ? 'bg-green-500/20 text-green-400' :
                                        appt.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-red-500/20 text-red-400'
                                    }`}>
                                        {appt.status}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-400">{appt.contact}</td>
                                <td className="p-4 flex gap-2">
                                    <button className="p-1 hover:text-white text-gray-400" title="Edit">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>
                                    <button className="p-1 hover:text-red-400 text-gray-400" title="Cancel">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
             </div>
        </div>
      )}
    </div>
  );
};
