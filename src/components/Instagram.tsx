import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Sparkles, User, HelpCircle, CheckCircle } from 'lucide-react';
import { InstagramPost, SettingsState } from '../types';
import { btsMembers, btsNewPostsPool } from '../data';
import Avatar from './Avatar';

interface InstagramProps {
  posts: InstagramPost[];
  onUpdatePosts: React.Dispatch<React.SetStateAction<InstagramPost[]>>;
  settings: SettingsState;
  onPostAdd?: (newPosts: InstagramPost[]) => void;
}

export default function Instagram({ posts, onUpdatePosts, settings }: InstagramProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [incomingPostIndex, setIncomingPostIndex] = useState(0);

  // Dynamic floats for double-click heart animations
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  // Double tap to like
  const handleDoubleTap = (postId: string, e: React.MouseEvent<HTMLDivElement>) => {
    // Increment Likes and toggle liked state
    onUpdatePosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const isLiked = !p.likedByUser;
          return {
            ...p,
            likedByUser: isLiked,
            likes: isLiked ? p.likes + 1 : p.likes - 1
          };
        }
        return p;
      })
    );

    // Create a dynamic floating floating heart
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    const heartId = Date.now();
    setHearts(prev => [...prev, { id: heartId, x, y }]);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== heartId));
    }, 1000);
  };

  // Switch like state
  const handleLikeBtn = (postId: string) => {
    onUpdatePosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const isLiked = !p.likedByUser;
          return {
            ...p,
            likedByUser: isLiked,
            likes: isLiked ? p.likes + 1 : p.likes - 1
          };
        }
        return p;
      })
    );
  };

  // Submit comment
  const handleAddComment = (postId: string) => {
    if (!newCommentText.trim()) return;

    onUpdatePosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [
              ...p.comments,
              {
                id: `cmt_${Date.now()}`,
                author: settings.username || '阿米',
                avatar: settings.avatar || '💜',
                text: newCommentText.trim(),
                date: '刚刚'
              }
            ]
          };
        }
        return p;
      })
    );
    setNewCommentText('');
  };

  // Trigger simulated incoming posts (bts new posts)
  const handleSimulateNewPost = () => {
    if (incomingPostIndex >= btsNewPostsPool.length) {
      alert("没有更多新动态啦，各位成员正在努力创作中~ 🎤💜");
      return;
    }
    const template = btsNewPostsPool[incomingPostIndex];
    const newFullPost: InstagramPost = {
      ...template,
      comments: [
        { id: `c_${template.id}_1`, author: "rkive", avatar: "🐨", text: "期待！弟弟太棒了！", date: "刚刚" }
      ],
      likedByUser: false
    };

    onUpdatePosts(prev => [newFullPost, ...prev]);
    setIncomingPostIndex(prev => prev + 1);
  };

  // Get matching member profile object
  const selectedMemberProfile = btsMembers.find(m => m.id === selectedMemberId);

  return (
    <div className="w-full h-full bg-white select-none flex flex-col relative overflow-hidden">
      {/* IG Header */}
      <div className="px-4 py-3 border-b border-rose-100/60 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-md z-10 shrink-0">
        <h2 className="text-xl font-black font-display text-rose-950 tracking-tight flex items-center gap-1">
          <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 bg-clip-text text-transparent">아미그램</span>
          <span className="text-[10px] font-sans font-extrabold uppercase bg-rose-50 text-rose-500 px-1.5 py-0.5 rounded-full border border-rose-100">
            AMYGRAM
          </span>
        </h2>

        {/* Dynamic Mock Upload/Notify CTA */}
        <button
          type="button"
          onClick={handleSimulateNewPost}
          className="flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-1.5 rounded-2xl cursor-pointer hover:bg-rose-100 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 fill-rose-100" />
          <span>摇一摇催更 💜</span>
        </button>
      </div>

      {/* Primary Scrollable Scroll Shell */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-neutral-50 flex flex-col gap-4 pb-20">
        
        {/* Stories top layout */}
        <div className="bg-white border-b border-rose-100/50 p-4 space-y-2 shrink-0">
          <p className="text-[10px] font-black uppercase text-stone-400 tracking-wider">
            防弹小分队成员 (Profiles)
          </p>
          <div className="flex gap-4 overflow-x-auto custom-scrollbar py-1">
            {btsMembers.map((member) => (
              <button
                type="button"
                key={member.id}
                onClick={() => setSelectedMemberId(member.id)}
                className="flex flex-col items-center gap-1 select-none cursor-pointer shrink-0 transition-transform active:scale-95 duration-150"
              >
                {/* Ring wrapper */}
                <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2.5px] shadow-sm flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center border-2 border-white overflow-hidden select-none">
                    <Avatar avatar={member.avatar} className="w-full h-full" fallbackSizeClass="text-2xl" />
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold text-stone-600 tracking-tight">
                  {member.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* IG Feed List */}
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white border-y border-stone-100/70 shadow-sm flex flex-col">
              
              {/* Post Author Bar */}
              <div className="p-3 flex justify-between items-center bg-white">
                <button
                  type="button"
                  onClick={() => setSelectedMemberId(post.memberId)}
                  className="flex items-center gap-2.5 cursor-pointer text-left"
                >
                  <Avatar avatar={post.avatar} className="w-9 h-9 shadow-sm border border-stone-100 shrink-0 select-none font-sans" fallbackSizeClass="text-xl" />
                  <div>
                    <h3 className="font-bold text-xs text-stone-800 flex items-center gap-1">
                      <span>{post.memberName}</span>
                      <CheckCircle className="w-3.5 h-3.5 text-blue-500 fill-blue-500 stroke-white" />
                    </h3>
                    <p className="text-[9px] text-stone-400 font-bold">@{btsMembers.find(m => m.id === post.memberId)?.instaHandle}</p>
                  </div>
                </button>
                <span className="text-[9px] text-stone-400 font-bold">{post.date}</span>
              </div>

              {/* Dynamic Image Wrapper - double tap to like */}
              <div
                onDoubleClick={(e) => handleDoubleTap(post.id, e)}
                className="w-full aspect-square relative cursor-pointer overflow-hidden flex items-center justify-center select-none"
                style={{ background: post.image }}
              >
                {/* Visual watermark */}
                <div className="text-white/20 select-none font-bold text-lg select-text uppercase tracking-widest font-display text-center p-3 flex flex-col items-center">
                  <Avatar avatar={post.avatar} className="w-12 h-12 opacity-80 mb-1 filter grayscale" fallbackSizeClass="text-3xl" />
                  <span>@{btsMembers.find(m => m.id === post.memberId)?.instaHandle}</span>
                </div>

                {/* Flying double click heart triggers */}
                {hearts.map((h) => (
                  <div
                    key={h.id}
                    className="absolute text-5xl text-rose-500 fill-rose-500 animate-heart-drop pointer-events-none drop-shadow-lg"
                    style={{ left: h.x - 24, top: h.y - 24 }}
                  >
                    ❤️
                  </div>
                ))}
              </div>

              {/* Post Interactive Action Bar */}
              <div className="px-3 py-2.5 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => handleLikeBtn(post.id)}
                  className="cursor-pointer transition-transform active:scale-90"
                >
                  <Heart
                    className={`w-6 h-6 ${
                      post.likedByUser ? 'text-rose-500 fill-rose-500' : 'text-stone-800'
                    }`}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCommentsPostId(post.id);
                  }}
                  className="cursor-pointer transition-transform active:scale-90"
                >
                  <MessageCircle className="w-6 h-6 text-stone-800" />
                </button>
                <div className="flex-1"></div>
                <div className="text-[10px] text-stone-400 font-extrabold tracking-wider bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded-full">
                  双击图片点赞 💜
                </div>
              </div>

              {/* Post Likes Display */}
              <div className="px-3 pb-1">
                <p className="text-xs font-black text-rose-950">
                  {post.likes.toLocaleString()} 次赞
                </p>
              </div>

              {/* Post Description Body Content */}
              <div className="px-3 pb-3 space-y-1 select-text">
                <p className="text-xs text-stone-700 leading-relaxed font-medium">
                  <span className="font-extrabold text-stone-900 mr-2">
                    {post.memberName}
                  </span>
                  {post.content}
                </p>

                {/* Static / View interactive comments prompt */}
                {post.comments.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveCommentsPostId(post.id)}
                    className="text-[10px] font-bold text-stone-400 block pt-1 hover:text-stone-600 transition-colors cursor-pointer"
                  >
                    查看全部 {post.comments.length} 条评论...
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Profile Sheet Detail Card */}
      {selectedMemberId && selectedMemberProfile && (
        <div 
          onClick={() => setSelectedMemberId(null)}
          className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-5 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[32px] p-6 text-center shadow-2xl w-full max-w-xs border border-rose-100 flex flex-col items-center gap-4 cursor-default relative overflow-hidden"
          >
            {/* Soft colored glow background */}
            <div 
              className="absolute -top-12 -left-12 w-28 h-28 rounded-full blur-2xl opacity-25 pointer-events-none"
              style={{ backgroundColor: selectedMemberProfile.color }}
            ></div>

            {/* Verification badge emoji */}
            <div className="relative">
              <Avatar avatar={selectedMemberProfile.avatar} className="w-20 h-20 border-4 border-rose-100/50 shadow-md" fallbackSizeClass="text-4xl" />
              <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full border-2 border-white p-0.5 shadow-sm">
                <CheckCircle className="w-4 h-4 fill-blue-500 stroke-white" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-rose-950 font-display text-base">
                {selectedMemberProfile.name} ({selectedMemberProfile.koreanName})
              </h3>
              <p className="text-[10px] font-extrabold uppercase bg-rose-50 px-2.5 py-0.5 rounded-full text-rose-500 border border-rose-100 inline-block tracking-wider">
                @{selectedMemberProfile.instaHandle}
              </p>
            </div>

            <div className="space-y-2 bg-rose-50/30 border border-rose-100/40 p-3 rounded-2xl w-full select-text">
              <p className="text-[11px] font-extrabold text-stone-400 uppercase tracking-widest">{selectedMemberProfile.role}</p>
              <p className="text-xs text-rose-950 font-semibold leading-relaxed">
                {selectedMemberProfile.bio}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedMemberId(null)}
              className="py-2.5 px-6 bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-black rounded-2xl w-full cursor-pointer transition-colors active:scale-95"
            >
              关闭卡片 💜
            </button>
          </div>
        </div>
      )}

      {/* Modal Side Slide-up Shell layout for Comments */}
      {activeCommentsPostId && (
        <div 
          onClick={() => setActiveCommentsPostId(null)}
          className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-end justify-center cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-white rounded-t-[32px] max-h-[75%] border-t border-rose-100 flex flex-col cursor-default shadow-2xl"
          >
            {/* Header line slider decoration */}
            <div className="w-full flex justify-center py-2.5 shrink-0">
              <div className="w-12 h-1.5 rounded-full bg-stone-200"></div>
            </div>

            {/* Title block */}
            <div className="px-5 pb-3 border-b border-rose-100/50 flex justify-between items-center shrink-0">
              <h3 className="font-extrabold text-sm text-rose-950">
                评论区 ({posts.find(p => p.id === activeCommentsPostId)?.comments.length || 0})
              </h3>
              <button
                type="button"
                onClick={() => setActiveCommentsPostId(null)}
                className="text-xs font-bold text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
              >
                收起 🌸
              </button>
            </div>

            {/* Comment lists overflow window wrapper */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 select-text">
              {posts.find(p => p.id === activeCommentsPostId)?.comments.map((cmt) => (
                <div key={cmt.id} className="flex gap-3 items-start">
                  <Avatar avatar={cmt.avatar} className="w-8 h-8 border border-stone-150 shrink-0" fallbackSizeClass="text-lg" />
                  <div className="bg-stone-50 border border-stone-100 rounded-2xl px-3.5 py-2 flex-1 relative">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-extrabold text-xs text-stone-800">{cmt.author}</span>
                      <span className="text-[9px] text-stone-400 font-bold">{cmt.date}</span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed font-semibold">
                      {cmt.text}
                    </p>
                  </div>
                </div>
              ))}

              {(!posts.find(p => p.id === activeCommentsPostId)?.comments.length) && (
                <div className="py-10 text-center space-y-1.5 select-none">
                  <p className="text-stone-400 text-xs font-semibold">还没人评论过呢...</p>
                  <p className="text-[10px] text-rose-300 font-extrabold">发布第一条评论给欧巴应援吧！💜</p>
                </div>
              )}
            </div>

            {/* Add comment entry text input box */}
            <div className="p-4 border-t border-rose-100/60 bg-white/95 backdrop-blur-md flex gap-2 shrink-0">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddComment(activeCommentsPostId);
                }}
                className="flex-1 bg-stone-50 border border-stone-200 px-4 py-2.5 rounded-2xl text-xs font-semibold focus:outline-none focus:border-rose-300"
                placeholder="在此输入您的应援评论吧..."
              />
              <button
                type="button"
                onClick={() => handleAddComment(activeCommentsPostId)}
                className="w-10 h-10 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer hover:shadow-md transition-all active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
