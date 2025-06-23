// Vercel Serverless Function for Entry Management Server

let server = null;
let isInitialized = false;

module.exports = async (req, res) => {
  try {
    // Set CORS headers for all requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Initialize server only once
    if (!isInitialized) {
      console.log('Initializing server for Vercel...');
      
      // Dynamic import to handle potential module loading issues
      const { default: Server } = require('../dist/index.js');
      const { database } = require('../dist/config/database.js');
      
      console.log('Creating server instance...');
      server = new Server();
      
      console.log('Connecting to database...');
      await database.connect();
      
      isInitialized = true;
      console.log('✅ Server initialized successfully for Vercel');
    }

    // Handle the request with the Express app
    const app = server.getApp();
    return app(req, res);
    
  } catch (error) {
    console.error('❌ Vercel function error:', error);
    
    // Send error response
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : 'Server initialization failed'
    });
  }
}; 