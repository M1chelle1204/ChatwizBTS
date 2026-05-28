import React from 'react';
import { Home, MessageCircle, Instagram, Music, Settings } from 'lucide-react';

interface NavigationProps {
  activeApp: 'home' | 'kakaotalk' | 'instagram' | 'spotify' | 'settings';
  onChangeApp: (app: 'home' | 'kakaotalk' | 'instagram' | 'spotify' | 'settings') => void;
  theme: 'light' | 'dark';
}

export default function Navigation({ activeApp, onChangeApp, theme }: NavigationProps) {
  const isDark = theme === 'dark';
  
  const navBg = isDark 
    ? 'bg-neutral-900/90 border-neutral-800 text-neutral-400' 
    : 'bg-white/95 border-rose-100 text-stone-400';
    
  const activeColor = isDark
    ? 'text-green-400 font-bold'
    : 'text-rose-500 font-bold';

  const hoverColor = isDark
    ? 'hover:text-green-300'
    : 'hover:text-rose-400';

  return (
    <div className={`w-full pb-3 border-t backdrop-blur-md transition-colors duration-300 ${navBg} z-40 select-none`}>
      <div className="grid grid-cols-5 h-12">
        {/* Home Button */}
        <button
          id="nav-home-btn"
          type="button"
          onClick={() => onChangeApp('home')}
          className={`flex flex-col items-center justify-center gap-0.5 cursor-pointer h-full transition-all ${
            activeApp === 'home' ? activeColor : hoverColor
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px] font-semibold">홈</span>
        </button>

        {/* KakaoTalk Button */}
        <button
          id="nav-kakaotalk-btn"
          type="button"
          onClick={() => onChangeApp('kakaotalk')}
          className={`flex flex-col items-center justify-center gap-0.5 cursor-pointer h-full transition-all relative ${
            activeApp === 'kakaotalk' ? activeColor : hoverColor
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[9px] font-semibold">카톡</span>
          {/* Simulated unread dot indicator */}
          <span className="absolute top-2 right-4 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
        </button>

        {/* Instagram Button */}
        <button
          id="nav-instagram-btn"
          type="button"
          onClick={() => onChangeApp('instagram')}
          className={`flex flex-col items-center justify-center gap-0.5 cursor-pointer h-full transition-all ${
            activeApp === 'instagram' ? activeColor : hoverColor
          }`}
        >
          <Instagram className="w-5 h-5" />
          <span className="text-[9px] font-semibold">인스타</span>
        </button>

        {/* Spotify Button */}
        <button
          id="nav-spotify-btn"
          type="button"
          onClick={() => onChangeApp('spotify')}
          className={`flex flex-col items-center justify-center gap-0.5 cursor-pointer h-full transition-all ${
            activeApp === 'spotify' ? activeColor : hoverColor
          }`}
        >
          <Music className="w-5 h-5" />
          <span className="text-[9px] font-semibold">스포티파이</span>
        </button>

        {/* Settings Button */}
        <button
          id="nav-settings-btn"
          type="button"
          onClick={() => onChangeApp('settings')}
          className={`flex flex-col items-center justify-center gap-0.5 cursor-pointer h-full transition-all ${
            activeApp === 'settings' ? activeColor : hoverColor
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[9px] font-semibold">설정</span>
        </button>
      </div>

      {/* iOS Soft Indicator Line */}
      <div className="w-full flex justify-center mt-1">
        <div className={`w-28 h-1 rounded-full ${isDark ? 'bg-neutral-700' : 'bg-stone-300'}`}></div>
      </div>
    </div>
  );
}
