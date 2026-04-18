import mysql, { Pool } from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { dbConfig } from './config';

let pool: Pool | null = null;

// ================= INITIALIZE DATABASE =================
export async function initializeDatabase(): Promise<void> {
  console.log('⏳ Initializing database...');

  // Create database if it doesn't exist
  const bootstrap = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
  });

  try {
    await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
  } finally {
    await bootstrap.end();
  }

  // Create connection pool
  pool = mysql.createPool({
    ...dbConfig,
    connectionLimit: 10,
    waitForConnections: true,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });

  // Create tables
  await createTables();

  // Seed initial data
  await seedData();

  console.log('✅ Database ready');
}

// ================= CREATE TABLES =================
async function createTables(): Promise<void> {
  const pool_ref = getPool();

  await pool_ref.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(120) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool_ref.query(`
    CREATE TABLE IF NOT EXISTS lost_items (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      item_name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      status ENUM('pending', 'found', 'claimed') NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// ================= SEED DATA =================
async function seedData(): Promise<void> {
  const pool_ref = getPool();

  // Seed admin user
  await pool_ref.query(
    `
      INSERT INTO users (username, name, password, role)
      VALUES (?, ?, ?, 'admin')
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        password = VALUES(password),
        role = VALUES(role)
    `,
    ['admin', 'System Administrator', bcrypt.hashSync('admin123', 10)]
  );

  // Seed demo user
  await pool_ref.query(
    `
      INSERT INTO users (username, name, password, role)
      VALUES (?, ?, ?, 'user')
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        password = VALUES(password),
        role = VALUES(role)
    `,
    ['demo', 'Demo User', bcrypt.hashSync('demo123', 10)]
  );

  console.log('📝 Demo Users Seeded:');
  console.log('   Admin: username="admin" password="admin123"');
  console.log('   User:  username="demo" password="demo123"');

  // Seed sample lost items for demo
  const sampleItems = [
    ['Silver iPhone 14', 'Lost at the library. Last seen near the study area. Has a blue case.', 'pending'],
    ['Black Leather Wallet', 'Lost in the cafeteria on Tuesday. Contains ID and credit cards.', 'pending'],
    ['Blue Backpack', 'Lost at the parking lot. Contains textbooks and laptop.', 'found'],
    ['Gold Wedding Ring', 'Lost during campus event. Sentimental value. Reward offered.', 'claimed'],
  ];

  for (const [name, desc, status] of sampleItems) {
    await pool_ref.query(
      `
        INSERT INTO lost_items (item_name, description, status)
        SELECT ?, ?, ?
        WHERE NOT EXISTS (
          SELECT 1 FROM lost_items WHERE item_name = ? AND description = ?
        )
      `,
      [name, desc, status, name, desc]
    );
  }

  console.log('📦 Sample Lost Items Seeded (4 items)');
}

// ================= GET POOL (SAFE ACCESS) =================
export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return pool;
}

// ================= CLOSE POOL =================
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('✅ Database connection closed');
  }
}
