import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface StatusBarProps {
  theme: 'light' | 'dark';
}

export default function StatusBar({ theme }: StatusBarProps) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? '오후' : '오전';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      setTime(`${ampm} ${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const textColor = theme === 'dark' ? 'text-white' : 'text-stone-800';
  const barBg = theme === 'dark' ? 'bg-transparent' : 'bg-transparent';

  return (
    <div className={`w-full h-8 pt-1.5 px-6 flex justify-between items-center text-[11px] font-bold z-40 select-none ${textColor} ${barBg}`}>
      {/* Left Carrier/Clock */}
      <span className="shrink-0">{time}</span>
      
      {/* Middle Notch Space */}
      <div className="flex-1"></div>
      
      {/* Right Icons */}
      <div className="flex items-center gap-1.5">
        <Signal className="w-3.5 h-3.5" strokeWidth={2.5} />
        <span className="text-[10px] tracking-tight -mr-0.5">5G</span>
        <Wifi className="w-3.5 h-3.5" strokeWidth={2.5} />
        <div className="flex items-center gap-0.5">
          <Battery className="w-4 h-4" strokeWidth={2} />
          <span className="text-[9px]">98%</span>
        </div>
      </div>
    </div>
  );
}
