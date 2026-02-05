import * as dotenv from 'dotenv';

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

export const JWT_SECRET = process.env.JWT_SECRET || 'change-me';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
