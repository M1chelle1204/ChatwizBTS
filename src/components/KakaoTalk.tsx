import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, ArrowLeft, Image as ImageIcon, Sparkles, AlertCircle, Music, Play, Disc } from 'lucide-react';
import { ChatRoom, SettingsState, SpotifyTrack, Message } from '../types';
import { btsMembers } from '../data';
import Avatar from './Avatar';

interface KakaoTalkProps {
  chatRooms: ChatRoom[];
  onUpdateChatRooms: React.Dispatch<React.SetStateAction<ChatRoom[]>>;
  settings: SettingsState;
  onUpdateSettings?: (settings: Partial<SettingsState>) => void;
  activeRoomId: string | null;
  onSetActiveRoomId: (id: string | null) => void;
  onOpenMusicTogether?: (track: SpotifyTrack, memberId: string) => void;
}

// Dynamic local canvas compressor for member gallery photos, keeps them tiny/fast for LocalStorage
const compressAndSetMemberAvatar = (file: File, callback: (base64: string) => void) => {
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

export default function KakaoTalk({ 
  chatRooms, 
  onUpdateChatRooms, 
  settings, 
  onUpdateSettings,
  activeRoomId,
  onSetActiveRoomId: setActiveRoomId,
  onOpenMusicTogether
}: KakaoTalkProps) {
  const [searchText, setSearchText] = useState('');
  const [inputText, setInputText] = useState('');
  const [typingMemberId, setTypingMemberId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chats' | 'friends'>('chats');
  const [editRemarkMemberId, setEditRemarkMemberId] = useState<string | null>(null);
  const [newRemarkText, setNewRemarkText] = useState('');
  const [newAvatarVal, setNewAvatarVal] = useState('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatRooms, activeRoomId, typingMemberId]);

  const activeRoom = chatRooms.find(r => r.memberId === activeRoomId);

  // Send textual user message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeRoomId) return;

    const userMsgText = inputText.trim();
    const timestampStr = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    const userMsgId = `msg_u_${Date.now()}`;

    const newMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text: userMsgText,
      timestamp: timestampStr
    };

    // Append message to active room
    onUpdateChatRooms(prev =>
      prev.map(room => {
        if (room.memberId === activeRoomId) {
          return {
            ...room,
            messages: [...room.messages, newMsg]
          };
        }
        return room;
      })
    );

    setInputText('');

    // Trigger AI response if enabled
    if (settings.autoReply) {
      setTypingMemberId(activeRoomId);

      // Gather chat history to send to server proxy
      const updatedHistory = [...(activeRoom?.messages || []), newMsg];
      
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memberId: activeRoomId,
            history: updatedHistory,
            username: settings.username,
            btsMood: settings.btsMood,
            geminiApiKey: settings.geminiApiKey
          })
        });

        const data = await response.json();
        
        // Wait briefly for natural typing pacing
        setTimeout(() => {
          if (data.text) {
            const botMsg: Message = {
              id: `msg_m_${Date.now()}`,
              sender: 'member',
              text: data.text,
              timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
            };

            onUpdateChatRooms(prev =>
              prev.map(room => {
                if (room.memberId === activeRoomId) {
                  return {
                    ...room,
                    messages: [...room.messages, botMsg]
                  };
                }
                return room;
              })
            );
          }
          setTypingMemberId(null);
        }, 1200);

      } catch (err) {
        console.error("Fetch chatbot error:", err);
        setTypingMemberId(null);
      }
    }
  };

  // User simulated image upload sending message
  const handleImageSend = (imageUrl: string) => {
    if (!activeRoomId) return;
    const timestampStr = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

    const newMsg: Message = {
      id: `msg_img_${Date.now()}`,
      sender: 'user',
      text: '[图片]',
      image: imageUrl,
      timestamp: timestampStr
    };

    onUpdateChatRooms(prev =>
      prev.map(room => {
        if (room.memberId === activeRoomId) {
          return {
            ...room,
            messages: [...room.messages, newMsg]
          };
        }
        return room;
      })
    );

    // Mock quick ecstatic member reply to picture
    if (settings.autoReply) {
      setTypingMemberId(activeRoomId);
      setTimeout(() => {
        const textOptions = [
          "哇！阿米发我的这张照片太好看啦！我要把它存下来当壁纸！💜✨",
          "大发！怎么这么会拍呀！感觉今天的疲惫一瞬间全都没了，谢谢你哦！🐨",
          "噢！我的天呐！照片太棒了，看到这个我直接给打100分！哈哈哈 🐹",
          "拍得很有温度。这就是在阿米眼中的日常风景吗？真好 🐱",
          "好看！期待下一次能一起去看风景拍合照哦！🐿️☀️",
          "阿米真棒！看到这个让我想唱一首歌给你听了呢 🎤🐣",
          "浪漫。我的黑白相机构图也想借鉴这个。期待听到更多好消息 🐯",
          "简直完美！🐰 跟着感觉冲，今天也是最爱阿米的一天！"
        ];
        const randomReply = textOptions[Math.floor(Math.random() * textOptions.length)];

        const botMsg: Message = {
          id: `msg_m_${Date.now()}`,
          sender: 'member',
          text: randomReply,
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        };

        onUpdateChatRooms(prev =>
          prev.map(room => {
            if (room.memberId === activeRoomId) {
              return {
                ...room,
                messages: [...room.messages, botMsg]
              };
            }
            return room;
          })
        );
        setTypingMemberId(null);
      }, 1500);
    }
  };

  // Convert uploaded image file locally to data URL object
  const handleAttachmentFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          handleImageSend(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save customized remark
  const handleSaveRemark = () => {
    if (!editRemarkMemberId || !newRemarkText.trim() || !newAvatarVal.trim()) return;
    onUpdateChatRooms(prev =>
      prev.map(room => {
        if (room.memberId === editRemarkMemberId) {
          return { 
            ...room, 
            remark: newRemarkText.trim(),
            avatar: newAvatarVal.trim()
          };
        }
        return room;
      })
    );
    setEditRemarkMemberId(null);
    setNewRemarkText('');
    setNewAvatarVal('');
  };

  // Filtered chats lists
  const filteredChatRooms = chatRooms.filter(room => {
    const rawName = btsMembers.find(m => m.id === room.memberId)?.name || 'Member';
    const dispName = room.remark || rawName;
    return dispName.toLowerCase().includes(searchText.toLowerCase());
  });

  return (
    <div className="w-full h-full bg-[#fce7f3]/30 select-none flex flex-col relative overflow-hidden">
      
      {/* Active Chat Room View Screen */}
      {activeRoomId && activeRoom ? (
        <div className="absolute inset-0 bg-[#b2c7da] flex flex-col z-20">
          
          {/* Chat room header */}
          <div className="bg-[#a2b9cf] px-4 py-2.5 border-b border-black/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveRoomId(null)}
                className="p-1 text-slate-800 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
              </button>
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1">
                  <span>{activeRoom.remark || activeRoom.memberName}</span>
                  <span className="text-[10px] bg-yellow-400 text-yellow-900 font-bold px-1 rounded">PRO</span>
                </h3>
                <p className="text-[9px] text-slate-600 font-bold">KakaoTalk • 实时应答</p>
              </div>
            </div>

            {/* Quick action button */}
            <button
              type="button"
              onClick={() => {
                setEditRemarkMemberId(activeRoom.memberId);
                setNewRemarkText(activeRoom.remark || activeRoom.memberName);
                setNewAvatarVal(activeRoom.avatar);
              }}
              className="text-[11px] font-bold text-slate-850 bg-white/80 hover:bg-white/95 px-2.5 py-1.5 rounded-xl border border-white/50 cursor-pointer flex items-center gap-1.5 tracking-tight shadow-sm active:scale-95 transition-all"
            >
              <span>编辑名片</span>
              <span>✏️</span>
            </button>
          </div>

          {/* Chat Message Lists */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar select-text bg-[#b2c7da]">
            
            {/* Disclaimer bubble warning block */}
            <div className="w-full flex justify-center py-1 select-none">
              <div className="bg-black/10 text-white text-[9px] font-bold px-3 py-1 rounded-full border border-white/5 tracking-tight flex items-center gap-1 max-w-[85%] text-center">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>加密通讯已启动，当前对话均在本地离线安全缓存。</span>
              </div>
            </div>

            {activeRoom.messages.map((msg) => {
              const isMe = msg.sender === 'user';
              
              if (isMe) {
                return (
                  <div key={msg.id} className="flex flex-col items-end gap-1 select-text">
                    <div className="flex items-end gap-1.5 justify-end w-full max-w-[85%] ml-auto">
                      <span className="text-[9px] text-slate-600 font-bold select-none">{msg.timestamp}</span>
                      <div className="bg-[#fee500] text-slate-900 px-3.5 py-2.5 rounded-[18px] rounded-tr-[4px] border border-[#f5cc00] shadow-sm text-xs font-semibold leading-relaxed max-w-[80%] relative">
                        {msg.image ? (
                          <img
                            src={msg.image}
                            alt="upload"
                            className="rounded-xl max-w-full h-auto object-cover max-h-48 border border-black/5"
                          />
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={msg.id} className="flex gap-2.5 select-text">
                    {/* Avatar */}
                    <Avatar avatar={activeRoom.avatar} className="w-10 h-10 shadow-sm border border-black/5" fallbackSizeClass="text-2xl" />

                    <div className="flex flex-col gap-1 items-start max-w-[70%]">
                      {/* Member title */}
                      <span className="text-[10px] text-slate-700 font-extrabold select-none mb-0.5">
                        {activeRoom.remark || activeRoom.memberName}
                      </span>
                      
                      <div className="flex items-end gap-1.5">
                        
                        {/* Music Share Card Block is customized */}
                        {msg.isMusicShare && msg.musicTrack ? (
                          <div className="bg-white rounded-[20px] rounded-tl-[4px] border border-stone-200/80 shadow-md p-3.5 w-60 flex flex-col gap-3 relative overflow-hidden select-none">
                            {/* Decorative glow badge */}
                            <div className="absolute right-0 top-0 bg-green-500 text-white text-[8px] font-extrabold px-2 py-0.5 rounded-bl-lg flex items-center gap-0.5">
                              <Music className="w-2.5 h-2.5" />
                              <span> 一同听歌 💚</span>
                            </div>

                            {/* Main music info card */}
                            <div className="flex gap-3 items-center">
                              {/* Glowing Art disk */}
                              <div 
                                className="w-12 h-12 rounded-lg flex items-center justify-center relative shadow-sm overflow-hidden shrink-0"
                                style={{ background: msg.musicTrack.albumArt }}
                              >
                                <Play className="w-4 h-4 text-white fill-white/80" />
                              </div>
                              <div className="space-y-0.5 flex-1 min-w-0">
                                <h4 className="text-xs font-extrabold text-stone-900 truncate">{msg.musicTrack.title}</h4>
                                <p className="text-[10px] text-stone-400 font-bold truncate">{msg.musicTrack.artist} • {msg.musicTrack.album}</p>
                              </div>
                            </div>

                            {/* Listen together CTA Button */}
                            <button
                              type="button"
                              onClick={() => {
                                if (onOpenMusicTogether && msg.musicTrack) {
                                  onOpenMusicTogether(msg.musicTrack, activeRoom.memberId);
                                }
                              }}
                              className="py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 hover:shadow-md text-white font-black text-[11px] rounded-[14px] flex items-center justify-center gap-1.5 transition-all select-none cursor-pointer active:scale-95"
                            >
                              <Play className="w-3.5 h-3.5 fill-white stroke-none" />
                              <span>点击接受邀请，一起听 🎧</span>
                            </button>
                          </div>
                        ) : (
                          // Standard Text Bubble
                          <div className="bg-white text-stone-800 px-3.5 py-2.5 rounded-[18px] rounded-tl-[4px] shadow-sm text-xs font-semibold leading-relaxed max-w-[100%] relative border border-white">
                            <p className="whitespace-pre-wrap">{msg.text.replace(/阿米/g, settings.username)}</p>
                          </div>
                        )}

                        <span className="text-[9px] text-slate-600 font-bold select-none shrink-0">{msg.timestamp}</span>
                      </div>
                    </div>
                  </div>
                );
              }
            })}

            {/* Simulated interactive Typing status banner bubble */}
            {typingMemberId === activeRoomId && (
              <div className="flex gap-2.5 select-none animate-pulse">
                <Avatar avatar={activeRoom.avatar} className="w-10 h-10 shadow-sm border border-black/5" fallbackSizeClass="text-2xl" />
                <div className="flex flex-col gap-1 items-start">
                  <span className="text-[10px] text-slate-700 font-extrabold mb-0.5">
                    {activeRoom.remark || activeRoom.memberName}
                  </span>
                  <div className="bg-white px-4 py-2.5 rounded-[18px] rounded-tl-[4px] shadow-sm text-xs font-bold text-stone-400 flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                    <span>对方正在输入... 💬</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Action text compose bar */}
          <div className="p-3 bg-white/95 border-t border-slate-300 backdrop-blur-md flex gap-2 shrink-0">
            <button
              onClick={() => document.getElementById('chat-image-upload')?.click()}
              type="button"
              className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer border border-slate-200/50"
              title="发送图片"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <input
              id="chat-image-upload"
              type="file"
              accept="image/*"
              onChange={handleAttachmentFile}
              className="hidden"
            />

            <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-stone-50 border border-stone-200 px-4 py-2.5 rounded-2xl text-xs font-semibold focus:outline-none focus:border-rose-300"
                placeholder={`向 ${activeRoom.remark || activeRoom.memberName} 发送消息...`}
              />
              <button
                type="submit"
                className="w-10 h-10 rounded-2xl bg-[#fee500] hover:bg-[#e6cf00] hover:shadow-sm text-yellow-900 border border-[#fee500] flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {/* Dynamic Edit Profile & Avatar Modal */}
      {editRemarkMemberId && (
        <div 
          onClick={() => {
            setEditRemarkMemberId(null);
            setNewAvatarVal('');
          }}
          className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm z-30 flex items-center justify-center p-4 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[32px] p-5 shadow-2xl w-full max-w-[290px] border border-rose-100 flex flex-col gap-4 cursor-default animate-in zoom-in-95 duration-200"
          >
            <div>
              <h3 className="font-extrabold text-sm text-rose-950 flex items-center gap-1.5">
                <span>编辑成员资料</span>
                <span className="text-[10px] bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded-full font-black">Kakao Talk</span>
              </h3>
              <p className="text-[10px] text-stone-400 font-semibold mt-0.5">更改本地显示的成员聊天昵称与社交头像。</p>
            </div>

            {/* Edit Remark Nickname */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-stone-500 block">
                成员备注名 (Name Remark)
              </label>
              <input
                type="text"
                value={newRemarkText}
                onChange={(e) => setNewRemarkText(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 px-3.5 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-rose-300"
                placeholder="请输入备用昵称"
              />
            </div>

            {/* Edit Avatar Picker */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-extrabold text-stone-500 block">
                  成员头像 (Select Avatar)
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-stone-400 text-[9px] font-bold">当前预览：</span>
                  <Avatar avatar={newAvatarVal} className="w-5 h-5 rounded-full border border-stone-250" fallbackSizeClass="text-[10px]" />
                </div>
              </div>
              
              {/* Avatar Pool list */}
              <div className="grid grid-cols-6 gap-1 bg-stone-50 p-2 rounded-xl border border-stone-150">
                {['🐨', '🐹', '🐱', '🐿️', '🐣', '🐻', '🐰', '🐯', '🌟', '💜', '👑', '🎤'].map((emoji) => (
                  <button
                    type="button"
                    key={emoji}
                    onClick={() => setNewAvatarVal(emoji)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all border cursor-pointer ${
                      newAvatarVal === emoji
                        ? 'bg-rose-100 border-rose-300 scale-110 shadow-sm font-bold'
                        : 'bg-transparent border-transparent hover:bg-stone-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Custom Image Upload for Member Avatar */}
              <div className="bg-amber-50/40 border border-amber-200/50 p-2.5 rounded-xl space-y-1.5">
                <label className="text-[9px] font-black text-amber-900/80 block uppercase tracking-wider">
                  🌌 上传真实相册图片 (Custom Photo)
                </label>
                <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-lg text-[10px] font-black transition-all cursor-pointer shadow-sm w-full justify-center">
                  <ImageIcon className="w-3 h-3" />
                  <span>打开相册选图</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        compressAndSetMemberAvatar(file, (base64) => {
                          setNewAvatarVal(base64);
                        });
                      }
                    }}
                  />
                </label>
              </div>

              {/* Custom input or picker emoji option */}
              <div className="space-y-1 mt-1">
                <label className="text-[8px] font-extrabold text-stone-400 block">
                  或手动输入任何 Emoji 表情：
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={newAvatarVal.startsWith('data:image') ? '' : newAvatarVal}
                  onChange={(e) => setNewAvatarVal(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-rose-300"
                  placeholder="手动粘贴 Emoji"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => {
                  setEditRemarkMemberId(null);
                  setNewAvatarVal('');
                }}
                className="py-2 px-3 bg-stone-100 font-bold border border-stone-200 text-stone-500 rounded-xl text-xs cursor-pointer active:scale-95 transition-all"
              >
                撤销
              </button>
              <button
                type="button"
                onClick={handleSaveRemark}
                className="py-2 px-3 bg-rose-500 text-white font-bold rounded-xl text-xs cursor-pointer active:scale-95 transition-all flex items-center justify-center shadow-sm"
              >
                保存确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Primary Rooms List Screen */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Yellow/Pink header */}
        <div className="bg-white border-b border-rose-100/60 sticky top-0 px-4 py-3 shrink-0">
          <div className="flex justify-between items-center mb-2.5">
            <h2 className="text-xl font-black text-rose-950 font-display flex items-center gap-1.5 select-none">
              <span className="bg-[#fee500] text-amber-950 px-2 py-0.5 rounded-xl border border-amber-200/50">카카오톡</span>
              <span className="text-[10px] uppercase font-serif font-extrabold tracking-widest text-stone-400">CHAT</span>
            </h2>

            {/* Small status line */}
            <div className="text-[10px] font-black text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
              💜 阿米专属连线
            </div>
          </div>

          {/* Tab switches */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-100 rounded-2xl select-none mb-3">
            <button
              type="button"
              onClick={() => setActiveTab('chats')}
              className={`py-1.5 rounded-xl font-bold text-xs cursor-pointer text-center select-none transition-all ${
                activeTab === 'chats' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              聊天对话 ({filteredChatRooms.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('friends')}
              className={`py-1.5 rounded-xl font-bold text-xs cursor-pointer text-center select-none transition-all ${
                activeTab === 'friends' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              私人体香好友 (7)
            </button>
          </div>

          {/* Search box input section */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200/80 rounded-2xl pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-rose-300"
              placeholder="搜索防弹少年团成员..."
            />
          </div>
        </div>

        {/* Dynamic Lists Content Frame */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2 bg-stone-50/50">
          
          {activeTab === 'chats' ? (
            <div className="flex flex-col gap-1.5">
              {filteredChatRooms.map((room) => {
                const lastMsg = room.messages[room.messages.length - 1];
                const member = btsMembers.find(m => m.id === room.memberId);
                const dispName = room.remark || room.memberName;

                return (
                  <button
                    type="button"
                    key={room.memberId}
                    onClick={() => setActiveRoomId(room.memberId)}
                    className="flex gap-3.5 items-center p-3.5 bg-white border border-rose-100/30 rounded-2xl hover:bg-rose-50/30 transition-all text-left cursor-pointer w-full group relative shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
                  >
                    {/* Avatar */}
                    <Avatar avatar={room.avatar} className="w-12 h-12 shadow-inner group-hover:scale-105 transition-transform" fallbackSizeClass="text-3xl" />

                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="font-extrabold text-xs text-stone-800 tracking-tight group-hover:text-rose-600 transition-colors">
                          {dispName}
                        </h4>
                        <span className="text-[9px] text-stone-400 font-bold">{lastMsg ? lastMsg.timestamp : '暂无'}</span>
                      </div>
                      
                      {/* Last message preview */}
                      <p className="text-[10px] text-stone-400 font-bold truncate">
                        {lastMsg ? (lastMsg.image ? '[이미지 图片]' : lastMsg.text.replace(/阿米/g, settings.username)) : '暂无对话消息'}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-sm border border-yellow-300 select-none"></div>
                  </button>
                );
              })}

              {!filteredChatRooms.length && (
                <div className="py-12 text-center select-none space-y-1">
                  <p className="text-stone-400 text-xs font-semibold">没有查找到相关的成员对话...</p>
                  <p className="text-[10px] text-rose-300 font-extrabold">试一下搜索其他拼写名字吧 💜</p>
                </div>
              )}
            </div>
          ) : (
            // Friends List Grid Layout
            <div className="flex flex-col gap-1.5">
              {/* User Self Profile card at the top */}
              <div className="flex justify-between items-center p-3 bg-rose-50/50 border border-rose-100/50 rounded-2xl mb-1 text-left shadow-sm">
                <div className="flex gap-3 items-center min-w-0">
                  <Avatar avatar={settings.avatar} className="w-11 h-11 border border-rose-100/80 shadow-sm shrink-0" fallbackSizeClass="text-2xl" />
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs text-stone-800 flex items-center gap-1.5">
                      <span>{settings.username} (你)</span>
                      <span className="bg-rose-100 text-rose-600 text-[8px] px-1 rounded-sm font-black">MY</span>
                    </h4>
                    <p className="text-[9px] text-stone-400 font-bold truncate max-w-[140px] mt-0.5">
                      {settings.statusMessage || 'Purple U 💜'}
                    </p>
                  </div>
                </div>
                <div className="text-[9px] text-stone-400 font-bold bg-white px-2 py-1 rounded-lg border border-stone-200">
                  可于设置中更改
                </div>
              </div>

              {btsMembers
                .filter(m => m.name.toLowerCase().includes(searchText.toLowerCase()))
                .map((member) => {
                  const matchingRoom = chatRooms.find(r => r.memberId === member.id);
                  const dispName = matchingRoom?.remark || member.name;
                  const dispAvatar = matchingRoom?.avatar || member.avatar;

                  return (
                    <div
                      key={member.id}
                      className="flex justify-between items-center p-3.5 bg-white border border-rose-100/30 rounded-2xl hover:bg-rose-50/40 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
                    >
                      <div className="flex gap-3 items-center">
                        <Avatar avatar={dispAvatar} className="w-11 h-11" fallbackSizeClass="text-2xl" />
                        <div>
                          <h4 className="font-extrabold text-xs text-stone-800">
                            {dispName} ({member.koreanName})
                          </h4>
                          <p className="text-[9px] text-stone-400 font-bold truncate max-w-[180px]">
                            {member.bio}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveRoomId(member.id)}
                        className="py-1.5 px-3.5 bg-yellow-400 text-yellow-950 border border-yellow-300 font-black text-[10px] rounded-xl cursor-pointer hover:shadow-sm active:scale-95 transition-transform"
                      >
                        聊天 💌
                      </button>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
