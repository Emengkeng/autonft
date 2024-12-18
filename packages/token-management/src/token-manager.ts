import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { TokenAccount } from './models/token-account';
import { TokenTransaction } from './models/token-transaction';

export class TokenManager {
  private client: MongoClient;
  private db: Db;
  private accountsCollection: Collection<TokenAccount>;
  private transactionsCollection: Collection<TokenTransaction>;

  constructor(mongoUri: string, dbName: string) {
    this.client = new MongoClient(mongoUri);
    this.db = this.client.db(dbName);
    this.accountsCollection = this.db.collection('token_accounts');
    this.transactionsCollection = this.db.collection('token_transactions');
  }

  async connect() {
    await this.client.connect();

    // Create indexes for efficient querying
    await this.accountsCollection.createIndex({ userId: 1 }, { unique: true });
    await this.transactionsCollection.createIndex({ userId: 1, timestamp: -1 });
  }

  async createAccount(userId: string, initialBalance: number, tier: 'BASIC' | 'PREMIUM' | 'ENTERPRISE' = 'BASIC'): Promise<TokenAccount> {
    const account: TokenAccount = {
      _id: new ObjectId(),
      userId,
      balance: initialBalance,
      tier,
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    const findUser = await this.accountsCollection.findOne({userId: userId})
    if (findUser){
        return findUser
    }

    await this.accountsCollection.insertOne(account);
    return account;
  }

  async getBalance(userId: string): Promise<number> {
    const account = await this.accountsCollection.findOne({ userId });
    if (!account) {
      throw new Error(`No token account found for user ${userId}`);
    }
    return account.balance;
  }

  async deductTokens(userId: string, amount: number, description: string): Promise<TokenTransaction> {
    const account = await this.accountsCollection.findOne({ userId });
    if (!account) {
      throw new Error(`No token account found for user ${userId}`);
    }

    if (account.balance < amount) {
      throw new Error('Insufficient token balance');
    }

    const transaction: TokenTransaction = {
      _id: new ObjectId(),
      userId,
      amount: -amount,
      type: 'DEDUCT',
      timestamp: new Date(),
      description
    };

    // Use a transaction to ensure atomicity
    const session = this.client.startSession();
    try {
      await session.withTransaction(async () => {
        await this.accountsCollection.updateOne(
          { userId },
          {
            $inc: { balance: -amount },
            $set: { lastUpdated: new Date() }
          }
        );
        await this.transactionsCollection.insertOne(transaction);
      });
    } finally {
      session.endSession();
    }

    return transaction;
  }

  async creditTokens(userId: string, amount: number, description: string): Promise<TokenTransaction> {
    const account = await this.accountsCollection.findOne({ userId });
    if (!account) {
      throw new Error(`No token account found for user ${userId}`);
    }

    const transaction: TokenTransaction = {
      _id: new ObjectId(),
      userId,
      amount,
      type: 'CREDIT',
      timestamp: new Date(),
      description
    };

    const session = this.client.startSession();
    try {
      await session.withTransaction(async () => {
        await this.accountsCollection.updateOne(
          { userId },
          {
            $inc: { balance: amount },
            $set: { lastUpdated: new Date() }
          }
        );
        await this.transactionsCollection.insertOne(transaction);
      });
    } finally {
      session.endSession();
    }

    return transaction;
  }

  async getTransactionHistory(userId: string, limit: number = 50): Promise<TokenTransaction[]> {
    return this.transactionsCollection
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }
}