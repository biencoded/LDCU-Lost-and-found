import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

// ================= SERVER MODULES =================
import { initializeDatabase } from './server/database';
import { serverConfig } from './server/config';
import { AuthController } from './server/controllers/auth.controller';
import { ItemController } from './server/controllers/item.controller';
import { errorHandler, requestLogger, validateJsonBody } from './server/middleware/errors';

// ================= SETUP =================
const browserDistFolder = join(import.meta.dirname, '../browser');
const app = express();
const angularApp = new AngularNodeAppEngine();

// ================= MIDDLEWARE =================
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);
app.use(validateJsonBody);

// ================= AUTH ROUTES =================
app.post('/api/auth/login', (req, res) => AuthController.login(req, res));
app.post('/api/auth/register', (req, res) => AuthController.register(req, res));

// ================= ITEM ROUTES =================
app.get('/api/items', (req, res) => ItemController.getAll(req, res));
app.get('/api/items/:id', (req, res) => ItemController.getById(req, res));
app.get('/api/items/search', (req, res) => ItemController.search(req, res));
app.post('/api/items', (req, res) => ItemController.create(req, res));
app.put('/api/items/:id', (req, res) => ItemController.updateStatus(req, res));
app.delete('/api/items/:id', (req, res) => ItemController.delete(req, res));

// ================= STATS ROUTE =================
app.get('/api/stats', (req, res) => ItemController.getStats(req, res));
// ================= ANGULAR SSR =================
app.use(express.static(browserDistFolder));

app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next()
    )
    .catch(next);
});

// ================= ERROR HANDLER =================
app.use(errorHandler);

// ================= START SERVER =================
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = serverConfig.port;

  (async () => {
    try {
      await initializeDatabase();

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