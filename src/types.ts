export interface SpotifyTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  duration: number; // in seconds
  audioUrl?: string;
  energy?: 'calm' | 'energetic' | 'sentimental' | 'chill';
}

export interface BTSMember {
  id: string;
  name: string;
  koreanName: string;
  role: string;
  bio: string;
  avatar: string; // Emoji avatar or initial
  instaHandle: string;
  instaName: string;
  wallpaper: string;
  color: string;
  currentSongId?: string; // what they are listening right now on Spotify
}

export interface Message {
  id: string;
  sender: 'user' | 'member';
  text: string;
  timestamp: string;
  image?: string;
  isMusicShare?: boolean;
  musicTrack?: SpotifyTrack;
}

export interface ChatRoom {
  memberId: string;
  memberName: string;
  avatar: string;
  remark?: string;
  messages: Message[];
  isSubscribed?: boolean; // if they have a custom bts subscription or just standard
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  date: string;
}

export interface InstagramPost {
  id: string;
  memberId: string;
  memberName: string;
  avatar: string;
  image: string; // URL / gradient CSS
  content: string;
  likes: number;
  comments: Comment[];
  date: string;
  likedByUser?: boolean;
}

export interface SettingsState {
  username: string;
  language: 'zh' | 'ko' | 'en';
  chatBg: string;
  autoReply: boolean;
  btsMood: 'happy' | 'gentle' | 'tired' | 'excited';
  statusMessage: string;
  avatar: string;
  geminiApiKey?: string;
}
