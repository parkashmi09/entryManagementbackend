import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

import { config } from './config/config';
import { database } from './config/database';
import { ResponseUtils } from './utils/response';
import { generalLimiter } from './middleware/rateLimiter';
import routes from './routes';

class Server {
  private app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = config.PORT;
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    }));
    
    // CORS configuration
    this.app.use(cors({
      origin: config.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression middleware
    this.app.use(compression());

    // Logging middleware
    if (config.NODE_ENV !== 'test') {
      this.app.use(morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev'));
    }

    // Rate limiting
    this.app.use(generalLimiter);

    // Health check endpoint (before rate limiting)
    this.app.get('/ping', (req: Request, res: Response) => {
      res.status(200).json({ message: 'pong', timestamp: new Date().toISOString() });
    });
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use('/api/v1', routes);

    // Root endpoint
    this.app.get('/', (req: Request, res: Response) => {
      ResponseUtils.success(res, 'Entry Management Server API', {
        version: '1.0.0',
        description: 'Backend API for Entry Management App',
        endpoints: {
          health: '/api/v1/health',
          auth: '/api/v1/auth',
          entries: '/api/v1/entries',
        },
        documentation: 'https://github.com/your-repo/api-docs',
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use('*', (req: Request, res: Response) => {
      ResponseUtils.notFound(res, `Route ${req.originalUrl} not found`);
    });

    // Global error handler
    this.app.use((error: any, req: Request, res: Response, next: NextFunction): void => {
      console.error('Global error handler:', error);

      // Mongoose validation error
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map((err: any) => ({
          field: err.path,
          message: err.message,
        }));
        ResponseUtils.validationError(res, errors, 'Validation failed');
        return;
      }

      // Mongoose duplicate key error
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        ResponseUtils.conflict(res, `${field} already exists`);
        return;
      }

      // JWT errors
      if (error.name === 'JsonWebTokenError') {
        ResponseUtils.unauthorized(res, 'Invalid token');
        return;
      }

      if (error.name === 'TokenExpiredError') {
        ResponseUtils.unauthorized(res, 'Token expired');
        return;
      }

      // Cast error (invalid ObjectId)
      if (error.name === 'CastError') {
        ResponseUtils.validationError(res, [{ message: 'Invalid ID format' }]);
        return;
      }

      // Default error response
      ResponseUtils.error(
        res,
        config.NODE_ENV === 'production' ? 'Something went wrong' : error.message,
        config.NODE_ENV === 'production' ? undefined : [error.stack],
        error.statusCode || 500
      );
    });
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await database.connect();

      // Start server
      this.app.listen(this.port, () => {
        console.log(`
        ╔════════════════════════════════════════════════════════════════╗
        ║                                                                ║
        ║              🚀 Entry Management Server Started               ║
        ║                                                                ║
        ║  Environment: ${config.NODE_ENV.padEnd(10)}                              ║
        ║  Port:        ${this.port.toString().padEnd(10)}                              ║
        ║  Database:    MongoDB Connected                                ║
        ║                                                                ║
        ║  API URL:     http://localhost:${this.port}/api/v1                     ║
        ║  Health:      http://localhost:${this.port}/api/v1/health              ║
        ║                                                                ║
        ╚════════════════════════════════════════════════════════════════╝
        `);
      });

      // Graceful shutdown handling
      process.on('SIGTERM', this.gracefulShutdown.bind(this));
      process.on('SIGINT', this.gracefulShutdown.bind(this));
      process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        this.gracefulShutdown();
      });
      process.on('uncaughtException', (error) => {
        console.error('Uncaught Exception:', error);
        this.gracefulShutdown();
      });

    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private async gracefulShutdown(): Promise<void> {
    console.log('\n📡 Shutting down server gracefully...');
    
    try {
      await database.disconnect();
      console.log('✅ Database disconnected');
      console.log('👋 Server shutdown complete');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  }

  public getApp(): Application {
    return this.app;
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const server = new Server();
  server.start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

export default Server; 