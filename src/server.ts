import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(express.json());

interface AuthUser {
  email: string;
  password: string;
  role: 'admin' | 'student';
  name: string;
}

const users: AuthUser[] = [
  {
    email: 'admin@ldcu.edu.ph',
    password: 'admin123',
    role: 'admin',
    name: 'Administrator',
  },
  {
    email: 'student@ldcu.edu.ph',
    password: 'student123',
    role: 'student',
    name: 'Student User',
  },
];

app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body as {
    email?: string;
    password?: string;
    role?: string;
  };

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role are required.' });
  }

  const user = users.find(
    (entry) => entry.email === email && entry.password === password && entry.role === role,
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. Please try again.' });
  }

  return res.json({
    token: 'fake-jwt-token',
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

interface LostFoundItem {
  id: number;
  title: string;
  description: string;
  category: 'Lost' | 'Found';
  location: string;
  date: string;
  status: 'open' | 'claimed';
}

const items: LostFoundItem[] = [];
let nextItemId = 1;

app.get('/api/items', (req, res) => {
  const { status, category, q } = req.query;
  let result = items;

  if (status && typeof status === 'string') {
    result = result.filter((item) => item.status === status);
  }

  if (category && typeof category === 'string') {
    result = result.filter((item) => item.category === category);
  }

  if (q && typeof q === 'string') {
    const query = q.toLowerCase();
    result = result.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query),
    );
  }

  return res.json(result);
});

app.get('/api/items/:id', (req, res) => {
  const id = Number(req.params.id);
  const item = items.find((entry) => entry.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  return res.json(item);
});

app.post('/api/items', (req, res) => {
  const { title, description, category, location, date } = req.body;

  if (!title || !description || !category || !location || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newItem: LostFoundItem = {
    id: nextItemId++,
    title,
    description,
    category,
    location,
    date,
    status: 'open',
  };

  items.push(newItem);
  return res.status(201).json(newItem);
});

app.put('/api/items/:id', (req, res) => {
  const id = Number(req.params.id);
  const item = items.find((entry) => entry.id === id);

  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const { title, description, category, location, date, status } = req.body;
  if (title) item.title = title;
  if (description) item.description = description;
  if (category) item.category = category;
  if (location) item.location = location;
  if (date) item.date = date;
  if (status) item.status = status;

  return res.json(item);
});

app.delete('/api/items/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = items.findIndex((entry) => entry.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }

  items.splice(index, 1);
  return res.status(204).send();
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
