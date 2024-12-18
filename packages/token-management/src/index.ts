export * from './token-manager';
//export * from './models';
//export * from './admin-service';
//export * from './credit-scheduler';

/*************

import { TokenManager, TokenCreditScheduler, TokenAdminService } from '@your-org/token-management';

// Initialize
const tokenManager = new TokenManager('mongodb://localhost:27017', 'token_db');
await tokenManager.connect();

// Create an account
await tokenManager.createAccount('user123', 100, 'BASIC');

// Deduct tokens
await tokenManager.deductTokens('user123', 10, 'Twitter interaction');

// Admin adjust balance
await adminService.adjustUserBalance('user123', 50, 'Bonus credit');

// Change user tier
await adminService.changeTier('user123', 'PREMIUM');

*/