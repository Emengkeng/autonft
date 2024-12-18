import { ObjectId } from 'mongodb';

export interface TokenAccount {
  _id: ObjectId;
  userId: string;
  balance: number;
  tier: 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  createdAt: Date;
  lastUpdated: Date;
  metadata?: Record<string, any>;
}