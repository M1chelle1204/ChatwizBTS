import React, { useState } from 'react';
import { Sparkles, Trash2, Check, Smile, User, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { SettingsState } from '../types';
import Avatar from './Avatar';

interface SettingsProps {
  settings: SettingsState;
  onUpdateSettings: (settings: Partial<SettingsState>) => void;
  onResetApp: () => void;
}

const AVATAR_POOL = ['💜', '🌟', '🌸', '🐰', '🐣', '🐻', '🐨', '🐿️', '🐱', '🐹', '🧁', '🎵'];

// Dynamic local canvas compressor for high-resolution gallery pictures, ensuring under localStorage limit
const compressAndSetAvatar = (file: File, callback: (base64: string) => void) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 120; // 120x120 is perfect and sharp for avatar, keeps it tiny/fast
      const MAX_HEIGHT = 120;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        callback(dataUrl);
      } else {
        callback(e.target?.result as string);
      }
    };
    img.src = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

export default function SettingsView({ settings, onUpdateSettings, onResetApp }: SettingsProps) {
  const [typedName, setTypedName] = useState(settings.username);
  const [typedStatus, setTypedStatus] = useState(settings.statusMessage);
  const [typedApiKey, setTypedApiKey] = useState(settings.geminiApiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSaveAlert, setShowSaveAlert] = useState(false);

  const handleSave = () => {
    onUpdateSettings({
      username: typedName.trim() || '阿米',
      statusMessage: typedStatus.trim() || 'Purple U 💜',
      geminiApiKey: typedApiKey.trim(),
    });
    setShowSaveAlert(true);
    setTimeout(() => setShowSaveAlert(false), 2000);
  };

  return (
    <div className="w-full h-full bg-stone-50 overflow-hidden flex flex-col relative select-none">
      {/* Title Header */}
      <div className="bg-white px-5 py-4 border-b border-rose-100/60 sticky top-0 shrink-0">
        <h2 className="text-lg font-black text-rose-950 font-display flex items-center gap-1.5">
          <Sparkles className="w-5 h-5 text-rose-500 fill-rose-100" />
          <span>阿米手机设置</span>
        </h2>
        <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-0.5">
          ARMY SIMULATOR SETTINGS
        </p>
      </div>

      {/* Main Settings Body */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 custom-scrollbar">
        
        {/* Save Success Banner */}
        {showSaveAlert && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-2.5 rounded-2xl flex items-center gap-2 font-bold animate-bounce shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>个人资料已成功同步 💜</span>
          </div>
        )}

        {/* Profile Section */}
        <div className="bg-white border border-rose-100/50 p-4 rounded-3xl space-y-4 shadow-sm">
          <h3 className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-rose-400" />
            <span>个人名片 (My Badge)</span>
          </h3>

          {/* Edit username */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-stone-600 block">
              阿米网名 (ARMY Pen Name)
            </label>
            <input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 px-3.5 py-2 rounded-2xl text-xs font-semibold focus:outline-none focus:border-rose-300"
              placeholder="请输入您的昵称"
            />
          </div>

          {/* Edit status msg */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-stone-600 block">
              个性签名 (Status Message)
            </label>
            <input
              type="text"
              value={typedStatus}
              onChange={(e) => setTypedStatus(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 px-3.5 py-2 rounded-2xl text-xs font-semibold focus:outline-none focus:border-rose-300"
              placeholder="请输入您的个性签名"
            />
          </div>

          {/* Avatar selector */}
          <div className="space-y-3 pt-1">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-stone-600 block">
                挑选个性头像 (Select Avatar Emoji)
              </label>
              <span className="text-[9px] text-stone-400 font-extrabold">支持自定义相册图片</span>
            </div>
            
            <div className="flex flex-wrap gap-1.5 justify-between bg-stone-50/50 p-2 rounded-2xl border border-stone-100">
              {AVATAR_POOL.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => onUpdateSettings({ avatar: emoji })}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all border cursor-pointer ${
                    settings.avatar === emoji
                      ? 'bg-rose-100 border-rose-300 scale-110 shadow-sm'
                      : 'bg-white border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Custom Album Image Upload Component Block */}
            <div className="bg-rose-50/40 border border-rose-100/60 p-3 rounded-2xl space-y-2">
              <label className="text-[10px] font-extrabold text-rose-950 block uppercase tracking-wider">
                🌌 从手机相册选择自定义头像 (Choose from Album)
              </label>
              
              <div className="flex items-center gap-3">
                <div className="shrink-0 relative group">
                  <Avatar 
                    avatar={settings.avatar} 
                    className="w-12 h-12 rounded-full border border-rose-200 shadow-sm"
                    fallbackSizeClass="text-2xl"
                  />
                  <div className="absolute inset-0 bg-black/10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ImageIcon className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>上传真实相册图片</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          compressAndSetAvatar(file, (base64) => {
                            onUpdateSettings({ avatar: base64 });
                          });
                        }
                      }}
                    />
                  </label>
                  <p className="text-[8px] text-stone-400 font-extrabold mt-1">
                    系统会自动优化压缩并存储于本地 Cache 里。
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full py-2.5 bg-gradient-to-r from-rose-400 to-pink-500 hover:shadow-md text-white font-black text-xs rounded-2xl transition-all cursor-pointer shadow-sm active:scale-95"
          >
            保存并同步个人名片
          </button>
        </div>

        {/* Gemini API Key Section */}
        <div className="bg-white border border-rose-100/50 p-4 rounded-3xl space-y-4 shadow-sm">
          <h3 className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-500 fill-purple-100 animate-pulse" />
            <span>智能聊天密钥 (Gemini API Key)</span>
          </h3>
          
          <div className="space-y-1.5">
            <p className="text-[10px] text-stone-400 font-semibold leading-relaxed">
              输入您的 Gemini API Key 即可启动真实的 AI 智能对话，防弹成员会感知您设置的心情、您的网名，并给出高度温存的口语化回答。
            </p>
            <div className="relative flex items-center mt-2">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={typedApiKey}
                onChange={(e) => setTypedApiKey(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 pl-3.5 pr-12 py-2.5 rounded-2xl text-xs font-mono font-semibold focus:outline-none focus:border-rose-300"
                placeholder="AIzaSy... 或粘贴 API Key"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3.5 text-rose-500 hover:text-rose-600 transition-colors text-[10px] font-black cursor-pointer"
              >
                {showApiKey ? '隐藏' : '显示'}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center bg-stone-50 px-3py-2 py-1.5 px-2.5 rounded-xl border border-stone-100 text-[10px] font-semibold text-stone-500">
            <span>实时连接状态</span>
            {settings.geminiApiKey ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <span>真实 AI 已接入 💜</span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              </span>
            ) : (
              <span className="text-amber-600 font-bold">离线模拟对话 (Built-in)</span>
            )}
          </div>
          
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:shadow-md text-white font-black text-xs rounded-2xl transition-all cursor-pointer shadow-sm active:scale-95 text-center block"
          >
            保存并激活 API 密钥
          </button>
        </div>

        {/* AI Chat Bot Preferences */}
        <div className="bg-white border border-rose-100/50 p-4 rounded-3xl space-y-4 shadow-sm">
          <h3 className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-1">
            <Smile className="w-3.5 h-3.5 text-rose-400" />
            <span>模拟聊天参数</span>
          </h3>

          {/* Toggle AutoReply */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <p className="text-xs font-bold text-rose-950">自动呼叫 AI 回复</p>
              <p className="text-[10px] text-stone-400 font-semibold">
                开启后，BTS 成员每次收到消息会秒回。
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoReply}
                onChange={() => onUpdateSettings({ autoReply: !settings.autoReply })}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
            </label>
          </div>

          {/* Selector for bts moods */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-stone-600 block">
              成员今日状态心情 (BTS Member Mood)
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['happy', 'gentle', 'tired', 'excited'] as const).map((mood) => {
                const labelMap = {
                  happy: '开心 🐣',
                  gentle: '温柔 ☕',
                  tired: '略疲惫 💤',
                  excited: '超级兴奋 🔥'
                };
                return (
                  <button
                    type="button"
                    key={mood}
                    onClick={() => onUpdateSettings({ btsMood: mood })}
                    className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all text-center cursor-pointer ${
                      settings.btsMood === mood
                        ? 'bg-rose-50 border-rose-300 text-rose-600 font-bold'
                        : 'bg-stone-50 border-stone-150 text-stone-500 hover:bg-stone-100'
                    }`}
                  >
                    {labelMap[mood]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* System parameters and reset */}
        <div className="bg-white border border-rose-100/50 p-4 rounded-3xl space-y-4 shadow-sm">
          <h3 className="text-xs font-black uppercase text-rose-900/40 tracking-wider">
            系统与维护 (Maintainance)
          </h3>

          <div className="text-[11px] text-stone-400 font-semibold space-y-1">
            <p>• 提示：所有聊天和设置数据仅保存在您的本地 localStorage 中，不作外传。</p>
            <p>• 如果模拟器显示卡顿、消息队列阻塞，可执行重置。</p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (confirm('确认清空所有聊天记录、Instagram 点赞并恢复默认设置吗？')) {
                onResetApp();
              }
            }}
            className="w-full py-2.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 font-black text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>彻底格式化手机模拟器</span>
          </button>
        </div>
        
        <div className="h-6"></div>
      </div>
    </div>
  );
}
