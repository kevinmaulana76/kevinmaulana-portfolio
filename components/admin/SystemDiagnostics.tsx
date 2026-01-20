import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/supabase.ts';

export const SystemDiagnostics: React.FC = () => {
  const [health, setHealth] = useState<{ db: string, ai: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const check = async () => {
    setIsRefreshing(true);
    // Membersihkan cache client lama agar membaca Env Var terbaru
    dbService.resetClient();
    
    try {
      // Berikan jeda sedikit agar UI tidak berkedip terlalu cepat
      await new Promise(r => setTimeout(r, 800));
      const res = await dbService.checkHealth();
      setHealth(res);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => { check(); }, []);

  return (
    <div className="p-4 border border-[#F5F5F0]/5 bg-zinc-900/30 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-[8px] font-black uppercase opacity-20 tracking-widest">Diagnostics</span>
        <button 
          onClick={check} 
          disabled={isRefreshing}
          className={`text-[8px] font-black uppercase hover:text-white transition-opacity ${isRefreshing ? 'opacity-20' : 'opacity-40'}`}
        >
          {isRefreshing ? 'Checking...' : 'Refresh'}
        </button>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] font-bold">
          <span className="opacity-40 uppercase">Database</span>
          <span className={health?.db === 'online' ? 'text-green-500' : health?.db === 'unconfigured' ? 'text-rose-500 underline' : 'text-rose-500'}>
            {health?.db?.toUpperCase() || 'OFFLINE'}
          </span>
        </div>
        <div className="flex justify-between text-[10px] font-bold">
          <span className="opacity-40 uppercase">AI Engine</span>
          <span className={health?.ai === 'ready' ? 'text-green-500' : 'text-amber-500'}>
            {health?.ai?.toUpperCase() || 'MISSING'}
          </span>
        </div>
      </div>
      
      {health?.db === 'unconfigured' && (
        <div className="pt-2 border-t border-white/5 space-y-2">
          <p className="text-[7px] text-rose-500 uppercase leading-tight italic font-bold">
            CRITICAL: Keys not detected in browser environment.
          </p>
          <p className="text-[7px] text-white/30 uppercase leading-tight">
            1. Check Vercel Env Vars.<br/>
            2. Redepoy app to apply changes.<br/>
            3. Ensure names are exact: VITE_SUPABASE_URL
          </p>
        </div>
      )}
    </div>
  );
};