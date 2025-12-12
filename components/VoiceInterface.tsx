
import React, { useEffect, useRef, useState } from 'react';
import { LiveVoiceManager } from '../services/geminiService';
import { TranscriptItem } from '../types';

export const VoiceInterface: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [status, setStatus] = useState('DISCONNECTED');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [language, setLanguage] = useState<'EN' | 'HI'>('EN');
  
  const managerRef = useRef<LiveVoiceManager | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcripts
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts]);

  const handleConsent = () => {
    setHasConsented(true);
    // Initialize Voice Manager only after consent
    managerRef.current = new LiveVoiceManager(
      (s) => setStatus(s),
      (active) => setIsSpeaking(active),
      (item) => setTranscripts(prev => [...prev, item])
    );
    managerRef.current.connect();
  };

  useEffect(() => {
    return () => {
      managerRef.current?.disconnect();
    };
  }, []);

  // Visualizer Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let phase = 0;

    const animate = () => {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw Orb
      const baseRadius = 60;
      const pulse = isSpeaking ? Math.sin(Date.now() / 100) * 10 : 0;
      const radius = baseRadius + pulse;

      // Glow
      const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, radius * 2);
      gradient.addColorStop(0, 'rgba(0, 243, 255, 1)');
      gradient.addColorStop(0.5, 'rgba(188, 19, 254, 0.5)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Rings
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      
      for(let i=0; i<3; i++) {
        ctx.beginPath();
        const r = radius + (i * 20) + (Math.sin(phase + i) * 5);
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      phase += 0.05;
      animationId = requestAnimationFrame(animate);
    };

    canvas.width = 400;
    canvas.height = 400;
    animate();

    return () => cancelAnimationFrame(animationId);
  }, [isSpeaking]);

  if (!hasConsented) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
        <div className="glass-card max-w-md w-full p-8 rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,243,255,0.1)]">
          <h2 className="text-2xl font-display font-bold text-white mb-4">Voice Call Consent</h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
            To book your appointment, we need to record this call for quality and processing purposes. 
            The transcript will be stored securely.
          </p>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={handleConsent}
              className="w-full py-3 bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue border border-neon-blue/50 rounded-xl font-bold transition-all hover:scale-[1.02]"
            >
              I CONSENT • START CALL
            </button>
            <button 
              onClick={onClose}
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10 rounded-xl font-bold transition-all"
            >
              Cancel
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            Powered by Gemini AI • Secure & Private
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/95 backdrop-blur-xl py-8">
       {/* Header Controls */}
       <div className="w-full max-w-4xl px-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status === 'CONNECTED' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-xs font-mono text-gray-400">{status}</span>
          </div>
          
          <div className="flex gap-2">
             <button 
               onClick={() => setLanguage('EN')}
               className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${language === 'EN' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-gray-700'}`}
             >
               EN
             </button>
             <button 
               onClick={() => setLanguage('HI')}
               className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${language === 'HI' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-gray-700'}`}
             >
               HI
             </button>
          </div>
       </div>

       {/* Visualizer */}
       <div className="relative flex flex-col items-center justify-center flex-1 w-full">
          <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px]">
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>
          <h2 className="text-xl md:text-2xl font-display font-bold text-white mt-4 animate-pulse-glow">
            {isSpeaking ? 'Aura is listening...' : 'Aura is speaking...'}
          </h2>
       </div>

       {/* Live Transcript */}
       <div className="w-full max-w-2xl px-4 h-48 z-10">
         <div className="glass-card h-full rounded-xl p-4 overflow-y-auto space-y-3" ref={scrollRef}>
            {transcripts.length === 0 && (
                <div className="text-center text-gray-600 italic mt-10">Conversation will appear here...</div>
            )}
            {transcripts.map((t, i) => (
                <div key={i} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
                        t.role === 'user' 
                        ? 'bg-neon-blue/10 text-white rounded-br-none border border-neon-blue/20' 
                        : 'bg-white/5 text-gray-300 rounded-bl-none border border-white/5'
                    }`}>
                        <span className="text-[10px] uppercase text-gray-500 block mb-1">{t.role === 'user' ? 'You' : 'Aura'}</span>
                        {t.text}
                    </div>
                </div>
            ))}
         </div>
       </div>

       {/* Controls */}
       <div className="mt-6">
          <button 
            onClick={onClose}
            className="rounded-full bg-red-500/20 text-red-400 border border-red-500/50 px-12 py-4 hover:bg-red-500/30 transition-all font-bold tracking-widest hover:scale-105 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          >
            END CALL
          </button>
       </div>
    </div>
  );
};
