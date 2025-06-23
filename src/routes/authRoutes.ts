import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { validateRegister, validateLogin, validateUpdateProfile } from '../middleware/validation';

const router = Router();

// Public routes with rate limiting
router.post('/register', authLimiter, validateRegister, AuthController.register);
router.post('/login', authLimiter, validateLogin, AuthController.login);
router.post('/refresh-token', authLimiter, AuthController.refreshToken);

// Protected routes
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', authenticate, validateUpdateProfile, AuthController.updateProfile);
router.post('/logout', authenticate, AuthController.logout);

export default router; 