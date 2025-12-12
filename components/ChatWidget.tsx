import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/geminiService';
import { ChatMessage } from '../types';

export const ChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Namaste! I am Aura. How can I help you book an appointment today?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Format history for Gemini
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await sendChatMessage(history, userMsg.text);
      
      const botMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: responseText || "I'm having trouble connecting. Please try again.", 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      setMessages(prev => [...prev, { id: 'err', role: 'model', text: "Network error. Please try again.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl backdrop-blur-md ${
              msg.role === 'user' 
                ? 'bg-neon-blue/10 border border-neon-blue/30 text-white rounded-br-none' 
                : 'bg-glass-bg border border-glass-border text-gray-200 rounded-bl-none'
            }`}>
              <p>{msg.text}</p>
              <span className="text-[10px] opacity-50 block mt-2 text-right">
                {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
             <div className="bg-glass-bg p-4 rounded-2xl rounded-bl-none border border-glass-border">
                <div className="flex gap-1">
                    <div className="w-2 h-2 bg-neon-purple rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-neon-purple rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-neon-purple rounded-full animate-bounce delay-200"></div>
                </div>
             </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-glass-border bg-black/20 backdrop-blur-lg">
        <div className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-blue transition-colors"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading}
              className="bg-neon-blue/20 hover:bg-neon-blue/40 text-neon-blue border border-neon-blue/50 rounded-xl px-6 py-2 transition-all font-bold"
            >
              Send
            </button>
        </div>
      </div>
    </div>
  );
};
