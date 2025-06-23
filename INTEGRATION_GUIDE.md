# Integration Guide: React Native App with Express Backend

This guide will help you integrate your existing React Native Entry Management App with the newly created backend server.

## 🔄 Migration Steps

### 1. Install HTTP Client

In your React Native app, install axios for API calls:

```bash
cd EntryManagementApp
npm install axios
```

### 2. Create API Service

Create a new file `src/services/apiService.ts`:

```typescript
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure base URL based on your environment
const BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api/v1'  // For iOS simulator
  // ? 'http://10.0.2.2:3000/api/v1'  // For Android emulator
  // ? 'http://YOUR_COMPUTER_IP:3000/api/v1'  // For physical device
  : 'https://your-production-api.com/api/v1';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              const { accessToken } = response.data;
              await AsyncStorage.setItem('accessToken', accessToken);
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            await this.logout();
            // Navigate to login screen
            // navigationRef.current?.navigate('Login');
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    const { accessToken, refreshToken } = response.data.data;
    
    await AsyncStorage.multiSet([
      ['accessToken', accessToken],
      ['refreshToken', refreshToken],
      ['userData', JSON.stringify(response.data.data.user)],
      ['isLoggedIn', 'true'],
    ]);

    return response.data;
  }

  async register(name: string, email: string, password: string, mobileNo?: string) {
    const response = await this.api.post('/auth/register', { 
      name, email, password, mobileNo 
    });
    const { accessToken, refreshToken } = response.data.data;
    
    await AsyncStorage.multiSet([
      ['accessToken', accessToken],
      ['refreshToken', refreshToken],
      ['userData', JSON.stringify(response.data.data.user)],
      ['isLoggedIn', 'true'],
    ]);

    return response.data;
  }

  async refreshToken(refreshToken: string) {
    return this.api.post('/auth/refresh-token', { refreshToken });
  }

  async logout() {
    await AsyncStorage.multiRemove([
      'accessToken',
      'refreshToken',
      'userData',
      'isLoggedIn',
    ]);
    await this.api.post('/auth/logout');
  }

  async getProfile() {
    const response = await this.api.get('/auth/profile');
    return response.data;
  }

  // Entry methods
  async createEntry(entryData: any) {
    const response = await this.api.post('/entries', entryData);
    return response.data;
  }

  async getEntries(params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    startDate?: string;
    endDate?: string;
  } = {}) {
    const response = await this.api.get('/entries', { params });
    return response.data;
  }

  async exportEntries(startDate?: string, endDate?: string) {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await this.api.get('/entries/export', {
      params,
      responseType: 'blob',
    });
    
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
```

### 3. Update Login Screen

Update your `LoginScreen.tsx`:

```typescript
// Replace the handleLogin function with:
const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert('Error', 'Please fill in all fields');
    return;
  }

  if (!validateEmail(email)) {
    Alert.alert('Error', 'Please enter a valid email address');
    return;
  }

  setLoading(true);

  try {
    const response = await apiService.login(email, password);
    console.log('Login successful:', response);
    navigation.replace('Home');
  } catch (error: any) {
    const message = error.response?.data?.message || 'Login failed. Please try again.';
    Alert.alert('Error', message);
  } finally {
    setLoading(false);
  }
};
```

### 4. Update Register Screen

Update your `RegisterScreen.tsx`:

```typescript
// Replace the handleRegister function with:
const handleRegister = async () => {
  if (!validateForm()) return;

  setLoading(true);

  try {
    const response = await apiService.register(name, email, password, mobileNo);
    console.log('Registration successful:', response);
    navigation.replace('Home');
  } catch (error: any) {
    const message = error.response?.data?.message || 'Registration failed. Please try again.';
    Alert.alert('Error', message);
  } finally {
    setLoading(false);
  }
};
```

### 5. Update Entry Management

Update your entry creation and fetching logic:

```typescript
// In AddEntryScreen.tsx or HomeScreen.tsx
const handleSubmit = async () => {
  if (!validateForm()) return;

  setLoading(true);

  try {
    const entryData = {
      srNo: formData.srNo,
      vehicleNo: formData.vehicleNo,
      nameDetails: formData.nameDetails,
      date: formData.date,
      netWeight: formData.netWeight,
      moisture: formData.moisture,
      gatePassNo: formData.gatePassNo,
      mobileNo: formData.mobileNo,
      unload: formData.unload,
      shortage: formData.shortage,
      remarks: formData.remarks,
    };

    const response = await apiService.createEntry(entryData);
    
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: 'Entry created successfully!',
    });

    // Reset form or navigate back
    resetForm();
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to create entry';
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: message,
    });
  } finally {
    setLoading(false);
  }
};

// For loading entries
const loadEntries = async () => {
  try {
    setLoading(true);
    const response = await apiService.getEntries({
      page: 1,
      limit: 50,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    
    setEntries(response.data);
  } catch (error: any) {
    console.error('Failed to load entries:', error);
  } finally {
    setLoading(false);
  }
};
```

### 6. Update Export Functionality

```typescript
const exportToExcel = async () => {
  try {
    setExporting(true);
    
    const blob = await apiService.exportEntries();
    
    // Handle file download/sharing
    // You might need react-native-fs for file operations
    Toast.show({
      type: 'success',
      text1: 'Export Successful',
      text2: 'File has been exported',
    });
  } catch (error: any) {
    Toast.show({
      type: 'error',
      text1: 'Export Failed',
      text2: error.response?.data?.message || 'Failed to export data',
    });
  } finally {
    setExporting(false);
  }
};
```

## 🔧 Configuration Notes

### Network Configuration

1. **iOS Simulator**: Use `http://localhost:3000`
2. **Android Emulator**: Use `http://10.0.2.2:3000`
3. **Physical Device**: Use your computer's IP address `http://192.168.x.x:3000`

### CORS Settings

The server is configured to accept requests from:
- `http://localhost:3000`
- `http://localhost:19006` (Expo)
- `http://localhost:8081` (Metro bundler)

If you need additional origins, update the `CORS_ORIGIN` in the server's `.env` file.

### Error Handling

The API returns consistent error responses:

```typescript
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field-specific error"
    }
  ]
}
```

Handle these appropriately in your React Native app.

## 🚀 Testing the Integration

1. **Start the Backend Server**:
   ```bash
   cd EntryManagementServer
   npm run dev
   ```

2. **Start MongoDB** (if not already running)

3. **Start React Native App**:
   ```bash
   cd EntryManagementApp
   npm start
   ```

4. **Test Authentication**:
   - Try registering a new user
   - Login with the registered user
   - Check if tokens are properly stored

5. **Test Entry Operations**:
   - Create new entries
   - View entries list
   - Export functionality

## 🐛 Troubleshooting

### Common Issues

1. **Network Request Failed**:
   - Check if the server is running
   - Verify the correct IP address/URL
   - Check firewall settings

2. **CORS Errors**:
   - Update `CORS_ORIGIN` in server's `.env`
   - Restart the server after changes

3. **Token Issues**:
   - Clear AsyncStorage: `AsyncStorage.clear()`
   - Check token format in network requests

4. **Database Connection**:
   - Ensure MongoDB is running
   - Check connection string in `.env`

### Debug Tips

1. Enable network debugging in React Native
2. Check server logs for API calls
3. Use Postman/Insomnia to test API endpoints
4. Monitor network requests in Chrome DevTools

## 📝 Next Steps

1. **Remove AsyncStorage Dependencies**: Gradually replace all AsyncStorage entry operations with API calls
2. **Add Offline Support**: Implement offline data caching if needed
3. **Error Boundaries**: Add comprehensive error handling
4. **Loading States**: Improve user experience with proper loading indicators
5. **Data Synchronization**: Handle data conflicts and synchronization

---

This integration will transform your React Native app from using local storage to a full-featured backend with authentication, data persistence, and export capabilities. 