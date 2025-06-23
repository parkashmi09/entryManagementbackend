import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Config {
  // Server Configuration
  PORT: number;
  NODE_ENV: string;
  
  // Database Configuration
  MONGODB_URI: string;
  MONGODB_TEST_URI: string;
  
  // JWT Configuration
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRE: string;
  
  // CORS Configuration
  CORS_ORIGIN: string[];
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  
  // File Upload Configuration
  MAX_FILE_SIZE: number;
  UPLOAD_PATH: string;
  
  // Security
  BCRYPT_SALT_ROUNDS: number;
}

const getEnvVar = (name: string, defaultValue?: string): string => {
  const value = process.env[name];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  return value || defaultValue!;
};

const getEnvNumber = (name: string, defaultValue?: number): number => {
  const value = process.env[name];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  const parsed = parseInt(value || defaultValue!.toString(), 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be a valid number`);
  }
  return parsed;
};

export const config: Config = {
  // Server Configuration
  PORT: getEnvNumber('PORT', 3000),
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  
  // Database Configuration
  MONGODB_URI: getEnvVar('MONGODB_URI', 'mongodb://localhost:27017/entry-management'),
  MONGODB_TEST_URI: getEnvVar('MONGODB_TEST_URI', 'mongodb://localhost:27017/entry-management-test'),
  
  // JWT Configuration
  JWT_SECRET: getEnvVar('JWT_SECRET', 'your-super-secret-jwt-key-change-this-in-production'),
  JWT_EXPIRE: getEnvVar('JWT_EXPIRE', '7d'),
  JWT_REFRESH_SECRET: getEnvVar('JWT_REFRESH_SECRET', 'your-super-secret-refresh-key-change-this-in-production'),
  JWT_REFRESH_EXPIRE: getEnvVar('JWT_REFRESH_EXPIRE', '30d'),
  
  // CORS Configuration
  CORS_ORIGIN: getEnvVar('CORS_ORIGIN', 'http://localhost:3000,http://localhost:19006,http://localhost:8081').split(','),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: getEnvNumber('RATE_LIMIT_WINDOW_MS', 900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),
  
  // File Upload Configuration
  MAX_FILE_SIZE: getEnvNumber('MAX_FILE_SIZE', 5242880), // 5MB
  UPLOAD_PATH: getEnvVar('UPLOAD_PATH', 'uploads/'),
  
  // Security
  BCRYPT_SALT_ROUNDS: getEnvNumber('BCRYPT_SALT_ROUNDS', 12),
};

// Validate critical configuration
if (config.NODE_ENV === 'production') {
  if (config.JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production') {
    throw new Error('JWT_SECRET must be changed in production environment');
  }
  if (config.JWT_REFRESH_SECRET === 'your-super-secret-refresh-key-change-this-in-production') {
    throw new Error('JWT_REFRESH_SECRET must be changed in production environment');
  }
} 