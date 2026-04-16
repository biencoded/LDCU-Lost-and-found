// ================= FRONTEND TYPES =================
// These types are used by the Angular frontend

// ================= API DTOs (Data Transfer Objects) =================
export interface LoginDto {
  username: string;
  password: string;
  role: 'admin' | 'user';
}

export interface RegisterDto {
  username: string;
  password: string;
  name: string;
}

export interface CreateItemDto {
  item_name: string;
  description: string;
}

export interface UpdateItemStatusDto {
  status: 'pending' | 'found' | 'claimed';
}

// ================= RESPONSE DTOs =================
export interface UserResponse {
  username: string;
  role: 'admin' | 'user';
}

export interface LoginResponse {
  token: string;
  user: UserResponse;
}

export interface LostItemResponse {
  id: number;
  item_name: string;
  description: string;
  status: 'pending' | 'found' | 'claimed';
  created_at: string; // Date as string for JSON
}

export interface StatsResponse {
  total_items: number;
  pending_items: number;
  found_items: number;
  claimed_items: number;
}

// ================= ERROR RESPONSES =================
export interface ErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}
