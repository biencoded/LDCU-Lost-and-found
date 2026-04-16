import type { Request, Response } from 'express';
import { ItemService } from '../services/item.service';
import { CreateItemDto, UpdateItemStatusDto } from '../types';

// ================= DEMO DATA =================
const DEMO_ITEMS = [
  {
    id: 1,
    item_name: 'Silver iPhone 14',
    description: 'Lost at the library. Last seen near the study area. Has a blue case.',
    status: 'pending',
    created_at: new Date('2026-04-15'),
  },
  {
    id: 2,
    item_name: 'Black Leather Wallet',
    description: 'Lost in the cafeteria on Tuesday. Contains ID and credit cards.',
    status: 'pending',
    created_at: new Date('2026-04-14'),
  },
  {
    id: 3,
    item_name: 'Blue Backpack',
    description: 'Lost at the parking lot. Contains textbooks and laptop.',
    status: 'found',
    created_at: new Date('2026-04-13'),
  },
  {
    id: 4,
    item_name: 'Gold Wedding Ring',
    description: 'Lost during campus event. Sentimental value. Reward offered.',
    status: 'claimed',
    created_at: new Date('2026-04-12'),
  },
];

/**
 * Controller for lost item routes
 * Handles HTTP requests and delegates to service layer
 * Falls back to demo data if database is unavailable
 */
export class ItemController {
  /**
   * GET /api/items
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const items = await ItemService.getAllItems();
      res.json(items);
    } catch (error) {
      // Return demo data if database unavailable
      res.json(DEMO_ITEMS);
    }
  }

  /**
   * GET /api/items/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const idParam = req.params['id'];
      const id = parseInt(Array.isArray(idParam) ? idParam[0] : idParam, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid item ID' });
        return;
      }

      const item = await ItemService.getItemById(id);
      res.json(item);
    } catch (error) {
      // Try to find in demo data
      const idParam = req.params['id'];
      const id = parseInt(Array.isArray(idParam) ? idParam[0] : idParam, 10);
      const demoItem = DEMO_ITEMS.find(item => item.id === id);

      if (demoItem) {
        res.json(demoItem);
        return;
      }

      const message = error instanceof Error ? error.message : 'Failed to fetch item';
      res.status(error instanceof Error && error.message === 'Item not found' ? 404 : 500).json({ error: message });
    }
  }

  /**
   * GET /api/items/search?status=pending
   */
  static async search(req: Request, res: Response): Promise<void> {
    try {
      const statusParam = req.query['status'];
      const status = (Array.isArray(statusParam) ? statusParam[0] : statusParam) as string | undefined;
      if (!status || !['pending', 'found', 'claimed'].includes(status)) {
        res.status(400).json({ error: 'Invalid status parameter' });
        return;
      }

      const items = await ItemService.searchByStatus(status as 'pending' | 'found' | 'claimed');
      res.json(items);
    } catch (error) {
      // Return filtered demo data
      const statusParam = req.query['status'];
      const status = (Array.isArray(statusParam) ? statusParam[0] : statusParam) as string | undefined;

      if (status && ['pending', 'found', 'claimed'].includes(status)) {
        const filtered = DEMO_ITEMS.filter(item => item.status === status);
        res.json(filtered);
        return;
      }

      const message = error instanceof Error ? error.message : 'Search failed';
      res.status(500).json({ error: message });
    }
  }

  /**
   * POST /api/items
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const dto: CreateItemDto = req.body;
      const item = await ItemService.createItem(dto);
      res.status(201).json(item);
    } catch (error) {
      // Demo mode: Create item in memory
      const dto: CreateItemDto = req.body;
      if (!dto.item_name || !dto.description) {
        res.status(400).json({ error: 'item_name and description are required' });
        return;
      }

      const newItem = {
        id: DEMO_ITEMS.length + 1,
        item_name: dto.item_name,
        description: dto.description,
        status: 'pending' as const,
        created_at: new Date(),
      };

      DEMO_ITEMS.push(newItem);
      res.status(201).json(newItem);
    }
  }

  /**
   * PUT /api/items/:id
   */
  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const idParam = req.params['id'];
      const id = parseInt(Array.isArray(idParam) ? idParam[0] : idParam, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid item ID' });
        return;
      }

      const dto: UpdateItemStatusDto = req.body;
      const item = await ItemService.updateItemStatus(id, dto);
      res.json(item);
    } catch (error) {
      // Demo mode: Update in memory
      const idParam = req.params['id'];
      const id = parseInt(Array.isArray(idParam) ? idParam[0] : idParam, 10);
      const dto: UpdateItemStatusDto = req.body;

      const demoItem = DEMO_ITEMS.find(item => item.id === id);
      if (demoItem) {
        demoItem.status = dto.status;
        res.json(demoItem);
        return;
      }

      const message = error instanceof Error ? error.message : 'Failed to update item';
      res.status(error instanceof Error && error.message === 'Item not found' ? 404 : 400).json({ error: message });
    }
  }

  /**
   * DELETE /api/items/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const idParam = req.params['id'];
      const id = parseInt(Array.isArray(idParam) ? idParam[0] : idParam, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid item ID' });
        return;
      }

      const result = await ItemService.deleteItem(id);
      res.json(result);
    } catch (error) {
      // Demo mode: Delete from memory
      const idParam = req.params['id'];
      const id = parseInt(Array.isArray(idParam) ? idParam[0] : idParam, 10);

      const index = DEMO_ITEMS.findIndex(item => item.id === id);
      if (index !== -1) {
        DEMO_ITEMS.splice(index, 1);
        res.json({ message: 'Item deleted successfully' });
        return;
      }

      const message = error instanceof Error ? error.message : 'Failed to delete item';
      res.status(error instanceof Error && error.message === 'Item not found' ? 404 : 500).json({ error: message });
    }
  }

  /**
   * GET /api/stats
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await ItemService.getStats();
      res.json(stats);
    } catch (error) {
      // Return demo stats
      const stats = {
        total_items: DEMO_ITEMS.length,
        pending_items: DEMO_ITEMS.filter(item => item.status === 'pending').length,
        found_items: DEMO_ITEMS.filter(item => item.status === 'found').length,
        claimed_items: DEMO_ITEMS.filter(item => item.status === 'claimed').length,
      };
      res.json(stats);
    }
  }
}
