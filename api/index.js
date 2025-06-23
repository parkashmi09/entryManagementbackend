const Server = require('../dist/index.js').default;
const { database } = require('../dist/config/database.js');

let app;
let isInitialized = false;

module.exports = async (req, res) => {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Initialize the server only once
    if (!isInitialized) {
      console.log('🚀 Initializing Entry Management Server...');
      
      // Connect to database
      await database.connect();
      console.log('✅ Database connected');
      
      // Create server instance
      const server = new Server();
      app = server.getApp();
      
      isInitialized = true;
      console.log('✅ Server initialized');
    }
    
    // Handle the request
    return app(req, res);
    
  } catch (error) {
    console.error('❌ Server error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}; 