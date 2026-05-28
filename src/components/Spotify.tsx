import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Music, HelpCircle, Users, Send, Volume2, Disc, ArrowLeft, Heart, RotateCcw, Upload } from 'lucide-react';
import { SpotifyTrack, BTSMember, SettingsState } from '../types';
import { btsMembers, spotifyTracks } from '../data';

interface SpotifyProps {
  settings: SettingsState;
  onUpdateSettings?: (settings: Partial<SettingsState>) => void;
  togetherSession: {
    memberId: string;
    track: SpotifyTrack;
  } | null;
  onSetTogetherSession: (session: { memberId: string; track: SpotifyTrack } | null) => void;
  activeApp: string;
}

// Map moment reactions (seconds -> dialogue)
const MEMBER_SONG_REACTIONS: Record<string, Record<string, { time: number; text: string }[]>> = {
  jungkook: {
    seven: [
      { time: 3, text: "来啦！这首《Seven》我天天单曲循环！阿米也要跟着节奏晃动哦！🐰" },
      { time: 10, text: "每一次听到这个贝斯节奏，拳击课打沙包都更有力气了呢，哈哈！🥊" },
      { time: 25, text: "唱这句 'Monday Tuesday Wednesday Thursday Friday Saturday Sunday...' 每天都想陪着你！" },
      { time: 45, text: "阿米，我在这里的高音音色喜欢吗？为了录好这首歌，我喝掉了好几瓶柠檬水呢 🐰💜" }
    ],
    dynamite: [
      { time: 5, text: "哇哦！是咱们组合的经典曲子！一听就感觉在夏日阳光下，阿米我们一起来跳编舞！🐰" },
      { time: 20, text: "Light it up like dynamite! 🔥 跟着旋律起飞吧！" }
    ]
  },
  jimin: {
    likecrazy: [
      { time: 3, text: "阿米，选了我这首《Like Crazy》一起听呀，智旻真的太开心了，感动 🐥" },
      { time: 12, text: "在录这首歌的时候，总是想着阿米如果听到了，会不会也在房间里跟着旋转呢？" },
      { time: 28, text: "这里的合成器音效非常梦幻，闭上眼睛就像抱着你穿梭在霓虹光影里。🐣" },
      { time: 45, text: "不要太疲惫哦。不管世界有多少喧嚣，咱们就安心享受在这首曲子里吧 🐥💛" }
    ]
  },
  rm: {
    wildflower: [
      { time: 4, text: "我用《野花》来表达那些绚丽背后的安宁。很高兴 ${username} 愿意坐下来听一首长歌。🌿🐨" },
      { time: 15, text: "‘等一切消散之后，我会以野花的姿态留下来。’ 这是写给你们也是写给我的坦白。" },
      { time: 35, text: "听，这里的交响乐和风声，就像我们曾在演唱会里，一起度过的那些深夜一样震撼 🎨" }
    ]
  },
  jin: {
    astronaut: [
      { time: 3, text: "叮咚！帅气使者金硕珍降落！《The Astronaut》是写给我的宇宙——也就是阿米！🐹🚀" },
      { time: 15, text: "这里的歌词太美了，克里斯哥(Coldplay)帮我伴奏的时候，我都觉得我是个真正的太空人了！" },
      { time: 30, text: "阿米，哪怕在最黑的宇宙里，只要朝着你的紫色光芒飞去，我就绝对不会迷路 ✨💖" }
    ]
  },
  suga: {
    haegeum: [
      { time: 4, text: "《解禁》。这首歌节奏很烈，阿米听了是不是有一种释放和解脱的痛快感？🐱🎹" },
      { time: 18, text: "打破那些无形的信息禁锢，只用直觉去倾听，这才是我做这首曲子的意图。" },
      { time: 35, text: "这里的大鼓和传统笛乐碰撞，怎么样？是不是很有我闵玧其特有的野性骄傲？" }
    ]
  },
  jhope: {
    onthestreet: [
      { time: 3, text: "啊哈！J-hope 在街角呼唤阿米！这首歌感觉像在春风拂面的林荫大道上惬意散步 🐿️☀️" },
      { time: 15, text: "在曲中融入了口哨声 and J. Cole 哥的说唱，真的是我非常酷的一场踏实寻梦！" },
      { time: 30, text: "只要和 ${username} 走同一条路，哪里的街口都是紫金色的灿烂阳光呢 ✨🐿️" }
    ]
  },
  v: {
    slowdancing: [
      { time: 3, text: "浪漫萨克斯和微热的海风。阿米，我们可以慢吞吞地在这里跳一首漫步圆舞曲 🐻🎷" },
      { time: 15, text: "在录像带质感里流淌的，就是我想和你们共度的相儒以沫的日子啊。" },
      { time: 32, text: "听... 伴奏里柔柔的长笛，像不像是泰亨在耳边吹出的一声轻轻的长叹？做个好梦 🐻💤" }
    ]
  }
};

export default function Spotify({ settings, togetherSession, onSetTogetherSession, activeApp }: SpotifyProps) {
  const [activeTab, setActiveTab] = useState<'library' | 'together'>('library');
  const [tracksList, setTracksList] = useState<SpotifyTrack[]>(spotifyTracks);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack>(spotifyTracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(75);
  const [likedSongIds, setLikedSongIds] = useState<string[]>(['dynamite', 'springday']);
  const [togetherMessages, setTogetherMessages] = useState<{ sender: 'user' | 'member'; text: string }[]>([]);
  const [showInviteSheet, setShowInviteSheet] = useState(false);

  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const commentIndexRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play controls
  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
  };

  // Upload custom song
  const handleAudioUpload = (file: File) => {
    const audioUrl = URL.createObjectURL(file);
    let title = file.name;
    let artist = "本地上传 (My Upload)";
    
    const dotIdx = file.name.lastIndexOf('.');
    const cleanName = dotIdx !== -1 ? file.name.substring(0, dotIdx) : file.name;
    const parts = cleanName.split('-');
    if (parts.length > 1) {
      artist = parts[0].trim();
      title = parts.slice(1).join('-').trim();
    } else {
      title = cleanName;
    }
    
    const gradients = [
      "linear-gradient(135deg, #10b981 10%, #059669 90%)",
      "linear-gradient(135deg, #6366f1 10%, #4f46e5 90%)",
      "linear-gradient(135deg, #ec4899 10%, #db2777 90%)",
      "linear-gradient(135deg, #f59e0b 10%, #d97706 90%)",
      "linear-gradient(135deg, #3b82f6 10%, #2563eb 90%)",
      "linear-gradient(135deg, #8b5cf6 10%, #7c3aed 90%)",
    ];
    const randomArt = gradients[Math.floor(Math.random() * gradients.length)];
    
    const newTrack: SpotifyTrack = {
      id: `uploaded_${Date.now()}`,
      title,
      artist,
      album: "我的私人曲库",
      albumArt: randomArt,
      duration: 180, // initial estimate, will be updated to exact duration once loaded
      audioUrl: audioUrl,
      energy: "chill"
    };
    
    setTracksList(prev => [newTrack, ...prev]);
    setCurrentTrack(newTrack);
    setProgress(0);
    setIsPlaying(true);
    
    if (togetherSession) {
      onSetTogetherSession({
        memberId: togetherSession.memberId,
        track: newTrack
      });
    }
  };

  // Skip tracks
  const handleNextTrack = () => {
    const idx = tracksList.findIndex(t => t.id === currentTrack.id);
    const nextIdx = (idx + 1) % tracksList.length;
    setCurrentTrack(tracksList[nextIdx]);
    setProgress(0);
    setIsPlaying(true);
    if (togetherSession) {
      onSetTogetherSession({
        memberId: togetherSession.memberId,
        track: tracksList[nextIdx]
      });
    }
  };

  const handlePrevTrack = () => {
    const idx = tracksList.findIndex(t => t.id === currentTrack.id);
    const prevIdx = idx === 0 ? tracksList.length - 1 : idx - 1;
    setCurrentTrack(tracksList[prevIdx]);
    setProgress(0);
    setIsPlaying(true);
    if (togetherSession) {
      onSetTogetherSession({
        memberId: togetherSession.memberId,
        track: tracksList[prevIdx]
      });
    }
  };

  const toggleLikeSong = (trackId: string) => {
    setLikedSongIds(prev => 
      prev.includes(trackId) ? prev.filter(id => id !== trackId) : [...prev, trackId]
    );
  };

  // Audio HTML5 setup
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => {
      setProgress(Math.floor(audio.currentTime));
    };
    
    const handleLoadedMetadata = () => {
      if (currentTrack.audioUrl) {
        setTracksList(prev => prev.map(t => {
          if (t.id === currentTrack.id) {
            return { ...t, duration: Math.floor(audio.duration || 180) };
          }
          return t;
        }));
        setCurrentTrack(prev => ({ ...prev, duration: Math.floor(audio.duration || 180) }));
      }
    };
    
    const handleEnded = () => {
      handleNextTrack();
    };
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, tracksList]);

  // Sync actual playing and volume statuses
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (currentTrack.audioUrl) {
      if (audio.src !== currentTrack.audioUrl) {
        audio.src = currentTrack.audioUrl;
        audio.load();
      }
      
      if (isPlaying) {
        audio.play().catch(err => {
          console.warn("Autoplay / audio play was prevented by browser:", err);
          setIsPlaying(false);
        });
      } else {
        audio.pause();
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  // Sync volume state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Manage manual progress ticking loop (only for preset non-playable mock songs)
  useEffect(() => {
    if (currentTrack.audioUrl) {
      if (progressInterval.current) clearInterval(progressInterval.current);
      return;
    }

    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        setProgress(p => {
          if (p >= currentTrack.duration) {
            handleNextTrack();
            return 0;
          }
          return p + 1;
        });
      }, 1000);
    } else {
      if (progressInterval.current) clearInterval(progressInterval.current);
    }

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isPlaying, currentTrack, tracksList]);

  // Handle redirect together session from outside (KakaoTalk invitation link click)
  useEffect(() => {
    if (togetherSession) {
      // Find if we have a locally modified version with real audio loaded
      const localVersion = tracksList.find(t => t.id === togetherSession.track.id);
      setCurrentTrack(localVersion || togetherSession.track);
      setProgress(0);
      setIsPlaying(true);
      setActiveTab('together');
      
      const member = btsMembers.find(m => m.id === togetherSession.memberId);
      // Initialize with nice welcomes
      setTogetherMessages([
        {
          sender: 'member',
          text: `啊哈！阿米连线进来了！💜 听这首《${togetherSession.track.title}》吧，带上耳机，我们两个现在是同步心跳合音了！`
        }
      ]);
      commentIndexRef.current = 0;
    }
  }, [togetherSession, tracksList]);

  // Synchronize member reaction comments inside TogetherSession based on current progress
  useEffect(() => {
    if (!togetherSession) return;
    const memberId = togetherSession.memberId;
    const trackId = togetherSession.track.id;
    
    const reactionList = MEMBER_SONG_REACTIONS[memberId]?.[trackId] || 
                         MEMBER_SONG_REACTIONS['jungkook']?.['dynamite']; // fallback
    
    // Check if there are unsaid messages at this timing
    const matchedReactions = reactionList.filter(r => progress >= r.time);
    
    if (matchedReactions.length > commentIndexRef.current) {
      const latestReaction = matchedReactions[matchedReactions.length - 1];
      
      // Personalise username token
      const readyVal = latestReaction.text.replace(/\${username}/g, settings.username);
      
      setTogetherMessages(prev => [
        ...prev,
        { sender: 'member', text: readyVal }
      ]);
      commentIndexRef.current = matchedReactions.length;
    }
  }, [progress, togetherSession]);

  // Clean-up together logs on session exit
  const handleExitTogether = () => {
    onSetTogetherSession(null);
    setProgress(0);
    setIsPlaying(false);
    setActiveTab('library');
  };

  const activeTogetherMember = togetherSession ? btsMembers.find(m => m.id === togetherSession.memberId) : null;

  // React back to member with predefined buttons inside "Listen Together" session
  const handleSendTogetherReaction = (text: string) => {
    if (!togetherSession) return;

    setTogetherMessages(prev => [
      ...prev,
      { sender: 'user', text: text }
    ]);

    // Simulate member's immediate responses
    setTimeout(() => {
      const replies = [
        "嘿嘿，我就知道阿米绝对会喜欢这里的编排！💜",
        "听你这么说，我都觉得音乐变得更加甜腻了呢，呜呜 🐣",
        "大发！知己相伴人生何求，一辈子都要给你应援唱下去！🐨",
        "那当然。阿米的心跳我都有好好放在作歌的软件轨段里 🐱",
        "收到呼叫！给今天的阿米送去最闪耀比心发射！🚀✨",
        "谢谢夸奖 🐻 我们要携手走更远风景哦。"
      ];
      setTogetherMessages(prev => [
        ...prev,
        { sender: 'member', text: replies[Math.floor(Math.random() * replies.length)] }
      ]);
    }, 1200);
  };

  // Launch simulated invitation from solo player mode
  const handleInviteToSong = (member: BTSMember) => {
    setShowInviteSheet(false);
    onSetTogetherSession({
      memberId: member.id,
      track: currentTrack
    });
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-full bg-[#121212] text-white overflow-hidden flex flex-col relative select-none">
      
      {/* Dynamic Spotify Glow Filter */}
      <div 
        className="absolute -top-32 -left-32 w-72 h-72 rounded-full opacity-15 blur-3xl pointer-events-none transition-all duration-700"
        style={{ 
          background: currentTrack.albumArt.includes('gradient') 
            ? currentTrack.albumArt 
            : 'linear-gradient(135deg, #1db954 10%, #191414 90%)'
        }}
      ></div>

      {/* Title Header */}
      <div className="px-5 py-4 border-b border-neutral-900/80 sticky top-0 shrink-0 flex justify-between items-center bg-[#121212]/90 backdrop-blur-md z-10">
        <div>
          <h2 className="text-lg font-black font-display tracking-tight flex items-center gap-1.5 select-none">
            <span className="w-5 h-5 bg-[#1db954] text-white rounded-full flex items-center justify-center text-[10px] font-black">S</span>
            <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">스포티파이</span>
          </h2>
          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
            Spotify BTS Edition
          </p>
        </div>

        {/* Tab switches */}
        <div className="flex bg-neutral-800/80 rounded-full p-0.5 border border-neutral-700/30">
          <button
            onClick={() => setActiveTab('library')}
            className={`px-3 py-1 rounded-full font-bold text-[9px] cursor-pointer transition-all ${
              activeTab === 'library' && !togetherSession ? 'bg-[#1db954] text-neutral-950 font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            音乐库
          </button>
          <button
            onClick={() => setActiveTab('together')}
            className={`px-3 py-1 rounded-full font-bold text-[9px] cursor-pointer transition-all relative flex items-center gap-0.5 ${
              activeTab === 'together' || togetherSession ? 'bg-indigo-600 text-white font-black animate-pulse' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-2.5 h-2.5" />
            <span>一起听歌</span>
            {togetherSession && <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
          </button>
        </div>
      </div>

      {/* Main active layout screen frame */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        
        {/* TAB 1: MUSIC LIBRARY */}
        {activeTab === 'library' && (
          <div className="p-4 space-y-4 flex-1 flex flex-col pb-20">
            
            {/* Solo Player quick preview header */}
            <div className="bg-neutral-900/70 border border-neutral-800/50 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden">
              <div className="flex gap-4 items-center">
                <div 
                  className={`w-14 h-14 rounded-xl flex items-center justify-center relative shadow-md shrink-0 transition-transform ${
                    isPlaying ? 'animate-spin-slow' : ''
                  }`}
                  style={{ background: currentTrack.albumArt }}
                >
                  <Music className="w-5 h-5 text-white/55" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[9px] text-[#1db954] font-black uppercase tracking-wider">Now Playing</p>
                    {currentTrack.audioUrl && (
                      <span className="text-[8px] bg-emerald-500/20 text-[#1db954] px-1.5 py-0.5 rounded-full font-black">
                        REAL AUDIO 🎵
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-sm truncate text-white">{currentTrack.title}</h3>
                  <p className="text-[10px] text-zinc-400 truncate mt-0.5">{currentTrack.artist}</p>
                </div>

                {/* Mini controls */}
                <button
                  type="button"
                  onClick={handlePlayToggle}
                  className="w-9 h-9 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-neutral-950 flex items-center justify-center cursor-pointer transition-transform active:scale-95 shadow-md shrink-0"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-neutral-950" /> : <Play className="w-4 h-4 fill-neutral-950 stroke-none ml-0.5" />}
                </button>
              </div>

              {/* Progress and control bar for solo mode */}
              <div className="space-y-1.5 pt-1.5 border-t border-neutral-800/60">
                <div className="w-full bg-neutral-800 h-1.5 rounded-full relative group cursor-pointer">
                  {currentTrack.audioUrl ? (
                    <input
                      type="range"
                      min="0"
                      max={currentTrack.duration || 100}
                      value={progress}
                      onChange={(e) => {
                        const targetTime = Number(e.target.value);
                        setProgress(targetTime);
                        if (audioRef.current) {
                          audioRef.current.currentTime = targetTime;
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                  ) : null}
                  <div 
                    className="bg-[#1db954] h-full rounded-full transition-all"
                    style={{ width: `${((currentTrack.duration ? progress / currentTrack.duration : 0) * 100) || 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[9px] text-zinc-500 font-bold font-mono">
                  <span>{formatTimer(progress)}</span>
                  <div className="flex items-center gap-1 text-[8px] text-zinc-400 uppercase tracking-widest font-sans">
                    <Volume2 className="w-2.5 h-2.5 text-zinc-500" />
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="w-10 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#1db954]"
                    />
                    <span>{volume}%</span>
                  </div>
                  <span>{formatTimer(currentTrack.duration)}</span>
                </div>
              </div>
            </div>

            {/* Custom Audio Upload Desk card */}
            <div className="bg-gradient-to-r from-emerald-950/20 to-purple-950/20 border border-emerald-500/20 rounded-2xl p-4 space-y-3 shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-black text-[#1db954] uppercase tracking-wide flex items-center gap-1.5">
                    <Music className="w-4 h-4 animate-bounce" />
                    <span>上传或播放我的真实音乐 (Upload Album Audio)</span>
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-bold mt-1 leading-relaxed">
                    您可以传入任意音频文件（例如：BTS的MP3、翻唱，甚至您本人的语音/歌曲），系统将解锁真实音频信号进行播放，防弹成员还能与您同频率连线并说心里话！
                  </p>
                </div>
              </div>

              <label className="flex flex-col items-center justify-center p-4 border border-dashed border-neutral-700 hover:border-[#1db954]/50 bg-black/40 hover:bg-neutral-900/60 rounded-xl cursor-pointer transition-all text-center group">
                <Upload className="w-6 h-6 text-zinc-500 group-hover:text-[#1db954] transition-colors mb-2" />
                <span className="text-[11px] font-black text-zinc-300 group-hover:text-white transition-colors">
                  点击按钮或拖入本地文件进行读取
                </span>
                <span className="text-[9px] text-zinc-500 font-extrabold mt-1">
                  支持格式：MP3, WAV, M4A, OGG 等音频 (本地生成沙盒缓存，无网络分享)
                </span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleAudioUpload(file);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>

            {/* Song lists library Title */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500">
                BTS 独家热门单曲 与 上传曲库 (Music Tracks)
              </h3>
              
              <div className="flex flex-col gap-1.5">
                {tracksList.map((track, idx) => {
                  const isCurrent = track.id === currentTrack.id;
                  const isLiked = likedSongIds.includes(track.id);

                  return (
                    <div
                      key={track.id}
                      onClick={() => {
                        setCurrentTrack(track);
                        setProgress(0);
                        setIsPlaying(true);
                      }}
                      className={`flex items-center gap-3.5 p-3 rounded-xl cursor-pointer border hover:bg-neutral-800/40 transition-colors group ${
                        isCurrent 
                          ? 'bg-neutral-800/60 border-neutral-700/50' 
                          : 'bg-transparent border-transparent'
                      }`}
                    >
                      <span className={`text-[11px] font-bold w-4 text-center ${isCurrent ? 'text-[#1db954] font-black' : 'text-zinc-500'}`}>
                        {isCurrent && isPlaying ? (
                          <span className="flex gap-0.5 justify-center items-end h-2.5">
                            <span className="w-0.5 bg-[#1db954] animate-[bounce_1s_infinite]"></span>
                            <span className="w-0.5 bg-[#1db954] animate-[bounce_1.2s_infinite_0.4s]"></span>
                            <span className="w-0.5 bg-[#1db954] animate-[bounce_0.8s_infinite_0.2s]"></span>
                          </span>
                        ) : idx + 1}
                      </span>

                      {/* Cover gradients art */}
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center relative shadow-sm shrink-0"
                        style={{ background: track.albumArt }}
                      >
                        <Music className="w-4 h-4 text-white/40" />
                      </div>

                      {/* Title block */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4 className={`text-xs font-bold truncate ${isCurrent ? 'text-[#1db954]' : 'text-white'}`}>
                            {track.title}
                          </h4>
                          {track.audioUrl && (
                            <span className="text-[7.5px] bg-[#1db954]/20 border border-[#1db954]/30 text-[#1db954] px-1 font-black rounded scale-90 select-none shrink-0 uppercase">
                              REAL
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-400 font-semibold truncate mt-0.5">
                          {track.artist} • {track.album}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Row-level file binder */}
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                          <label
                            title={track.audioUrl ? "重新上传/替换歌曲真实文件" : "上传真实音频文件匹配此歌曲"}
                            className="p-1 rounded-lg text-zinc-500 hover:text-emerald-400 hover:bg-neutral-800/80 transition-all cursor-pointer flex items-center justify-center"
                          >
                            <Upload className={`w-3.5 h-3.5 ${track.audioUrl ? 'text-[#1db954]' : ''}`} />
                            <input
                              type="file"
                              accept="audio/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const audioUrl = URL.createObjectURL(file);
                                  setTracksList(prev => prev.map(t => {
                                    if (t.id === track.id) {
                                      const updated = { ...t, audioUrl };
                                      // If this song is currently loaded or selected, update it!
                                      if (isCurrent) {
                                        setCurrentTrack(updated);
                                        setProgress(0);
                                        setIsPlaying(true);
                                      }
                                      return updated;
                                    }
                                    return t;
                                      }));
                                  
                                  // If they uploaded a song and it is not yet active, let's load and play it right away
                                  if (!isCurrent) {
                                    const updated = { ...track, audioUrl };
                                    setCurrentTrack(updated);
                                    setProgress(0);
                                    setIsPlaying(true);
                                  }
                                }
                              }}
                            />
                          </label>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLikeSong(track.id);
                          }}
                          className="text-zinc-500 hover:text-rose-500 transition-colors cursor-pointer"
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? 'text-rose-500 fill-rose-500' : ''}`} />
                        </button>
                        <span className="text-[10px] text-zinc-500 font-bold font-mono">{formatTimer(track.duration)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TOGETHER VIEW OR ACTIVE SESSIONS SELECTOR */}
        {activeTab === 'together' && (
          <div className="flex-1 flex flex-col relative pb-20">
            
            {/* SUBVIEW A: NO ACTIVE TOGETHER SESSION (SELECTOR) */}
            {!togetherSession ? (
              <div className="p-4 space-y-4 flex flex-col">
                <div className="bg-gradient-to-tr from-indigo-950 to-neutral-900 border border-indigo-900/50 p-4 rounded-3xl text-center space-y-2 relative overflow-hidden shrink-0">
                  <div className="absolute right-0 bottom-0 bg-indigo-500/10 w-24 h-24 rounded-full blur-2xl"></div>
                  
                  <h3 className="font-extrabold text-white text-sm flex justify-center items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span>成员同频听歌房间 (Active Rooms)</span>
                  </h3>
                  <p className="text-[10px] text-indigo-200/60 leading-relaxed font-bold max-w-xs mx-auto">
                    防弹少年团正在使用 Spotify 连线听歌！点击加入，他们的音乐播放进度将与你全屏同步，并在你耳旁留下私家听歌感想。
                  </p>
                </div>

                <div className="space-y-2.5">
                  <h3 className="text-xs font-black uppercase text-zinc-500 tracking-wider">
                    正在连线的成员名单 (Simulating Sessions)
                  </h3>

                  <div className="flex flex-col gap-2">
                    {btsMembers.map((member) => {
                      const song = spotifyTracks.find(t => t.id === member.currentSongId) || spotifyTracks[0];
                      const memberBg = member.color;

                      return (
                        <div
                          key={member.id}
                          className="bg-[#181818] border border-neutral-800/60 rounded-2xl p-3.5 flex justify-between items-center hover:bg-neutral-800/40 transition-colors"
                        >
                          <div className="flex gap-3.5 items-center">
                            {/* Member Avatar bubble */}
                            <div className="w-11 h-11 rounded-full bg-neutral-800 flex items-center justify-center text-2xl shadow-md select-none shrink-0 self-start">
                              {member.avatar}
                            </div>
                            
                            <div className="space-y-0.5">
                              <h4 className="font-extrabold text-xs text-white tracking-tight flex items-center gap-1.5">
                                <span>{member.name}</span>
                                <span className="text-[8px] bg-red-500 text-white font-extrabold px-1 rounded animate-pulse">LIVE 🎧</span>
                              </h4>
                              <p className="text-[10px] text-zinc-400 font-bold truncate">正在听：《{song.title}》</p>
                              <p className="text-[8px] text-zinc-500 font-semibold italic truncate">“{member.bio.slice(0, 20)}...”</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              onSetTogetherSession({
                                memberId: member.id,
                                track: song
                              });
                            }}
                            className="bg-[#1db954] hover:bg-[#1ed760] text-neutral-950 font-black text-[10px] py-1.5 px-3.5 rounded-xl cursor-pointer active:scale-95 transition-transform"
                          >
                            加入合听
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              // SUBVIEW B: FULL IMMERSIVE LISTEN TOGETHER SESSION
              <div className="flex-1 flex flex-col p-4 space-y-4">
                
                {/* Session Header Card banner */}
                <div className="bg-indigo-950/40 border border-indigo-900/30 p-3 rounded-2xl flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{activeTogetherMember?.avatar}</span>
                    <div>
                      <h4 className="font-extrabold text-xs text-white">
                        您 💜 正在和 {activeTogetherMember?.name} 一起同步听歌
                      </h4>
                      <p className="text-[9px] text-[#1db954] font-black uppercase tracking-wider">
                        Real-time Synced Spotify Session
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleExitTogether}
                    className="text-[10px] bg-red-950/80 hover:bg-red-900 border border-red-900/40 text-red-300 font-bold px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    退出房间 🚪
                  </button>
                </div>

                {/* Simulated Spinning album disc and progress bar */}
                <div className="bg-neutral-900/60 p-4 rounded-3xl border border-neutral-800/40 flex flex-col items-center gap-4 shrink-0 relative overflow-hidden">
                  
                  {/* Decorative glowing background art under lay */}
                  <div 
                    className="absolute inset-0 opacity-15 blur-2xl pointer-events-none scale-125"
                    style={{ background: currentTrack.albumArt }}
                  ></div>

                  {/* Large rotational plate disc */}
                  <div className="relative select-none">
                    <div 
                      className={`w-28 h-28 rounded-full border-4 border-neutral-800 shadow-2xl flex items-center justify-center p-1.5 overflow-hidden ${
                        isPlaying ? 'animate-spin-slow' : ''
                      }`}
                      style={{ background: currentTrack.albumArt }}
                    >
                      {/* Innermost Vinyl disk core design */}
                      <div className="w-12 h-12 bg-black border-2 border-dashed border-neutral-700 rounded-full flex items-center justify-center select-none text-xl">
                        🍇
                      </div>
                    </div>
                    {/* Synchronized status overlay tag badge */}
                    <div className="absolute -bottom-1 left-12 transform -translate-x-1/2 bg-indigo-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded border border-indigo-400">
                      SYNC PROGRESS
                    </div>
                  </div>

                  {/* Title labels */}
                  <div className="text-center space-y-0.5 z-10 w-full min-w-0">
                    <h3 className="font-black text-sm truncate text-white">{currentTrack.title}</h3>
                    <p className="text-[10px] text-zinc-400 font-semibold truncate uppercase">{currentTrack.artist}</p>
                  </div>

                  {/* Sync progress bar slider */}
                  <div className="w-full space-y-1.5 z-10 select-none">
                    <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden relative">
                      <div 
                        className="bg-indigo-500 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${(progress / currentTrack.duration) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[9px] text-stone-400 font-bold font-mono">
                      <span>{formatTimer(progress)}</span>
                      <span className="text-indigo-400 animate-pulse">正在和偶像连线听中 🎧</span>
                      <span>{formatTimer(currentTrack.duration)}</span>
                    </div>
                  </div>

                  {/* Spotify Control layout actions */}
                  <div className="flex items-center gap-6 z-10 select-none">
                    <button
                      type="button"
                      onClick={handlePrevTrack}
                      className="text-stone-400 hover:text-white transition-opacity active:scale-90 cursor-pointer"
                    >
                      <SkipBack className="w-4 h-4 fill-stone-400 stroke-none" />
                    </button>
                    <button
                      type="button"
                      onClick={handlePlayToggle}
                      className="w-10 h-10 rounded-full bg-[#1db954] text-neutral-950 flex items-center justify-center cursor-pointer transition-transform active:scale-95 shadow-md"
                    >
                      {isPlaying ? <Pause className="w-5 h-5 fill-neutral-950" /> : <Play className="w-5 h-5 fill-neutral-950 stroke-none ml-0.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleNextTrack}
                      className="text-stone-400 hover:text-white transition-opacity active:scale-90 cursor-pointer"
                    >
                      <SkipForward className="w-4 h-4 fill-stone-400 stroke-none" />
                    </button>
                  </div>
                </div>

                {/* SYNCHRONIZED REACTION DIALOGUE BUBBLES BLOCK */}
                <div className="flex-1 bg-black/40 border border-neutral-900 border-zinc-900/40 rounded-3xl p-4 flex flex-col min-h-[160px] overflow-hidden">
                  <div className="text-[10px] font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1 shrink-0 mb-2 border-b border-indigo-950 pb-1.5">
                    <Users className="w-3 h-3" />
                    <span>合听专属讨论弹幕 (Live Discussion)</span>
                  </div>

                  {/* Dialog logs list */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 select-text max-h-[160px] pr-1.5 pb-2">
                    {togetherMessages.map((msg, index) => {
                      const isMe = msg.sender === 'user';

                      return (
                        <div key={index} className={`flex gap-2.5 items-start ${isMe ? 'flex-row-reverse' : ''}`}>
                          {/* Circle badge */}
                          <div className="w-7 h-7 rounded-full bg-slate-800 text-sm flex items-center justify-center select-none border border-neutral-700 shadow-sm shrink-0">
                            {isMe ? '💜' : activeTogetherMember?.avatar}
                          </div>

                          <div className={`rounded-xl px-3 py-2 text-[11px] font-semibold leading-relaxed max-w-[75%] ${
                            isMe 
                              ? 'bg-indigo-650 border border-indigo-600/50 text-white rounded-tr-none' 
                              : 'bg-neutral-800/80 border border-neutral-700/50 text-neutral-100 rounded-tl-none'
                          }`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Interactive reaction quick CTA chips */}
                  <div className="pt-2 border-t border-indigo-950/60 sticky bottom-0 bg-transparent flex flex-wrap gap-1.5 shrink-0 select-none">
                    {[
                      "我超爱这首歌！💜",
                      "欧巴的音色太温柔了 😭",
                      "感觉我们在用灵魂共鸣啊 ✨",
                      "这句歌词听得我想哭呜呜呜"
                    ].map((text) => (
                      <button
                        type="button"
                        key={text}
                        onClick={() => handleSendTogetherReaction(text)}
                        className="py-1 px-2.5 border border-indigo-900 bg-indigo-950/50 hover:bg-indigo-900 hover:text-white transition-colors text-[10px] font-bold rounded-full text-indigo-300 cursor-pointer active:scale-95"
                      >
                        {text}
                      </button>
                    ))}
                  </div>

                </div>

              </div>
            )}

          </div>
        )}
      </div>

      {/* Floating Solo Music Player Bottom Control Sticky bar */}
      {activeTab === 'library' && (
        <div className="absolute bottom-16 inset-x-3 bg-neutral-900/95 border border-neutral-800 backdrop-blur-md rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-2xl z-10 select-none">
          <div className="flex gap-3 items-center min-w-0 flex-1 pr-4">
            <div 
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                isPlaying ? 'animate-spin-slow' : ''
              }`}
              style={{ background: currentTrack.albumArt }}
            >
              <Music className="w-3.5 h-3.5 text-white/55" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate">{currentTrack.title}</h4>
              <p className="text-[9px] text-zinc-400 font-bold truncate">{currentTrack.artist}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Play/Pause */}
            <button
              onClick={handlePlayToggle}
              className="w-8 h-8 rounded-full bg-white text-neutral-950 flex items-center justify-center cursor-pointer transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-neutral-950" /> : <Play className="w-3.5 h-3.5 fill-neutral-950 stroke-none ml-0.5" />}
            </button>
            <button
              onClick={handleNextTrack}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer active:scale-90"
            >
              <SkipForward className="w-4 h-4 fill-zinc-400 stroke-none" />
            </button>
            
            {/* Invite button */}
            <button
              onClick={() => {
                setShowInviteSheet(true);
              }}
              className="bg-indigo-600 text-white font-black text-[9px] px-2.5 py-1 rounded-xl cursor-pointer hover:bg-indigo-700 hover:shadow-md active:scale-95 transition-all text-center flex items-center gap-1 border border-indigo-500"
            >
              <Users className="w-2.5 h-2.5" />
              <span>拉伴共听</span>
            </button>
          </div>
        </div>
      )}

      {/* Slide-rising Invitation Bottom Sheet */}
      {showInviteSheet && (
        <div 
          onClick={() => setShowInviteSheet(false)}
          className="absolute inset-0 bg-stone-900/70 backdrop-blur-sm z-50 flex items-end justify-center cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-neutral-900 border-t border-neutral-800 rounded-t-[32px] max-h-[70%] flex flex-col cursor-default p-4 gap-4 shadow-2xl"
          >
            {/* Sliders decorative anchor */}
            <div className="w-full flex justify-center pb-2 border-b border-rose-950/20">
              <div className="w-12 h-1 rounded-full bg-neutral-700"></div>
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-[#1db954] text-sm tracking-wide">
                挑选合听防弹欧巴 (Invite a Member)
              </h3>
              <p className="text-[10px] text-neutral-400 font-bold">
                选择一位成员连线，一起品赏这首《{currentTrack.title}》吧！
              </p>
            </div>

            {/* List scrollable grid container of members */}
            <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar flex-1 max-h-[300px]">
              {btsMembers.map((member) => (
                <div
                  key={member.id}
                  onClick={() => handleInviteToSong(member)}
                  className="flex justify-between items-center p-3 bg-neutral-800/60 border border-neutral-700/40 rounded-2xl hover:bg-neutral-800 hover:shadow-md cursor-pointer transition-all"
                >
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-xl select-none">
                      {member.avatar}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-white">
                        {member.name} ({member.koreanName})
                      </h4>
                      <p className="text-[9px] text-[#1db954] font-semibold italic">{member.role}</p>
                    </div>
                  </div>

                  <span className="text-[10px] text-zinc-500 font-extrabold flex items-center gap-1 bg-neutral-900 px-3 py-1.5 rounded-xl border border-neutral-800 group-hover:text-white">
                    邀请他们 💌
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowInviteSheet(false)}
              className="py-2.5 w-full bg-neutral-800 text-zinc-400 font-black text-xs rounded-2xl transition-all cursor-pointer hover:text-white"
            >
              取消并返回
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
