// ---- User & Location ----
export interface Location {
  country: string;
  state: string;
  district?: string;
  city: string;
  area?: string; // village or neighborhood
  latitude?: number;
  longitude?: number;
}

export interface User {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  profilePicture?: string;
  coverPhoto?: string;
  bio?: string;
  currentLocation?: Location;
  hometown?: Location;
  state?: string;
  country?: string;
  occupation?: string;
  education?: string;
  interests: string[];
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    github?: string;
    website?: string;
  };
  role: UserRole;
  isActive: boolean;
  followers: string[];
  following: string[];
  blockedUsers: string[];
  createdAt: string;
  updatedAt: string;
}
export type UserRole = 'user' | 'moderator' | 'admin' | 'superadmin';

// ---- Auth ----
export interface LoginCredentials { email: string; password: string; }
export interface RegisterData { 
  fullName: string; 
  username: string; 
  email: string; 
  password: string; 
  confirmPassword: string;
  currentLocation?: Location;
  hometown?: Location;
}

// ---- Community ----
export interface Community {
  _id: string; name: string; slug: string; description: string; logo?: string; coverImage?: string; coverPhoto?: string;
  city: string; state: string; country: string; type: 'public' | 'private'; category: string;
  owner: User | string; rules: string[]; isActive: boolean; memberCount: number;
  createdAt: string; updatedAt: string;
}
export interface CommunityMember {
  _id: string; userId: User | string; communityId: string; role: 'member' | 'moderator' | 'owner';
  status: 'pending' | 'approved' | 'rejected' | 'banned'; joinedAt: string;
}

// ---- Post ----
export type PostType = 'text' | 'image' | 'poll' | 'announcement' | 'event';
export interface PollOption { text: string; votes: string[]; }
export interface PollData { question: string; options: PollOption[]; expiresAt?: string; totalVotes: number; }
export interface Post {
  _id: string; authorId: User | string; communityId: Community | string; type: PostType;
  title?: string; content: string; media: string[]; pollData?: PollData;
  isPinned: boolean; isApproved: boolean; hashtags: string[]; mentions: string[];
  likes: string[]; bookmarks: string[]; commentCount: number; createdAt: string; updatedAt: string;
}

// ---- Comment ----
export interface Comment {
  _id: string; postId: string; authorId: User | string; parentId?: string;
  content: string; mentions: string[]; likes: string[]; replyCount: number;
  isEdited: boolean; createdAt: string; updatedAt: string;
}

// ---- Event ----
export interface Event {
  _id: string; communityId: Community | string; organizerId: User | string;
  title: string; description: string; banner?: string; coverPhoto?: string; category?: string; startDate: string; endDate?: string; date?: string;
  venue: string; address?: string; city: string; state?: string;
  location?: { type: 'Point'; coordinates: [number, number] };
  qrCode?: string; going: string[]; interested: string[]; notGoing: string[]; attendees?: string[];
  isActive: boolean; createdAt: string;
}

// ---- Notification ----
export type NotificationType = 'LIKE' | 'COMMENT' | 'FOLLOW' | 'EVENT' | 'SYSTEM';
export interface Notification {
  _id: string; 
  recipient: string; 
  sender?: User; 
  type: NotificationType;
  content: string; 
  read: boolean; 
  relatedId?: string; 
  createdAt: string;
}

// ---- Report ----
export interface Report {
  _id: string; reporterId: User | string; targetId: string;
  targetModel: 'User' | 'Post' | 'Comment' | 'Community';
  reason: string; description?: string; status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewedBy?: User | string; resolution?: string; createdAt: string; resolvedAt?: string;
}

// ---- API ----
export interface ApiResponse<T> { success: boolean; data: T; message?: string; }
export interface PaginatedResponse<T> {
  success: boolean; data: T[]; pagination: { page: number; limit: number; total: number; totalPages: number; hasMore: boolean; };
}
export interface ApiError { success: false; message: string; errors?: Record<string, string>; }
