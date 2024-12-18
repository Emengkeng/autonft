import { ObjectId } from 'mongodb';

export interface TokenTransaction {
    _id: ObjectId;
    userId: string;
    amount: number;
    type: 'DEDUCT' | 'CREDIT' | 'ADMIN_ADJUSTMENT';
    timestamp: Date;
    description: string;
    metadata?: Record<string, any>;
}