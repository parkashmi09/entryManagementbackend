import { Router } from 'express';
import { ResponseUtils } from '../utils/response';
import authRoutes from './authRoutes';
import entryRoutes from './entryRoutes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  ResponseUtils.success(res, 'Server is running successfully', {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/entries', entryRoutes);

// 404 handler
router.use('*', (req, res) => {
  ResponseUtils.notFound(res, `Route ${req.originalUrl} not found`);
});

export default router; 