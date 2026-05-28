import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, HelpCircle, PhoneCall, Info, ArrowRight, Music, MessageSquare } from 'lucide-react';
import StatusBar from './components/StatusBar';
import Navigation from './components/Navigation';
import SettingsView from './components/Settings';
import KakaoTalk from './components/KakaoTalk';
import Instagram from './components/Instagram';
import Spotify from './components/Spotify';
import Avatar from './components/Avatar';
import { SettingsState, ChatRoom, InstagramPost, SpotifyTrack } from './types';
import { btsMembers, getInitialChatRooms, getInitialPosts } from './data';

export default function App() {
  // Load and hydrate SettingsState from localStorage with default states
  const [settings, setSettings] = useState<SettingsState>(() => {
    const cached = localStorage.getItem('bts_sim_settings');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return {
          username: '阿米',
          language: 'zh',
          chatBg: 'pink-soft-gradient',
          autoReply: true,
          btsMood: 'happy',
          statusMessage: 'Purple U 💜',
          avatar: '💜',
          geminiApiKey: '',
          ...parsed
        };
      } catch (e) {
        console.error(e);
      }
    }
    return {
      username: '阿米',
      language: 'zh',
      chatBg: 'pink-soft-gradient',
      autoReply: true,
      btsMood: 'happy',
      statusMessage: 'Purple U 💜',
      avatar: '💜',
      geminiApiKey: ''
    };
  });

  const [homeTime, setHomeTime] = useState('');
  const [homeDate, setHomeDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setHomeTime(`${hours}:${minutes}`);

      const options: Intl.DateTimeFormatOptions = { 
        month: 'long', 
        day: 'numeric', 
        weekday: 'long' 
      };
      setHomeDate(now.toLocaleDateString('zh-CN', options));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load chat rooms from localStorage or default static templates from data.ts
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(() => {
    const cached = localStorage.getItem('bts_sim_chats');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }
    return getInitialChatRooms();
  });

  // Load Instagram Posts from localStorage or default templates
  const [posts, setPosts] = useState<InstagramPost[]>(() => {
    const cached = localStorage.getItem('bts_sim_posts');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }
    return getInitialPosts();
  });

  const [activeApp, setActiveApp] = useState<'home' | 'kakaotalk' | 'instagram' | 'spotify' | 'settings'>('home');
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  
  // Track Spotify Joint listen state
  const [togetherSession, setTogetherSession] = useState<{
    memberId: string;
    track: SpotifyTrack;
  } | null>(null);

  const [activeGreeting, setActiveGreeting] = useState<{
    memberId: string;
    memberName: string;
    avatar: string;
    type: 'morning' | 'night';
    text: string;
    color: string;
  } | null>(null);

  // Daily greeting effect: checks first open today and randomly chooses a member for a warm popover
  useEffect(() => {
    const todayStr = new Date().toDateString();
    const lastOpenedDate = localStorage.getItem('bts_last_opened_greeting_date');

    if (lastOpenedDate !== todayStr) {
      const member = btsMembers[Math.floor(Math.random() * btsMembers.length)];
      if (member) {
        const currentHour = new Date().getHours();
        const type = currentHour < 13 ? 'morning' : 'night';

        let text = '';
        if (member.id === 'rm') {
          text = type === 'morning' 
            ? '阿米，早安！今天的天气很适合去散步或者阅读。出门前记得吃早餐，愿你有美好的一天！🌿'
            : '辛苦啦，阿米。晚安！睡前放下所有的烦恼，听一首温柔的爵士乐放松一下吧。明天也会是美好的一天，做个好梦。💤🌙';
        } else if (member.id === 'jin') {
          text = type === 'morning'
            ? '早安，阿米！今天也是被我的帅气和你的可爱唤醒的一天呢！早餐一定要吃饱哦！✨🍳'
            : '阿米！今天也非常非常努力了！晚安啦，做个金硕珍超甜美梦！睡个好觉，不要熬夜哦！💖💤';
        } else if (member.id === 'suga') {
          text = type === 'morning'
            ? '早安。新的一天开始了，不用太焦虑，按照自己的步伐慢慢来就好。喝杯温水，加油。🐱☕'
            : '忙了一天累了吧。晚安，什么都别想了，早点睡。明天太阳依旧会升起，一切都会没问题的。😴🎹';
        } else if (member.id === 'jhope') {
          text = type === 'morning'
            ? '阿米！早安呀！☀️ 伸个大大的懒腰，迎接全新的一天！我是你的 Hope，你也是我的 Hope！今天也要充满活力地度过哦！🐿️✨'
            : '阿米！辛苦的一天结束啦，辛苦你啦！给今天的自己一个拥抱吧。晚安，愿好梦都伴随着你，明天见！😴💜';
        } else if (member.id === 'jimin') {
          text = type === 'morning'
            ? '早安，我们阿米！今天也要记得微笑哦。无论什么时候，智旻都在这里为你打气，加油！🐣💛'
            : '阿米，辛苦的一天终于过去啦。睡觉的时候抱紧被子，做一个温暖舒适的甜美梦吧。最想你了，晚安！🌟🐣';
        } else if (member.id === 'v') {
          text = type === 'morning'
            ? '阿米，早安 🐯 要不要一起听首轻快的爵士乐开始今天呢？希望你今天遇到很多开心的小惊喜。'
            : '晚安，阿米 🌙 谢谢你今天做出的所有努力。闭上眼，在梦里举行属于我们的秘密派对吧。好梦 🐻💤';
        } else { // jungkook
          text = type === 'morning'
            ? '早安，阿米！🐰 今天也打起精神，开启充满力量的一天吧！等会儿去运动，你也要好好吃早饭哦！'
            : '阿米，晚安 💜 辛苦的一天做得很棒啦！现在开始闭上眼睛充电，我们在梦里一起去旅行吧！🐰💤';
        }

        // Customise target name
        text = text.replace(/阿米/g, settings.username);

        setActiveGreeting({
          memberId: member.id,
          memberName: member.name,
          avatar: member.avatar,
          type: type,
          text: text,
          color: member.color || '#EC4899',
        });
        localStorage.setItem('bts_last_opened_greeting_date', todayStr);
      }
    }
  }, [settings.username]);

  // Synchronise settings state changes to localStorage
  useEffect(() => {
    localStorage.setItem('bts_sim_settings', JSON.stringify(settings));
  }, [settings]);

  // Synchronise chats state changes to localStorage
  useEffect(() => {
    localStorage.setItem('bts_sim_chats', JSON.stringify(chatRooms));
  }, [chatRooms]);

  // Synchronise posts state changes to localStorage
  useEffect(() => {
    localStorage.setItem('bts_sim_posts', JSON.stringify(posts));
  }, [posts]);

  const handleUpdateSettings = (updated: Partial<SettingsState>) => {
    setSettings(prev => ({ ...prev, ...updated }));
  };

  const handleResetApp = () => {
    localStorage.removeItem('bts_sim_settings');
    localStorage.removeItem('bts_sim_chats');
    localStorage.removeItem('bts_sim_posts');
    localStorage.removeItem('bts_last_opened_greeting_date');
    
    // reset to pristine state
    setSettings({
      username: '阿米',
      language: 'zh',
      chatBg: 'pink-soft-gradient',
      autoReply: true,
      btsMood: 'happy',
      statusMessage: 'Purple U 💜',
      avatar: '💜',
      geminiApiKey: ''
    });
    setChatRooms(getInitialChatRooms());
    setPosts(getInitialPosts());
    setTogetherSession(null);
    setActiveApp('home');
    alert('格式化成功！模拟器系统已焕然一新！🔮✨');
  };

  // Launch Spotify "Together Session" redirect from KakaoTalk card
  const handleOpenMusicTogether = (track: SpotifyTrack, memberId: string) => {
    setTogetherSession({ memberId, track });
    setActiveApp('spotify');
  };

  const currentTheme = activeApp === 'spotify' ? 'dark' : 'light';

  return (
    <div className="w-full min-h-screen bg-stone-900 flex py-12 px-4 justify-center items-center overflow-y-auto select-none relative">
      
      {/* Decorative Outer ambient glow */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-rose-500/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"></div>

      {/* Main outer smartphone casing mock */}
      <div className="w-full max-w-[375px] h-[760px] bg-stone-950 rounded-[44px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-[10px] border-stone-850 flex flex-col overflow-hidden relative isolate">
        
        {/* Dynamic Screen Glare Overlay effect */}
        <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white/5 to-transparent pointer-events-none z-30 skew-x-12"></div>
        
        {/* Physical Top Notch bar */}
        <div className="phone-notch"></div>

        {/* Dynamic Status Bar */}
        <StatusBar theme={currentTheme} />

        {/* Dynamic active App View panel container */}
        <div className="flex-1 overflow-hidden relative bg-white">
          <AnimatePresence mode="wait">
            
            {/* SCREEN 1: SMARTPHONE HOME DASHBOARD PORTAL */}
            {activeApp === 'home' && (
              <motion.div
                key="home_screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full relative flex flex-col justify-end p-5 select-none text-white overflow-hidden"
              >
                {/* Embedded custom pink bts wallpaper themed design */}
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/40 via-pink-400/20 to-stone-900 pointer-events-none z-0"></div>
                <div className="absolute inset-0 bg-[#fce7f3]/5 pointer-events-none z-0"></div>

                {/* Simulated Widget Display: Smartphone Home Digital Clock Widget */}
                <div className="mt-8 mb-auto z-10 w-full flex flex-col items-center">
                  <div className="text-center select-none py-4 space-y-1.5">
                    <h1 className="text-6xl font-light tracking-tighter text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] font-mono">
                      {homeTime || "12:00"}
                    </h1>
                    <p className="text-xs font-bold text-pink-200/95 tracking-wide drop-shadow-sm font-sans">
                      {homeDate || "5月28日"}
                    </p>
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 mt-2 bg-black/25 backdrop-blur-md border border-white/10 text-[10px] rounded-full text-pink-100 font-extrabold shadow-sm">
                      <span className="text-purple-300 flex items-center gap-1">
                        <Avatar avatar={settings.avatar} className="w-4 h-4 rounded-full border border-pink-400/30" fallbackSizeClass="text-[9px]" />
                        <span className="ml-0.5">{settings.username}</span>
                      </span>
                      <span className="w-1.5 h-1 text-white/25 rounded-full bg-white/20"></span>
                      <span className="text-stone-300">
                        {settings.btsMood === 'happy' ? '开心 🐣' : settings.btsMood === 'gentle' ? '温柔 ☕' : settings.btsMood === 'tired' ? '略疲惫 💤' : '极兴奋! 🔥'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sub Applet Launcher Grid */}
                <div className="grid grid-cols-4 gap-4 z-10 pt-4 border-t border-white/10">
                  {/* KakaoTalk launcher */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveApp('kakaotalk');
                      setActiveRoomId(null);
                    }}
                    className="flex flex-col items-center gap-1 cursor-pointer transition-transform active:scale-90"
                  >
                    <div className="w-13 h-13 bg-[#fee500] hover:bg-[#ffe000] rounded-2xl flex items-center justify-center text-3xl shadow-md border border-[#f5cc00] relative">
                      💬
                      <span className="absolute -top-1.5 -right-1 bg-red-500 text-white font-extrabold rounded-full text-[8px] px-1.5 py-0.5 border border-white animate-pulse">
                        LIVE
                      </span>
                    </div>
                    <span className="text-[10px] font-black tracking-tight text-white drop-shadow-sm">KakaoTalk</span>
                  </button>

                  {/* Instagram launcher */}
                  <button
                    type="button"
                    onClick={() => setActiveApp('instagram')}
                    className="flex flex-col items-center gap-1 cursor-pointer transition-transform active:scale-90"
                  >
                    <div className="w-13 h-13 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-md">
                      📸
                    </div>
                    <span className="text-[10px] font-black tracking-tight text-white drop-shadow-sm">아미그램</span>
                  </button>

                  {/* Spotify launcher */}
                  <button
                    type="button"
                    onClick={() => setActiveApp('spotify')}
                    className="flex flex-col items-center gap-1 cursor-pointer transition-transform active:scale-90"
                  >
                    <div className="w-13 h-13 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center text-3xl shadow-md relative">
                      🎧
                      {togetherSession && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full"></span>}
                    </div>
                    <span className="text-[10px] font-black tracking-tight text-white drop-shadow-sm">Spotify</span>
                  </button>

                  {/* Settings launcher */}
                  <button
                    type="button"
                    onClick={() => setActiveApp('settings')}
                    className="flex flex-col items-center gap-1 cursor-pointer transition-transform active:scale-90"
                  >
                    <div className="w-13 h-13 bg-zinc-700 hover:bg-zinc-600 rounded-2xl flex items-center justify-center text-3xl shadow-md border border-white/5">
                      ⚙️
                    </div>
                    <span className="text-[10px] font-black tracking-tight text-white drop-shadow-sm">系统设置</span>
                  </button>
                </div>

                {/* Physical Action info banner */}
                <div 
                  onClick={() => setShowInfoPanel(true)}
                  className="mt-5 w-full bg-white/5 border border-white/5 p-3 rounded-2xl flex justify-between items-center text-[10px] font-extrabold text-stone-200 cursor-pointer hover:bg-white/10 transition-colors z-10 select-none mb-1 shadow-inner"
                >
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-pink-300" />
                    <span>查看阿米手机使用手册与说明</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                </div>
              </motion.div>
            )}

            {/* SCREEN 2: KAKAOTALK PLATFORM CHATS SIMULATOR */}
            {activeApp === 'kakaotalk' && (
              <motion.div
                key="kakaotalk_screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <KakaoTalk
                  chatRooms={chatRooms}
                  onUpdateChatRooms={setChatRooms}
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  activeRoomId={activeRoomId}
                  onSetActiveRoomId={setActiveRoomId}
                  onOpenMusicTogether={handleOpenMusicTogether}
                />
              </motion.div>
            )}

            {/* SCREEN 3: INSTAGRAM DISCOVERY FEEDS */}
            {activeApp === 'instagram' && (
              <motion.div
                key="instagram_screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <Instagram
                  posts={posts}
                  onUpdatePosts={setPosts}
                  settings={settings}
                />
              </motion.div>
            )}

            {/* SCREEN 4: SPOTIFY EXCLUSIVE MUSIC PLAYER CONTAINER */}
            {activeApp === 'spotify' && (
              <motion.div
                key="spotify_screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <Spotify
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  togetherSession={togetherSession}
                  onSetTogetherSession={setTogetherSession}
                  activeApp={activeApp}
                />
              </motion.div>
            )}

            {/* SCREEN 5: SETTINGS SHELF CARD PANEL */}
            {activeApp === 'settings' && (
              <motion.div
                key="settings_screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <SettingsView
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  onResetApp={handleResetApp}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Daily Greeting Popup Dialog Modal */}
        <AnimatePresence>
          {activeGreeting && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-0 bottom-0 top-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-5 z-[100]"
              id="daily-greeting-overlay"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white/95 backdrop-blur-md rounded-[32px] border border-pink-100 p-5 shadow-2xl w-full max-w-xs text-center relative flex flex-col items-center gap-3.5 overflow-hidden"
                id="daily-greeting-card"
              >
                {/* Decorative background aura based on member color */}
                <div 
                  className="absolute -top-12 -left-12 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none"
                  style={{ backgroundColor: activeGreeting.color }}
                ></div>
                <div 
                  className="absolute -bottom-12 -right-12 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none"
                  style={{ backgroundColor: activeGreeting.color }}
                ></div>

                {/* Header Ring & Animated Avatar */}
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-lg border-4 bg-white transition-transform duration-300 relative select-none shrink-0"
                  style={{ 
                    borderColor: activeGreeting.color,
                    boxShadow: `0 8px 16px -4px ${activeGreeting.color}40`
                  }}
                >
                  <span>{activeGreeting.avatar}</span>
                  <span className="absolute -bottom-1 -right-1 bg-white text-[10px] px-1.5 py-0.5 rounded-full border border-pink-100 shadow-sm font-semibold text-pink-600">
                    {activeGreeting.type === 'morning' ? '早安 ☀️' : '晚安 🌙'}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-black text-rose-950 font-display text-base tracking-wide flex items-center gap-1.5 justify-center">
                    <span>{activeGreeting.memberName}</span>
                    <span className="text-pink-500 font-sans text-xs font-semibold">💜 每日问候</span>
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                    {activeGreeting.type === 'morning' ? 'Good Morning Greeting' : 'Good Night Greeting'}
                  </p>
                </div>

                {/* Inner Styled bubble container */}
                <div className="w-full bg-rose-50/40 border border-rose-100/50 p-4 rounded-2xl relative select-text">
                  <p className="text-xs text-rose-900 font-semibold leading-relaxed text-left font-sans">
                    {activeGreeting.text}
                  </p>
                  <div className="absolute right-3.5 bottom-1.5 opacity-10 font-black text-3xl font-mono select-none pointer-events-none">
                    💜
                  </div>
                </div>

                {/* Dynamic Interactive Call-to-actions */}
                <div className="grid grid-cols-2 gap-2.5 w-full mt-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveGreeting(null)}
                    className="py-2.5 px-3 bg-zinc-50 border border-zinc-100 hover:bg-zinc-100 text-zinc-500 rounded-[20px] font-bold text-xs cursor-pointer transition-all active:scale-95"
                  >
                    温暖收下 ✨
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveGreeting(null);
                      setActiveApp('kakaotalk');
                      setActiveRoomId(activeGreeting.memberId);
                    }}
                    className="py-2.5 px-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold text-xs rounded-[20px] shadow-sm hover:shadow-md active:scale-95 transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>去聊天 💌</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info panel Manual Modal */}
        {showInfoPanel && (
          <div 
            onClick={() => setShowInfoPanel(false)}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-5 cursor-pointer"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[32px] p-6 shadow-2xl w-full max-w-xs border border-rose-100 flex flex-col gap-4 cursor-default select-text"
            >
              <div className="text-center font-display space-y-1">
                <span className="text-3xl">📘</span>
                <h3 className="font-extrabold text-rose-950 text-sm">阿米手机使用说明</h3>
                <p className="text-[9px] text-[#1db954] font-black uppercase tracking-widest">ARMY MANUAL GUIDE</p>
              </div>

              <div className="text-stone-600 text-[11px] leading-relaxed font-semibold space-y-2.5 max-h-[250px] overflow-y-auto custom-scrollbar">
                <p>1. <strong>KakaoTalk (AI聊天)</strong>: 可挑选 7 位 BTS 成员实时聊天唠嗑。支持自动调用 AI 智能回复与离线话术机制；支持向他们进行<strong>图片发送</strong>应援；还可以在对话中接受欧巴们发来的<strong>一起听歌卡片邀请</strong>！</p>
                <p>2. <strong>아미그램 (Instagram)</strong>: 浏览 7 位成员的精美相册动态。可以<strong>双击图片</strong>触发浪漫爱心连击，或在底部发表自定义应援留言。</p>
                <p>3. <strong>Spotify (一起听歌库)</strong>: 听最火组合合单和个人成名作。支持单人播放，也可以进入<strong>一起听歌房间</strong>与正在听歌的成员进行连线同频听歌！随着音乐进度推进，成员会实时发表对于当前歌段的珍稀感悟讨论，支持触发快捷消息互动！</p>
                <p>4. <strong>每日惊喜</strong>: 每天第一次开启应用时，随机成员会在主屏触发早安/晚安的呼唤贴心问候弹窗，也可以一件跳转直接与他亲密私谈。</p>
              </div>

              <button
                type="button"
                onClick={() => setShowInfoPanel(false)}
                className="py-2.5 w-full bg-rose-500 text-white font-black text-xs rounded-2xl cursor-pointer transition-transform active:scale-95 hover:bg-rose-600 shadow-sm"
              >
                我已经明白了 💜
              </button>
            </div>
          </div>
        )}

        {/* System bottom navigation indicators */}
        <Navigation 
          activeApp={activeApp} 
          onChangeApp={(app) => {
            setActiveApp(app);
            if (app !== 'kakaotalk') setActiveRoomId(null);
          }} 
          theme={currentTheme}
        />
      </div>
    </div>
  );
}
