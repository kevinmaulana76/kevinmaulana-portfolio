import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/supabase.ts';

export const SystemDiagnostics: React.FC = () => {
  const [health, setHealth] = useState<{ db: string, ai: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const check = async () => {
    setIsRefreshing(true);
    try {
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
          <span className={health?.db === 'online' ? 'text-green-500' : 'text-rose-500'}>
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
        <div className="pt-2 border-t border-white/5">
          <p className="text-[7px] text-rose-500/60 uppercase leading-tight italic">
            Check SUPABASE_URL & ANON_KEY in Vercel settings and redeploy.
          </p>
        </div>
      )}
    </div>
  );
};