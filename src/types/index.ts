import { Request } from 'express';
import { Document } from 'mongoose';

// User Types
export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  mobileNo?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  mobileNo?: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

// Entry Types
export interface IEntry extends Document {
  _id: string;
  srNo: string;
  vehicleNo: string;
  nameDetails: string;
  date: Date;
  netWeight?: string;
  moisture?: string;
  gatePassNo?: string;
  mobileNo?: string;
  unload?: string;
  shortage?: string;
  remarks?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EntryResponse {
  id: string;
  srNo: string;
  vehicleNo: string;
  nameDetails: string;
  date: string;
  netWeight?: string;
  moisture?: string;
  gatePassNo?: string;
  mobileNo?: string;
  unload?: string;
  shortage?: string;
  remarks?: string;
  createdAt?: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  mobileNo?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

// Request Extensions
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Query Types
export interface QueryParams {
  page?: string;
  limit?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
} 