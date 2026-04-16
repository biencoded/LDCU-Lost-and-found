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
  port: process.env['PORT'] || 4000,
  environment: process.env['NODE_ENV'] || 'development',
};

// ================= SECURITY CONFIGURATION =================
export const securityConfig = {
  bcryptRounds: 10,
  tokenSecret: process.env['TOKEN_SECRET'] || 'your-secret-key-change-me',
};
