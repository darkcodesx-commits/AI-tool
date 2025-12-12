
import React, { useState } from 'react';

interface AuthProps {
  mode: 'LOGIN' | 'REGISTER';
  onSwitchMode: (mode: 'LOGIN' | 'REGISTER') => void;
  onLogin: () => void;
  onBack: () => void;
}

export const Auth: React.FC<AuthProps> = ({ mode, onSwitchMode, onLogin, onBack }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 md:p-0 relative z-10 flex flex-col justify-center min-h-[600px]">
      <button 
        onClick={onBack}
        className="absolute -top-12 left-0 text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
      >
        ← Back to Home
      </button>

      <div className="glass-card p-8 rounded-2xl relative overflow-hidden group">
        {/* Decorative background glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-neon-blue/20 blur-[50px] rounded-full pointer-events-none group-hover:bg-neon-blue/30 transition-all duration-500"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-neon-purple/20 blur-[50px] rounded-full pointer-events-none group-hover:bg-neon-purple/30 transition-all duration-500"></div>

        <header className="mb-8 text-center relative z-10">
          <h2 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple mb-2">
            {mode === 'LOGIN' ? 'Welcome Back' : 'Join Aura'}
          </h2>
          <p className="text-gray-400 text-sm">
            {mode === 'LOGIN' 
              ? 'Access your AI receptionist dashboard' 
              : 'Automate your appointments today'}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {mode === 'REGISTER' && (
             <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Business Name</label>
              <input 
                type="text" 
                placeholder="Ex. Apollo Clinic"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-purple transition-colors placeholder:text-gray-600"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              placeholder="you@company.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-blue transition-colors placeholder:text-gray-600"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                {mode === 'LOGIN' && (
                    <button type="button" className="text-xs text-neon-blue/80 hover:text-neon-blue transition-colors">
                        Forgot Password?
                    </button>
                )}
            </div>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-blue transition-colors placeholder:text-gray-600"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold tracking-wide transition-all uppercase flex items-center justify-center gap-2 ${
              loading
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-lg shadow-neon-blue/25 hover:shadow-neon-blue/40 hover:scale-[1.02]'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              mode === 'LOGIN' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center relative z-10">
          <p className="text-gray-400 text-sm mb-3">
            {mode === 'LOGIN' ? "Don't have an account yet?" : "Already have an account?"}
          </p>
          <button 
            onClick={() => onSwitchMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
            className="w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold transition-all hover:scale-[1.02] hover:border-neon-blue/50"
          >
            {mode === 'LOGIN' ? 'Create New Account' : 'Log In to Existing Account'}
          </button>
        </div>
      </div>
    </div>
  );
};
