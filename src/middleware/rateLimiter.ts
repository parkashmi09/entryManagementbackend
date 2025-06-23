import rateLimit from 'express-rate-limit';
import { config } from '../config/config';

// General rate limiter - Very permissive for development
export const generalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: 10000, // Increased to 10,000 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Very permissive rate limiter for auth endpoints - allows 100 logins per minute
export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 100, // 100 authentication requests per minute (way more than needed)
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// API rate limiter - Very permissive
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 5000, // 5,000 API requests per minute
  message: {
    success: false,
    message: 'Too many API requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Export rate limiter - More permissive
export const exportLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 100, // 100 exports per minute
  message: {
    success: false,
    message: 'Too many export requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
}); 