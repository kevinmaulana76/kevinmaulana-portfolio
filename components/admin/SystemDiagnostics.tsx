import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/supabase.ts';

export const SystemDiagnostics: React.FC = () => {
  const [health, setHealth] = useState<{ db: string, ai: string } | null>(null);

  const check = async () => {
    const res = await dbService.checkHealth();
    setHealth(res);
  };

  useEffect(() => { check(); }, []);

  return (
    <div className="p-4 border border-[#F5F5F0]/5 bg-zinc-900/30 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-[8px] font-black uppercase opacity-20 tracking-widest">Diagnostics</span>
        <button onClick={check} className="text-[8px] font-black uppercase hover:text-white opacity-40 transition-opacity">Refresh</button>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] font-bold">
          <span className="opacity-40">DATABASE</span>
          <span className={health?.db === 'online' ? 'text-green-500' : 'text-rose-500'}>
            {health?.db?.toUpperCase() || 'CHECKING...'}
          </span>
        </div>
        <div className="flex justify-between text-[10px] font-bold">
          <span className="opacity-40">AI ENGINE</span>
          <span className={health?.ai === 'ready' ? 'text-green-500' : 'text-amber-500'}>
            {health?.ai?.toUpperCase() || 'CHECKING...'}
          </span>
        </div>
      </div>
    </div>
  );
};