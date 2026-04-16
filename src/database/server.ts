import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import mysql, { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(express.json({ limit: '10mb' }));

// ================= DB CONFIG =================
const dbConfig = {
  host: process.env['MYSQL_HOST'] || '127.0.0.1',
  port: Number(process.env['MYSQL_PORT'] || 3306),
  user: process.env['MYSQL_USER'] || 'root',
  password: process.env['MYSQL_PASSWORD'] || '',
  database: process.env['MYSQL_DATABASE'] || 'ldcu_lost_found',
};

let pool: Pool | null = null;

// ================= TYPES =================
interface DbUserRow extends RowDataPacket {
  id: number;
  username: string;
  password: string;
  role: 'admin' | 'user';
}

interface LostItemRow extends RowDataPacket {
  id: number;
  item_name: string;
  description: string;
  status: 'pending' | 'found' | 'claimed';
}

// ================= INIT DATABASE =================
async function initializeDatabase(): Promise<void> {
  console.log('⏳ Initializing database...');

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

  pool = mysql.createPool({
    ...dbConfig,
    connectionLimit: 10,
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(120) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS lost_items (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      item_name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      status ENUM('pending', 'found', 'claimed') NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(
    `
      INSERT INTO users (username, password, role)
      VALUES (?, ?, 'admin')
      ON DUPLICATE KEY UPDATE
        password = VALUES(password),
        role = VALUES(role)
    `,
    ['admin', bcrypt.hashSync('admin123', 10)]
  );

  console.log('✅ Database ready');
}

// ================= SAFE POOL =================
function getPool(): Pool {
  if (!pool) {
    throw new Error('Database not ready yet.');
  }
  return pool;
}

// ================= HELPERS =================
function sanitizeUser(user: DbUserRow) {
  return {
    username: user.username,
    role: user.role,
  };
}

function normalizeLostItem(row: LostItemRow) {
  return {
    id: row.id,
    item_name: row.item_name,
    description: row.description,
    status: row.status,
  };
}

// ================= ROUTES =================

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ error: 'Server starting, try again.' });
    }

    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ error: 'All fields required.' });
    }

    const [rows] = await getPool().execute<DbUserRow[]>(
      `SELECT * FROM users WHERE username = ? AND role = ? LIMIT 1`,
      [username, role]
    );

    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.json({
      token: 'demo-token',
      user: sanitizeUser(user),
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// REGISTER
app.post('/api/auth/register', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ error: 'Server starting, try again.' });
    }

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    await getPool().execute(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, bcrypt.hashSync(password, 10)]
    );

    return res.status(201).json({ message: 'User created' });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Register failed' });
  }
});

// ITEMS
app.get('/api/items', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ error: 'Server starting, try again.' });
    }

    const [rows] = await getPool().execute<LostItemRow[]>(
      'SELECT * FROM lost_items ORDER BY id DESC'
    );

    return res.json(rows.map(normalizeLostItem));

  } catch (error) {
    console.error('Items error:', error);
    return res.status(500).json({ error: 'Failed to fetch items' }); // ✅ ADD return
  }
});
// ================= ANGULAR =================
app.use(express.static(browserDistFolder));

app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next()
    )
    .catch(next);
});

// ================= START SERVER =================
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;

  (async () => {
    try {
      await initializeDatabase(); // 🔥 FIXED

      app.listen(port, () => {
        console.log(`🚀 Server running at http://localhost:${port}`);
      });

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  })();
}

export const reqHandler = createNodeRequestHandler(app);