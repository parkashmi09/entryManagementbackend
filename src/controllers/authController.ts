import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User';
import { JWTUtils } from '../utils/jwt';
import { ResponseUtils } from '../utils/response';
import { LoginRequest, RegisterRequest, AuthenticatedRequest } from '../types';

export class AuthController {
  /**
   * User registration
   */
  static async register(req: Request<{}, {}, RegisterRequest>, res: Response): Promise<void> {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        ResponseUtils.validationError(res, errors.array());
        return;
      }

      const { name, email, password, mobileNo } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        ResponseUtils.conflict(res, 'User with this email already exists');
        return;
      }

      // Create new user
      const user = new User({
        name,
        email,
        password,
        mobileNo,
      });

      await user.save();

      // Generate tokens
      const tokenPayload = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      };
      const tokens = JWTUtils.generateTokens(tokenPayload);

      ResponseUtils.success(res, 'User registered successfully', {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mobileNo: user.mobileNo,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
        ...tokens,
      }, 201);
    } catch (error) {
      console.error('Registration error:', error);
      ResponseUtils.error(res, 'Failed to register user');
    }
  }

  /**
   * User login
   */
  static async login(req: Request<{}, {}, LoginRequest>, res: Response): Promise<void> {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        ResponseUtils.validationError(res, errors.array());
        return;
      }

      const { email, password } = req.body;

      // Find user with password
      const user = await User.findOne({ email, isActive: true }).select('+password');
      if (!user) {
        ResponseUtils.unauthorized(res, 'Invalid email or password');
        return;
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        ResponseUtils.unauthorized(res, 'Invalid email or password');
        return;
      }

      // Generate tokens
      const tokenPayload = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      };
      const tokens = JWTUtils.generateTokens(tokenPayload);

      ResponseUtils.success(res, 'Login successful', {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mobileNo: user.mobileNo,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
        ...tokens,
      });
    } catch (error) {
      console.error('Login error:', error);
      ResponseUtils.error(res, 'Failed to login');
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        ResponseUtils.validationError(res, [{ msg: 'Refresh token is required' }]);
        return;
      }

      // Verify refresh token
      const decoded = JWTUtils.verifyRefreshToken(refreshToken);

      // Check if user still exists and is active
      const user = await User.findOne({ _id: decoded.id, isActive: true });
      if (!user) {
        ResponseUtils.unauthorized(res, 'User not found or inactive');
        return;
      }

      // Generate new tokens
      const tokenPayload = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      };
      const tokens = JWTUtils.generateTokens(tokenPayload);

      ResponseUtils.success(res, 'Tokens refreshed successfully', tokens);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('expired')) {
          ResponseUtils.unauthorized(res, 'Refresh token expired');
        } else if (error.message.includes('invalid')) {
          ResponseUtils.unauthorized(res, 'Invalid refresh token');
        } else {
          ResponseUtils.unauthorized(res, 'Token refresh failed');
        }
      } else {
        ResponseUtils.error(res, 'Token refresh error');
      }
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    console.log('Getting profile for user:', req.user?.id);
    try {
      if (!req.user) {
        ResponseUtils.unauthorized(res, 'Authentication required');
        return;
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        ResponseUtils.notFound(res, 'User not found');
        return;
      }

      ResponseUtils.success(res, 'Profile retrieved successfully', {
        id: user._id,
        name: user.name,
        email: user.email,
        mobileNo: user.mobileNo,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      });
    } catch (error) {
      console.error('Get profile error:', error);
      ResponseUtils.error(res, 'Failed to get profile');
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtils.unauthorized(res, 'Authentication required');
        return;
      }

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        ResponseUtils.validationError(res, errors.array());
        return;
      }

      const { name, mobileNo } = req.body;

      const user = await User.findById(req.user.id);
      if (!user) {
        ResponseUtils.notFound(res, 'User not found');
        return;
      }

      // Update fields
      if (name) user.name = name;
      if (mobileNo !== undefined) user.mobileNo = mobileNo;

      await user.save();

      ResponseUtils.success(res, 'Profile updated successfully', {
        id: user._id,
        name: user.name,
        email: user.email,
        mobileNo: user.mobileNo,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      ResponseUtils.error(res, 'Failed to update profile');
    }
  }

  /**
   * Logout user (invalidate token on client side)
   */
  static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // In a real implementation, you might want to blacklist the token
      // For now, we'll just send a success response
      ResponseUtils.success(res, 'Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      ResponseUtils.error(res, 'Failed to logout');
    }
  }
} 