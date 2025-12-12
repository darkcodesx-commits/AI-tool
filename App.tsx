
import React, { useState } from 'react';
import { FloatingCard, ParticleBackground } from './components/FloatingUI';
import { Dashboard } from './components/Dashboard';
import { ChatWidget } from './components/ChatWidget';
import { VoiceInterface } from './components/VoiceInterface';
import { Scheduler } from './components/Scheduler';
import { Auth } from './components/Auth';
import { AppView } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigateTo = (v: AppView) => {
    // If trying to access protected route without auth
    if (v === AppView.DASHBOARD && !isAuthenticated) {
        setView(AppView.LOGIN);
        return;
    }
    setView(v);
  };

  const handleAuthSuccess = () => {
      setIsAuthenticated(true);
      setView(AppView.LANDING); // Redirect to Home Page after Login/Register
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      setView(AppView.LANDING);
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-neon-blue selection:text-black relative overflow-hidden bg-[#050505]">
      <ParticleBackground />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="pointer-events-auto cursor-pointer" onClick={() => navigateTo(AppView.LANDING)}>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <span className="w-3 h-3 bg-neon-blue rounded-full animate-pulse"></span>
            AURA
          </h1>
        </div>
        <div className="pointer-events-auto flex items-center gap-6 text-sm font-medium tracking-wide">
          <button onClick={() => navigateTo(AppView.LANDING)} className={`hover:text-neon-blue transition-colors ${view === AppView.LANDING ? 'text-neon-blue' : 'text-gray-400'}`}>HOME</button>
          
          {isAuthenticated ? (
             <>
                <button onClick={() => navigateTo(AppView.DASHBOARD)} className={`hover:text-neon-blue transition-colors ${view === AppView.DASHBOARD ? 'text-neon-blue' : 'text-gray-400'}`}>DASHBOARD</button>
                <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition-colors">LOGOUT</button>
             </>
          ) : (
             <>
                 <button onClick={() => navigateTo(AppView.LOGIN)} className={`hover:text-neon-blue transition-colors ${view === AppView.LOGIN ? 'text-neon-blue' : 'text-gray-400'}`}>LOGIN</button>
                 <button onClick={() => navigateTo(AppView.REGISTER)} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-white border border-white/10 transition-all">GET STARTED</button>
             </>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 pt-24 min-h-screen flex flex-col w-full">
        
        {view === AppView.LANDING && (
          <div className="flex-1 flex flex-col justify-center items-center relative perspective-1000 px-4">
             
             {/* Central Hero Text */}
             <div className="text-center mb-16 z-20 pointer-events-none">
                <h1 className="text-5xl md:text-8xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-white via-neon-blue to-neon-purple leading-tight">
                  Future of<br/>Appointments
                </h1>
                <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light">
                  Voice. Chat. Schedule. <br/>
                  <span className="text-neon-blue">Zero gravity</span> friction for Indian businesses.
                </p>
             </div>

             {/* Floating Interaction Cards */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl items-center relative z-20">
                
                {/* Voice Card */}
                <div className="flex justify-center h-full items-center">
                  <FloatingCard delay={0} className="w-full max-w-sm group h-[320px] flex flex-col justify-between" onClick={() => navigateTo(AppView.VOICE_AGENT)}>
                    <div>
                      <div className="h-14 w-14 rounded-full bg-neon-purple/20 flex items-center justify-center mb-6 group-hover:bg-neon-purple/40 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-neon-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </div>
                      <h3 className="text-3xl font-bold mb-3 font-display">AI Voice Agent</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">Experience a natural conversation. Our AI speaks English & Hindi to book appointments instantly.</p>
                    </div>
                    <span className="text-neon-purple text-sm font-bold flex items-center gap-2 mt-4 uppercase tracking-wider">
                      Open Voice Interface <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  </FloatingCard>
                </div>

                {/* Chat Card (Center) */}
                <div className="flex justify-center h-full items-center md:-mt-12">
                   <FloatingCard delay={1.5} className="w-full max-w-sm group h-[320px] flex flex-col justify-between border-neon-blue/30" onClick={() => navigateTo(AppView.CHAT_ASSISTANT)}>
                    <div>
                      <div className="h-14 w-14 rounded-full bg-neon-blue/20 flex items-center justify-center mb-6 group-hover:bg-neon-blue/40 transition-colors">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-neon-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                         </svg>
                      </div>
                      <h3 className="text-3xl font-bold mb-3 font-display text-white">AI Chat Assistant</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">Prefer texting? Chat with Aura to manage your schedule, ask queries, and get instant replies.</p>
                    </div>
                    <span className="text-neon-blue text-sm font-bold flex items-center gap-2 mt-4 uppercase tracking-wider">
                      Start Chatting <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                   </FloatingCard>
                </div>

                {/* Scheduler Card */}
                <div className="flex justify-center h-full items-center">
                  <FloatingCard delay={3} className="w-full max-w-sm group h-[320px] flex flex-col justify-between" onClick={() => navigateTo(AppView.SCHEDULER)}>
                    <div>
                      <div className="h-14 w-14 rounded-full bg-green-400/20 flex items-center justify-center mb-6 group-hover:bg-green-400/40 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-3xl font-bold mb-3 font-display">Smart Schedule</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">Book directly through our intelligent calendar. Auto-conflict resolution and reminders.</p>
                    </div>
                    <span className="text-green-400 text-sm font-bold flex items-center gap-2 mt-4 uppercase tracking-wider">
                      Book Appointment <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  </FloatingCard>
                </div>

             </div>
          </div>
        )}

        {/* View Routing */}
        {view === AppView.DASHBOARD && <Dashboard />}
        
        {view === AppView.SCHEDULER && <Scheduler onBack={() => navigateTo(AppView.LANDING)} />}

        {(view === AppView.LOGIN || view === AppView.REGISTER) && (
          <Auth 
            mode={view === AppView.LOGIN ? 'LOGIN' : 'REGISTER'}
            onSwitchMode={(m) => setView(m === 'LOGIN' ? AppView.LOGIN : AppView.REGISTER)}
            onLogin={handleAuthSuccess}
            onBack={() => navigateTo(AppView.LANDING)}
          />
        )}

        {view === AppView.VOICE_AGENT && (
          <VoiceInterface onClose={() => navigateTo(AppView.LANDING)} />
        )}

        {view === AppView.CHAT_ASSISTANT && (
          <div className="w-full max-w-4xl mx-auto h-[80vh] flex flex-col p-4">
             <div className="flex items-center justify-between mb-4">
                <button onClick={() => navigateTo(AppView.LANDING)} className="text-gray-400 hover:text-white flex items-center gap-2">← Back to Home</button>
                <h2 className="text-xl font-display font-bold text-neon-blue">Aura Chat Assistant</h2>
             </div>
             <div className="flex-1 glass-card rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,243,255,0.1)]">
                <ChatWidget />
             </div>
          </div>
        )}

      </main>

      {/* Footer */}
      {(view === AppView.LANDING || view === AppView.LOGIN || view === AppView.REGISTER) && (
        <footer className="fixed bottom-0 left-0 right-0 p-4 text-center text-xs text-gray-600 pointer-events-none z-0">
          POWERED BY GEMINI 2.5 • MADE FOR INDIA
        </footer>
      )}
    </div>
  );
};

export default App;
