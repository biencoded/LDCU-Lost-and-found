import { RowDataPacket } from 'mysql2/promise';

// ================= DATABASE ROWS =================
export interface DbUserRow extends RowDataPacket {
  id: number;
  username: string;
  name: string;
  password: string;
  role: 'admin' | 'user';
  created_at: Date;
}

export interface DbLostItemRow extends RowDataPacket {
  id: number;
  item_name: string;
  description: string;
  status: 'pending' | 'found' | 'claimed';
  created_at: Date;
}

// ================= SHARED TYPES =================
// Re-export shared types for convenience
export type {
  LoginDto,
  RegisterDto,
  CreateItemDto,
  UpdateItemStatusDto,
  UserResponse,
  LoginResponse,
  LostItemResponse,
  StatsResponse,
  ErrorResponse,
} from '../shared/types';


