import React, { useState } from 'react';
import { dbService } from '../../services/supabase.ts';

interface AuthGatewayProps {
  onSuccess: (remember: boolean) => void;
  message: string;
  setMessage: (m: string) => void;
}

export const AuthGateway: React.FC<AuthGatewayProps> = ({ onSuccess, message, setMessage }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const currentSettings = await dbService.getSettings();
      if (password === currentSettings.adminPassword) {
        onSuccess(rememberMe);
        setMessage('');
      } else {
        setMessage('ACCESS DENIED: INCORRECT CREDENTIALS');
      }
    } catch (err) {
      setMessage('SYSTEM ERROR: UNABLE TO REACH AUTH SERVER');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken || !newPassword) {
      setMessage('ERROR: ALL FIELDS REQUIRED FOR RESET');
      return;
    }
    
    setIsLoading(true);
    try {
      const settings = await dbService.getSettings();
      if (resetToken === settings.recoveryToken) {
        await dbService.updateSettings({ adminPassword: newPassword });
        setMessage(`PASSWORD RESET SUCCESSFUL`);
        setShowReset(false);
        setPassword(newPassword); // Pre-fill new password
      } else {
        setMessage('INVALID RECOVERY TOKEN');
      }
    } catch (err) {
      setMessage('RESET FAILED: DATABASE ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-6 font-sans">
      <div className="max-w-md w-full border border-[#F5F5F0]/20 p-12 bg-[#080808] shadow-2xl relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#F5F5F0]/20 border-t-[#F5F5F0] animate-spin rounded-full"></div>
          </div>
        )}

        <div className="mb-12 uppercase text-center">
          <h1 className="text-5xl font-poster mb-3 tracking-tighter">SECURE_GATE</h1>
          <div className="h-0.5 w-12 bg-[#F5F5F0] mx-auto mb-4 opacity-20"></div>
          <p className="text-[#F5F5F0]/40 text-[9px] tracking-[0.4em] font-black">ADMINISTRATIVE TERMINAL ACCESS</p>
        </div>

        {message && (
          <div className={`p-4 border mb-8 text-[9px] font-black tracking-[0.2em] text-center uppercase transition-all duration-500 ${
            message.includes('SUCCESS') 
              ? 'border-green-500/50 text-green-500 bg-green-500/5' 
              : 'border-rose-500/50 text-rose-500 bg-rose-500/5'
          }`}>
            <i className={`fas ${message.includes('SUCCESS') ? 'fa-circle-check' : 'fa-triangle-exclamation'} mr-2`}></i>
            {message}
          </div>
        )}

        {!showReset ? (
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="relative border-b border-[#F5F5F0]/20 group focus-within:border-[#F5F5F0] transition-colors">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full bg-transparent py-4 pr-12 text-white focus:outline-none transition-all uppercase placeholder:text-zinc-800 tracking-[0.3em] text-xs font-bold" 
                placeholder="ENTER_PASSKEY" 
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-0 top-1/2 -translate-y-1/2 text-[#F5F5F0]/20 hover:text-white transition-colors p-2"
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-[10px]`}></i>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button 
                type="button" 
                onClick={() => setRememberMe(!rememberMe)} 
                className={`w-5 h-5 border flex items-center justify-center transition-all ${rememberMe ? 'bg-[#F5F5F0] border-[#F5F5F0]' : 'border-[#F5F5F0]/20 hover:border-[#F5F5F0]/40'}`}
              >
                {rememberMe && <i className="fas fa-check text-[10px] text-black"></i>}
              </button>
              <label 
                className="text-[9px] font-black uppercase tracking-[0.2em] text-[#F5F5F0]/30 cursor-pointer hover:text-[#F5F5F0]/60 transition-colors" 
                onClick={() => setRememberMe(!rememberMe)}
              >
                RETAIN SESSION
              </label>
            </div>

            <button 
              disabled={isLoading}
              className="w-full py-5 bg-[#F5F5F0] text-black font-black text-[10px] uppercase tracking-[0.3em] hover:invert transition-all active:scale-[0.98]"
            >
              AUTHENTICATE
            </button>

            <button 
              type="button" 
              onClick={() => { setShowReset(true); setMessage(''); }} 
              className="w-full text-zinc-700 hover:text-rose-900 text-[8px] uppercase font-black tracking-[0.2em] transition-colors mt-4"
            >
              RESET_CREDENTIALS
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-[#F5F5F0]/40 uppercase tracking-widest">Recovery Token</label>
                <input 
                  type="text" 
                  value={resetToken} 
                  onChange={(e) => setResetToken(e.target.value)} 
                  className="w-full bg-black border-b border-[#F5F5F0]/20 py-3 text-white focus:outline-none focus:border-white placeholder:text-zinc-900 text-xs tracking-widest uppercase font-bold" 
                  placeholder="PASTE_TOKEN_HERE" 
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-[#F5F5F0]/40 uppercase tracking-widest">New Passkey</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  className="w-full bg-black border-b border-[#F5F5F0]/20 py-3 text-white focus:outline-none focus:border-white placeholder:text-zinc-900 text-xs tracking-widest uppercase font-bold" 
                  placeholder="SET_NEW_PASSWORD" 
                  required
                />
              </div>
            </div>
            
            <button 
              disabled={isLoading}
              className="w-full py-5 bg-zinc-800 text-white font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all"
            >
              REWRITE_AUTH_DATA
            </button>
            
            <button 
              type="button" 
              onClick={() => { setShowReset(false); setMessage(''); }} 
              className="w-full text-zinc-700 hover:text-white text-[8px] uppercase font-black tracking-[0.2em] transition-colors"
            >
              RETURN_TO_LOGIN
            </button>
          </form>
        )}
      </div>
    </div>
  );
};