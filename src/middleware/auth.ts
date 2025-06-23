import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { JWTUtils } from '../utils/jwt';
import { ResponseUtils } from '../utils/response';
import User from '../models/User';

/**
 * Middleware to authenticate user using JWT token
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      ResponseUtils.unauthorized(res, 'Access token is required');
      return;
    }

    // Verify the token
    const decoded = JWTUtils.verifyAccessToken(token);

    // Check if user still exists and is active
    const user = await User.findOne({ _id: decoded.id, isActive: true });
    if (!user) {
      ResponseUtils.unauthorized(res, 'User not found or inactive');
      return;
    }

    // Add user info to request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        ResponseUtils.unauthorized(res, 'Access token expired');
      } else if (error.message.includes('invalid')) {
        ResponseUtils.unauthorized(res, 'Invalid access token');
      } else {
        ResponseUtils.unauthorized(res, 'Authentication failed');
      }
    } else {
      ResponseUtils.error(res, 'Authentication error');
    }
  }
};

/**
 * Middleware to authorize user based on role
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseUtils.unauthorized(res, 'Authentication required');
      return;
    }

    if (!roles.includes(req.user.role)) {
      ResponseUtils.forbidden(res, 'Insufficient permissions');
      return;
    }

    next();
  };
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTUtils.extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = JWTUtils.verifyAccessToken(token);
      const user = await User.findOne({ _id: decoded.id, isActive: true });
      
      if (user) {
        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
        };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
}; 