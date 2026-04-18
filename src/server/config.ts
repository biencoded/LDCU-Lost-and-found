import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// ================= DATABASE CONFIGURATION =================
export const dbConfig = {
  host: process.env['MYSQL_HOST'] || '127.0.0.1',
  port: Number(process.env['MYSQL_PORT'] || 3306),
  user: process.env['MYSQL_USER'] || 'root',
  password: process.env['MYSQL_PASSWORD'] || '',
  database: process.env['MYSQL_DATABASE'] || 'ldcu_lost_found',
};

// ================= SERVER CONFIGURATION =================
export const serverConfig = {
  port: process.env['PORT'] || 4200,
  environment: process.env['NODE_ENV'] || 'development',
};

// ================= SESSION CONFIGURATION =================
export const sessionConfig = {
  secret: process.env['SESSION_SECRET'] || 'your-secret-key-change-me-in-production',
  timeout: Number(process.env['SESSION_TIMEOUT'] || 3600000), // 1 hour
};

// ================= SECURITY CONFIGURATION =================
export const securityConfig = {
  bcryptRounds: Number(process.env['BCRYPT_ROUNDS'] || 10),
};
