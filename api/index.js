// Vercel Serverless Function for Entry Management Server
const express = require('express');

// Cache the server instance
let cachedServer = null;

async function createServer() {
  if (cachedServer) {
    return cachedServer;
  }

  try {
    console.log('🚀 Initializing server for Vercel...');
    
    // Import modules
    const { default: Server } = require('../dist/index.js');
    const { database } = require('../dist/config/database.js');
    
    console.log('📡 Connecting to database...');
    await database.connect();
    
    console.log('🏗️ Creating server instance...');
    const server = new Server();
    
    cachedServer = server.getApp();
    console.log('✅ Server cached and ready');
    
    return cachedServer;
  } catch (error) {
    console.error('❌ Server initialization failed:', error);
    throw error;
  }
}

module.exports = async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    console.log(`📥 ${req.method} ${req.url}`);
    
    // Get or create server
    const app = await createServer();
    
    // Handle the request
    return app(req, res);
    
  } catch (error) {
    console.error('💥 Function error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}; 