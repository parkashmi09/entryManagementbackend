import { Router } from 'express';
import { EntryController } from '../controllers/entryController';
import { authenticate } from '../middleware/auth';
import { apiLimiter, exportLimiter } from '../middleware/rateLimiter';
import { validateCreateEntry, validateUpdateEntry, validatePagination } from '../middleware/validation';

const router = Router();

// All entry routes require authentication
router.use(authenticate);

// CRUD operations
router.post('/', apiLimiter, validateCreateEntry, EntryController.createEntry);
router.get('/', apiLimiter, validatePagination, EntryController.getEntries);

// Export functionality
router.get('/export', exportLimiter, EntryController.exportEntries);

export default router; 