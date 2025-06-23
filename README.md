# Entry Management Server

A robust backend server for the Entry Management App built with Express.js, MongoDB, and TypeScript. This server provides secure API endpoints for user authentication, entry management, and data export functionality.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with refresh tokens
- **Entry Management**: Full CRUD operations for entry records
- **Data Export**: Export entries to Excel format
- **Security**: Rate limiting, CORS, helmet, input validation
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Comprehensive input validation with express-validator
- **Error Handling**: Global error handling with detailed error messages
- **TypeScript**: Full TypeScript support for better development experience

## 📋 Prerequisites

Before running this server, make sure you have the following installed:

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository** (if applicable)
   ```bash
   git clone <repository-url>
   cd EntryManagementServer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/entry-management

   # JWT Configuration (CHANGE THESE IN PRODUCTION!)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
   ```

4. **Start MongoDB**
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community

   # On Ubuntu/Debian
   sudo systemctl start mongod

   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Build the TypeScript code**
   ```bash
   npm run build
   ```

## 🚀 Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "mobileNo": "1234567890"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get User Profile
```http
GET /auth/profile
Authorization: Bearer <access_token>
```

#### Refresh Token
```http
POST /auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}
```

### Entry Management Endpoints

#### Create Entry
```http
POST /entries
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "srNo": "001",
  "vehicleNo": "MH01AB1234",
  "nameDetails": "John Doe Transport",
  "date": "2024-01-15",
  "netWeight": "1000kg",
  "moisture": "12%",
  "gatePassNo": "GP001",
  "mobileNo": "1234567890",
  "unload": "Completed",
  "shortage": "None",
  "remarks": "Good condition"
}
```

#### Get All Entries
```http
GET /entries?page=1&limit=10&search=truck&sortBy=date&sortOrder=desc
Authorization: Bearer <access_token>
```

Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `search`: Search term (searches in srNo, vehicleNo, nameDetails, etc.)
- `sortBy`: Sort field (srNo, vehicleNo, nameDetails, date, createdAt)
- `sortOrder`: Sort order (asc, desc)
- `startDate`: Filter entries from this date
- `endDate`: Filter entries until this date

#### Export Entries
```http
GET /entries/export?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <access_token>
```

Returns an Excel file with all entries in the specified date range.

### Response Format

#### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

#### Paginated Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    // Array of items
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents API abuse
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **Input Validation**: Comprehensive validation for all inputs
- **Password Hashing**: Bcrypt with configurable salt rounds

## 🏗️ Project Structure

```
src/
├── config/          # Configuration files
│   ├── config.ts    # Environment configuration
│   └── database.ts  # Database connection
├── controllers/     # Route controllers
│   ├── authController.ts
│   └── entryController.ts
├── middleware/      # Custom middleware
│   ├── auth.ts      # Authentication middleware
│   ├── rateLimiter.ts
│   └── validation.ts
├── models/          # Database models
│   ├── User.ts
│   └── Entry.ts
├── routes/          # API routes
│   ├── authRoutes.ts
│   ├── entryRoutes.ts
│   └── index.ts
├── types/           # TypeScript type definitions
│   └── index.ts
├── utils/           # Utility functions
│   ├── jwt.ts
│   └── response.ts
└── index.ts         # Main server file
```

## 🧪 Testing

Run tests (when implemented):
```bash
npm test
```

## 📱 Integration with React Native App

To integrate with the React Native Entry Management App:

1. **Update API Base URL**: In your React Native app, update the API base URL to point to this server:
   ```typescript
   const API_BASE_URL = 'http://localhost:3000/api/v1';
   // For Android emulator: http://10.0.2.2:3000/api/v1
   // For iOS simulator: http://localhost:3000/api/v1
   // For physical device: http://YOUR_COMPUTER_IP:3000/api/v1
   ```

2. **Replace AsyncStorage**: Replace the local storage logic in your React Native app with API calls to this server.

3. **Authentication Flow**: Update the authentication flow to use the JWT tokens returned by this server.

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**: Update all environment variables for production
   - Change JWT secrets
   - Update MongoDB URI
   - Set NODE_ENV to 'production'

2. **Database**: Set up a production MongoDB instance

3. **Security**: 
   - Use HTTPS in production
   - Update CORS origins
   - Configure rate limiting appropriately

4. **Monitoring**: Set up logging and monitoring solutions

### Docker Deployment

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions, please open an issue in the repository or contact the development team.

---

**Happy Coding! 🚀** 