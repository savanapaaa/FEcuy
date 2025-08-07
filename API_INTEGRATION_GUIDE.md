# 🚀 Frontend-Backend API Integration Guide

## Overview
This guide helps you integrate the Next.js frontend with the Laravel backend API successfully.

## 🔧 Configuration

### Environment Variables
The project is configured with the following environment variables in `.env.local`:

```bash
# Backend API Configuration
NEXT_PUBLIC_API_URL=https://be-savana.budiutamamandiri.com/api

# File Upload Configuration  
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png,gif,mp4,mp3

# Pagination Configuration
NEXT_PUBLIC_DEFAULT_PAGE_SIZE=10
NEXT_PUBLIC_MAX_PAGE_SIZE=100
```

### Next.js Configuration
The `next.config.mjs` has been updated with:
- CORS headers for API calls
- API rewrites for proper routing
- Error handling configuration

## 📊 API Testing

### 1. Quick Health Check
```bash
npm run test:api
```

### 2. Interactive Testing
Visit `/debug` page in your app and use the **API Integration Test** tab for:
- Connection testing
- Endpoint accessibility checks  
- Response format validation
- Real-time logging

### 3. Manual Testing
Use the API Test Panel to:
- ✅ Test API connectivity
- ✅ Verify authentication endpoints
- ✅ Check all CRUD operations
- ✅ Validate response formats

## 🔗 API Endpoints Status

### Authentication ✅
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Current user info
- `POST /api/auth/logout` - User logout

### Submissions Management ✅
- `GET /api/submissions` - List with filters
- `POST /api/submissions` - Create new
- `GET /api/submissions/{id}` - Get details
- `PUT /api/submissions/{id}` - Update
- `DELETE /api/submissions/{id}` - Delete

### Reviews Management ✅
- `GET /api/reviews` - List for review
- `GET /api/reviews/{id}` - Get for review
- `POST /api/reviews/{id}` - Submit decision
- `POST /api/reviews/{id}/assign` - Assign reviewer

### Validations Management ✅
- `GET /api/validations` - List for validation
- `GET /api/validations/{id}` - Get for validation
- `POST /api/validations/{id}` - Submit validation
- `POST /api/validations/{id}/assign` - Assign validator

### User Management ✅
- `GET /api/users` - List users (Admin)
- `POST /api/users` - Create user (Admin)
- `GET /api/users/{id}` - Get user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### File Management ✅
- `POST /api/attachments/upload` - Upload file
- `GET /api/attachments/{id}` - Get file info
- `GET /api/attachments/{id}/download` - Download
- `DELETE /api/attachments/{id}` - Delete file

## 🔐 Authentication Flow

### 1. Login Process
```typescript
const response = await login({ username, password })
if (response.success) {
  // Token automatically stored in localStorage
  // User data available in response.data
}
```

### 2. Protected Requests
All API requests automatically include the Bearer token when available.

### 3. Logout Process
```typescript
await logout()
// Token automatically removed from localStorage
```

## 📝 Error Handling

The API client includes comprehensive error handling:
- Network errors
- HTTP status errors
- Laravel validation errors
- Authentication errors
- CORS errors

All errors are logged with detailed information for debugging.

## 🔄 Response Format

All API responses follow this consistent format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": { ... }
}
```

## 🚨 Troubleshooting

### Common Issues & Solutions

#### 1. CORS Errors
- ✅ Ensure backend has proper CORS configuration
- ✅ Check Next.js headers configuration
- ✅ Verify API URL is correct

#### 2. Authentication Issues
- ✅ Check token storage in localStorage
- ✅ Verify Bearer token format
- ✅ Ensure /auth/me endpoint works

#### 3. File Upload Issues
- ✅ Check file size limits
- ✅ Verify allowed file types
- ✅ Ensure multipart/form-data headers

#### 4. Network Issues
- ✅ Test backend API directly
- ✅ Check firewall/proxy settings
- ✅ Verify SSL certificates

### Debug Tools

1. **Browser Developer Tools**
   - Network tab for API requests
   - Console for error logs
   - Application tab for localStorage

2. **API Test Panel** (`/debug`)
   - Interactive endpoint testing
   - Real-time request/response logging
   - Configuration verification

3. **Terminal Testing**
   ```bash
   npm run test:api
   ```

## 🎯 Deployment Checklist

### Production Deployment
- [ ] Update `NEXT_PUBLIC_API_URL` to production backend
- [ ] Test all endpoints in production
- [ ] Verify HTTPS is working
- [ ] Check CORS configuration
- [ ] Test file upload/download
- [ ] Verify authentication flow
- [ ] Monitor error logs

### Development Setup
- [ ] Clone repository
- [ ] Install dependencies: `npm install`
- [ ] Copy `.env.local` configuration
- [ ] Start development server: `npm run dev`
- [ ] Test API integration: Visit `/debug`
- [ ] Run API tests: `npm run test:api`

## 📞 Support

If you encounter issues:
1. Check the `/debug` page for API testing
2. Review browser console for errors
3. Test individual endpoints with the API Test Panel
4. Verify environment configuration
5. Check backend API documentation

---

**Status: ✅ READY FOR PRODUCTION**

All frontend-backend integration is complete and tested!
