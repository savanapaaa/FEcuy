# Environment Variables Guide

## API Configuration Environment Variables

This project uses environment variables to manage API configurations. All API-related settings are stored in `.env.local` file.

### Core API Settings

```bash
# Main API URL (change this to switch between environments)
NEXT_PUBLIC_API_URL=https://be-savana.budiutamamandiri.com/api

# For local development, uncomment one of these:
# NEXT_PUBLIC_API_URL=http://localhost:8000/api
# NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

### Available Environment Variables

#### API Configuration
- `NEXT_PUBLIC_API_URL`: Base URL for the backend API
- `NEXT_PUBLIC_API_TIMEOUT`: Request timeout in milliseconds (default: 30000)
- `NEXT_PUBLIC_API_RETRY_ATTEMPTS`: Number of retry attempts for failed requests (default: 3)

#### Authentication
- `NEXT_PUBLIC_AUTH_TOKEN_KEY`: localStorage key for auth token (default: "auth_token")
- `NEXT_PUBLIC_USER_STORAGE_KEY`: localStorage key for user data (default: "user")

#### Debug Settings
- `NEXT_PUBLIC_DEBUG_API`: Enable API request/response logging (default: false)
- `NEXT_PUBLIC_DEBUG_AUTH`: Enable authentication logging (default: false)

#### API Endpoints (Advanced)
- `NEXT_PUBLIC_AUTH_LOGIN_ENDPOINT`: Login endpoint path (default: "/auth/login")
- `NEXT_PUBLIC_AUTH_LOGOUT_ENDPOINT`: Logout endpoint path (default: "/auth/logout")
- `NEXT_PUBLIC_AUTH_ME_ENDPOINT`: Current user endpoint path (default: "/auth/me")
- `NEXT_PUBLIC_SUBMISSIONS_ENDPOINT`: Submissions endpoint path (default: "/submissions")
- `NEXT_PUBLIC_REVIEWS_ENDPOINT`: Reviews endpoint path (default: "/reviews")
- `NEXT_PUBLIC_VALIDATIONS_ENDPOINT`: Validations endpoint path (default: "/validations")
- `NEXT_PUBLIC_USERS_ENDPOINT`: Users endpoint path (default: "/users")

### Environment Setup Examples

#### Production Environment
```bash
NEXT_PUBLIC_API_URL=https://be-savana.budiutamamandiri.com/api
NEXT_PUBLIC_DEBUG_API=false
NEXT_PUBLIC_DEBUG_AUTH=false
```

#### Development Environment
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_DEBUG_API=true
NEXT_PUBLIC_DEBUG_AUTH=true
```

#### Testing Environment
```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_DEBUG_API=true
```

### Quick Environment Switching

To switch between different API environments, simply update the `NEXT_PUBLIC_API_URL` variable:

1. **Production API**: `https://be-savana.budiutamamandiri.com/api`
2. **Local Development**: `http://localhost:8000/api` or `http://127.0.0.1:8000/api`
3. **Network Development**: `http://192.168.1.100:8000/api` (replace with your local IP)

### Debug Mode

Enable debug mode to see detailed API logs:

```bash
NEXT_PUBLIC_DEBUG_API=true
NEXT_PUBLIC_DEBUG_AUTH=true
```

When debug mode is enabled, you'll see:
- 🚀 API requests with method and URL
- 📤 Request configuration details
- ✅ Successful responses
- ❌ Error details
- 🔐 Authentication events
- 👤 User management events

### Notes

1. All environment variables with `NEXT_PUBLIC_` prefix are exposed to the browser
2. Changes to `.env.local` require restarting the development server
3. Never commit sensitive production API keys to version control
4. The API client automatically falls back to localhost if no URL is provided

### Troubleshooting

- **API not connecting**: Check if `NEXT_PUBLIC_API_URL` is correct
- **CORS errors**: Ensure the backend allows your frontend domain
- **Timeout errors**: Increase `NEXT_PUBLIC_API_TIMEOUT` value
- **Debug not working**: Make sure debug variables are set to "true" (string, not boolean)
