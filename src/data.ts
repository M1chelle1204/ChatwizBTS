import { BTSMember, SpotifyTrack, ChatRoom, InstagramPost } from './types';

export const btsMembers: BTSMember[] = [
  {
    id: "rm",
    name: "RM",
    koreanName: "金南俊",
    role: "队长 / 主Rapper",
    bio: "寻找生活中的艺术与诗意。阿米是我们的原动力。🐨🎨",
    avatar: "🐨",
    instaHandle: "rkive",
    instaName: "RM",
    wallpaper: "bg-stone-100",
    color: "#4B5563",
    currentSongId: "wildflower"
  },
  {
    id: "jin",
    name: "Jin",
    koreanName: "金硕珍",
    role: "副唱 / 门面担当",
    bio: "Worldwide Handsome ✨ 每天都要开心、玩游戏、吃美食！阿米，撒浪嘿哟！🐹",
    avatar: "🐹",
    instaHandle: "jin",
    instaName: "Jin",
    wallpaper: "bg-rose-50",
    color: "#EC4899",
    currentSongId: "astronaut"
  },
  {
    id: "suga",
    name: "SUGA",
    koreanName: "闵玧其",
    role: "领Rapper / 音乐制作",
    bio: "在音乐与现实之间。忙碌累了的时候，听听安稳的旋律吧。🎹🐱",
    avatar: "🐱",
    instaHandle: "agustd",
    instaName: "SUGA",
    wallpaper: "bg-zinc-50",
    color: "#0F172A",
    currentSongId: "haegeum"
  },
  {
    id: "jhope",
    name: "j-hope",
    koreanName: "郑号锡",
    role: "主舞 / 领Rapper",
    bio: "I'm your hope, you're my hope, I'm J-Hope! ☀️ 永远带给你们阳光与正能量！🐿️",
    avatar: "🐿️",
    instaHandle: "uarmyhope",
    instaName: "j-hope",
    wallpaper: "bg-amber-50",
    color: "#D97706",
    currentSongId: "onthestreet"
  },
  {
    id: "jimin",
    name: "Jimin",
    koreanName: "朴智旻",
    role: "主舞 / 领唱",
    bio: "温暖的小天使 🐥 愿这些小小的分享能让阿米开心。你是我最重要的人。",
    avatar: "🐣",
    instaHandle: "j.m",
    instaName: "Jimin",
    wallpaper: "bg-purple-50",
    color: "#7C3AED",
    currentSongId: "likecrazy"
  },
  {
    id: "v",
    name: "V",
    koreanName: "金泰亨",
    role: "领舞 / 副唱",
    bio: "爵士乐爱好者 🎷 黑白底片与永恒的经典。我们是要相伴一生的朋友啊 🐯",
    avatar: "🐻",
    instaHandle: "thv",
    instaName: "V",
    wallpaper: "bg-emerald-50",
    color: "#059669",
    currentSongId: "slowdancing"
  },
  {
    id: "jungkook",
    name: "Jungkook",
    koreanName: "田柾国",
    role: "主唱 / 领舞 / 黄金忙内",
    bio: "无所不能的黄金忙内 🐰 运动、唱歌、跳舞，永远为阿米展现最好的自己。🧪💜",
    avatar: "🐰",
    instaHandle: "abcd_jungkook",
    instaName: "Jungkook",
    wallpaper: "bg-sky-50",
    color: "#2563EB",
    currentSongId: "seven"
  }
];

export const spotifyTracks: SpotifyTrack[] = [
  // OT7 Group Hits
  {
    id: "dynamite",
    title: "Dynamite",
    artist: "BTS",
    album: "Dynamite (Single)",
    albumArt: "linear-gradient(135deg, #fbcfe8 10%, #f472b6 90%)",
    duration: 199,
    energy: "energetic"
  },
  {
    id: "butter",
    title: "Butter",
    artist: "BTS",
    album: "Butter (Single)",
    albumArt: "linear-gradient(135deg, #fef08a 10%, #facc15 90%)",
    duration: 164,
    energy: "energetic"
  },
  {
    id: "springday",
    title: "Spring Day (봄날)",
    artist: "BTS",
    album: "YOU NEVER WALK ALONE",
    albumArt: "linear-gradient(135deg, #ccfbf1 10%, #2dd4bf 90%)",
    duration: 274,
    energy: "sentimental"
  },
  {
    id: "boywithluv",
    title: "Boy With Luv (작은 것들을 위한 시)",
    artist: "BTS (feat. Halsey)",
    album: "Map of the Soul: Persona",
    albumArt: "linear-gradient(135deg, #fed7aa 10%, #fb923c 90%)",
    duration: 229,
    energy: "energetic"
  },
  {
    id: "fakelove",
    title: "Fake Love",
    artist: "BTS",
    album: "Love Yourself: Tear",
    albumArt: "linear-gradient(135deg, #e2e8f0 10%, #64748b 90%)",
    duration: 242,
    energy: "sentimental"
  },
  {
    id: "lifegoeson",
    title: "Life Goes On",
    artist: "BTS",
    album: "BE",
    albumArt: "linear-gradient(135deg, #e0f2fe 10%, #38bdf8 90%)",
    duration: 207,
    energy: "calm"
  },
  // Solo Tracks matching initial members currentSongId
  {
    id: "wildflower",
    title: "Wild Flower (들꽃놀이)",
    artist: "RM (with chopjeon)",
    album: "Indigo",
    albumArt: "linear-gradient(135deg, #f5f5f4 10%, #78716c 90%)",
    duration: 273,
    energy: "sentimental"
  },
  {
    id: "astronaut",
    title: "The Astronaut",
    artist: "Jin",
    album: "The Astronaut (Single)",
    albumArt: "linear-gradient(135deg, #fae8ff 10%, #c084fc 90%)",
    duration: 282,
    energy: "sentimental"
  },
  {
    id: "haegeum",
    title: "Haegeum (해금)",
    artist: "Agust D",
    album: "D-DAY",
    albumArt: "linear-gradient(135deg, #1e293b 10%, #0f172a 90%)",
    duration: 168,
    energy: "energetic"
  },
  {
    id: "onthestreet",
    title: "on the street (with J. Cole)",
    artist: "j-hope",
    album: "on the street",
    albumArt: "linear-gradient(135deg, #ffedd5 10%, #f97316 90%)",
    duration: 208,
    energy: "chill"
  },
  {
    id: "likecrazy",
    title: "Like Crazy",
    artist: "Jimin",
    album: "FACE",
    albumArt: "linear-gradient(135deg, #f3e8ff 10%, #a855f7 90%)",
    duration: 212,
    energy: "chill"
  },
  {
    id: "slowdancing",
    title: "Slow Dancing",
    artist: "V",
    album: "Layover",
    albumArt: "linear-gradient(135deg, #d1fae5 10%, #10b981 90%)",
    duration: 187,
    energy: "chill"
  },
  {
    id: "seven",
    title: "Seven (feat. Latto)",
    artist: "Jungkook",
    album: "GOLDEN",
    albumArt: "linear-gradient(135deg, #dbeafe 10%, #3b82f6 90%)",
    duration: 184,
    energy: "energetic"
  }
];

export function getInitialChatRooms(): ChatRoom[] {
  return [
    {
      memberId: "rm",
      memberName: "RM",
      avatar: "🐨",
      messages: [
        { id: "rm_1", sender: "member", text: "阿米，最近有看什么好书吗？📚", timestamp: "昨天 14:32" },
        { id: "rm_2", sender: "user", text: "有一本关于治愈和成长的。南俊呢？", timestamp: "昨天 14:35" },
        { id: "rm_3", sender: "member", text: "我也在读诗集。今天天气很好，很适合坐在阳光下听音乐。我刚才在Spotify上开始听这首歌，要不要一起听？", timestamp: "今天 11:20", isMusicShare: true, musicTrack: spotifyTracks.find(t => t.id === "wildflower") }
      ]
    },
    {
      memberId: "jin",
      memberName: "Jin",
      avatar: "🐹",
      messages: [
        { id: "jin_1", sender: "member", text: "阿米！今天我做出了超好吃的参鸡汤！如果阿米在的话就可以一起抢鸡腿了！哈哈哈！", timestamp: "昨天 18:05" },
        { id: "jin_2", sender: "user", text: "大帅哥又在炫耀厨艺啦，我也想吃！", timestamp: "昨天 18:10" },
        { id: "jin_3", sender: "member", text: "那下次阿米过来我煮给你吃！现在在太空船里有点无聊，让我们听首快乐的歌吧！火箭起飞——🚀✨", timestamp: "今天 12:00", isMusicShare: true, musicTrack: spotifyTracks.find(t => t.id === "astronaut") }
      ]
    },
    {
      memberId: "suga",
      memberName: "SUGA",
      avatar: "🐱",
      messages: [
        { id: "suga_1", sender: "member", text: "在工作室做歌到早上。刚醒。阿米忙完了没？", timestamp: "今天 10:45" },
        { id: "suga_2", sender: "user", text: "玧其辛苦了！要注意休息，不要太熬夜了哦。", timestamp: "今天 10:48" },
        { id: "suga_3", sender: "member", text: "知道。别担心，熬夜是常态了。刚在调音这首歌，点进来一起听听看？", timestamp: "今天 13:00", isMusicShare: true, musicTrack: spotifyTracks.find(t => t.id === "haegeum") }
      ]
    },
    {
      memberId: "jhope",
      memberName: "j-hope",
      avatar: "🐿️",
      messages: [
        { id: "jh_1", sender: "member", text: "阿米！！！今天又是活力满满的一天！☀️ 刚才跳舞出了一身汗超级爽快！你在干嘛呀？", timestamp: "今天 09:15" },
        { id: "jh_2", sender: "user", text: "我也在开始工作/学习啦，看到厚比的信息瞬间也有了动力！", timestamp: "今天 09:20" },
        { id: "jh_3", sender: "member", text: "嘿嘿，那就好！听到你有动力，我比谁都开心！来，给你分享一首我街跑时最爱单曲，跟着节奏摇摆起来吧！🕺💜", timestamp: "今天 13:10", isMusicShare: true, musicTrack: spotifyTracks.find(t => t.id === "onthestreet") }
      ]
    },
    {
      memberId: "jimin",
      memberName: "Jimin",
      avatar: "🐣",
      messages: [
        { id: "jm_1", sender: "member", text: "阿米，今天有没有吃饱饭呢？降温了，出门记得多穿一件外套，千万别感冒了。🐥", timestamp: "昨天 20:30" },
        { id: "jm_2", sender: "user", text: "智旻也是，要穿暖和！我很乖的有吃饱饭！", timestamp: "昨天 20:45" },
        { id: "jm_3", sender: "member", text: "太好了，真乖。我刚好在练舞室休息，戴着耳机在听这首歌，很舒服的旋律。阿米，我们一起戴耳机听歌吧——🎧💛", timestamp: "今天 13:30", isMusicShare: true, musicTrack: spotifyTracks.find(t => t.id === "likecrazy") }
      ]
    },
    {
      memberId: "v",
      memberName: "V",
      avatar: "🐻",
      messages: [
        { id: "v_1", sender: "member", text: "阿米，看我今天拍的黑白底片，是我最喜欢的复古风格 📷✨ 像不像旧电影里的画面？", timestamp: "今天 10:00" },
        { id: "v_2", sender: "user", text: "哇，泰亨拍得太有故事感了，帅惨了！", timestamp: "今天 10:05" },
        { id: "v_3", sender: "member", text: "谢谢阿米喜欢。今天微风吹得很舒服，我们一起享受属于萨克斯管和黑胶唱片的闲暇时光吧 🎷", timestamp: "今天 13:45", isMusicShare: true, musicTrack: spotifyTracks.find(t => t.id === "slowdancing") }
      ]
    },
    {
      memberId: "jungkook",
      memberName: "Jungkook",
      avatar: "🐰",
      messages: [
        { id: "jk_1", sender: "member", text: "阿米！最近我练了新的拳击课程和吉他弹唱，等有机会在直播里展示给你看哦！🥊🎸", timestamp: "今天 11:30" },
        { id: "jk_2", sender: "user", text: "超级期待！柾国永远都在充满热情地学习新东西，太棒了！", timestamp: "今天 11:35" },
        { id: "jk_3", sender: "member", text: "因为想让阿米觉得我是个配得上你们喜爱的厉害的人嘛。这首歌一直在我的常听歌单榜首，咱们两个连线一起嗨起来吧！🐰💜", timestamp: "今天 14:00", isMusicShare: true, musicTrack: spotifyTracks.find(t => t.id === "seven") }
      ]
    }
  ];
}

export function getInitialPosts(): InstagramPost[] {
  return [
    {
      id: "post_rm_1",
      memberId: "rm",
      memberName: "RM",
      avatar: "🐨",
      image: "linear-gradient(to bottom, #d6d3d1, #78716c)",
      content: "finding pieces in stone and wood. 🎨🌳 #rkive",
      likes: 8529320,
      comments: [
        { id: "c_rm_1", author: "j.m", avatar: "🐣", text: "哥最近的照片越来越酷了，下次一起去博物馆呀！", date: "4小时前" },
        { id: "c_rm_2", author: "thv", avatar: "🐻", text: "底片色彩很有感觉。🐨", date: "2小时前" }
      ],
      date: "5小时前",
      likedByUser: false
    },
    {
      id: "post_jungkook_1",
      memberId: "jungkook",
      memberName: "Jungkook",
      avatar: "🐰",
      image: "linear-gradient(to bottom, #1e3a8a, #000000)",
      content: "Practice, practice, practice! 🎤🎶 Always preparing for you. See you soon in purple ocean! 💜 #GOLDEN",
      likes: 12048920,
      comments: [
        { id: "c_jk_1", author: "jin", avatar: "🐹", text: "呀，柾国啊，练完快来洗碗，肉我都煮好了！", date: "1小时前" },
        { id: "c_jk_2", author: "uarmyhope", avatar: "🐿️", text: "Our Golden Maknae so cool! 🔥🐥", date: "30分钟前" }
      ],
      date: "2小时前",
      likedByUser: true
    },
    {
      id: "post_v_1",
      memberId: "v",
      memberName: "V",
      avatar: "🐻",
      image: "linear-gradient(to bottom, #064e3b, #042f1a)",
      content: "Classic never dies. Jazz for rainy afternoon 🎷☕🖤",
      likes: 9942040,
      comments: [
        { id: "c_v_1", author: "rkive", avatar: "🐨", text: "This album is masterpiece.", date: "6小时前" }
      ],
      date: "9小时前",
      likedByUser: false
    }
  ];
}

export const btsNewPostsPool: Omit<InstagramPost, "comments">[] = [
  {
    id: "pool_jin_1",
    memberId: "jin",
    memberName: "Jin",
    avatar: "🐹",
    image: "linear-gradient(to bottom, #fdf2f8, #fbcfe8)",
    content: "Worldwide Handsome in the mirror. 镜子里的人怎么能比昨天又帅了？🤔✨ #Jin #Astronaut",
    likes: 7490212,
    date: "刚刚"
  },
  {
    id: "pool_suga_1",
    memberId: "suga",
    memberName: "SUGA",
    avatar: "🐱",
    image: "linear-gradient(to bottom, #18181b, #09090b)",
    content: "D-DAY Tour review. 感谢所有来现场的阿米，谢谢你们带给我的感动。🎹🐱 #AgustD",
    likes: 8904211,
    date: "刚刚"
  },
  {
    id: "pool_jhope_1",
    memberId: "jhope",
    memberName: "j-hope",
    avatar: "🐿️",
    image: "linear-gradient(to bottom, #fef3c7, #f59e0b)",
    content: "Hope on the street. 即使在路口，也永远不要停下舞步！💃☀️ Let's get it! #uarmyhope",
    likes: 8219402,
    date: "刚刚"
  },
  {
    id: "pool_jimin_1",
    memberId: "jimin",
    memberName: "Jimin",
    avatar: "🐣",
    image: "linear-gradient(to bottom, #faf5ff, #e9d5ff)",
    content: "FACE of Jimin. 每一张面孔，都藏着我对你们想说的话。🐥💛 #FACE #LikeCrazy",
    likes: 9284201,
    date: "刚刚"
  }
];
