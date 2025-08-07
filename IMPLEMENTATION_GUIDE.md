# Laravel Backend Implementation Guide

## Files Created:
1. **Controllers:**
   - `SubmissionController.php` - Mengelola submissions/pengajuan
   - `ReviewController.php` - Mengelola proses review
   - `ValidationController.php` - Mengelola proses validasi
   - `UserController.php` - Mengelola user management
   - `AttachmentController.php` - Mengelola file upload/download

2. **Routes:**
   - `api.php` - Route API lengkap untuk semua endpoint

3. **Middleware:**
   - `CheckRole.php` - Middleware untuk checking role user

4. **Traits:**
   - `HasRoles.php` - Trait untuk User model dengan role functions

## Langkah Implementasi:

### 1. Copy Controllers ke Laravel Project
```bash
cp backend-templates/SubmissionController.php app/Http/Controllers/Api/
cp backend-templates/ReviewController.php app/Http/Controllers/Api/
cp backend-templates/ValidationController.php app/Http/Controllers/Api/
cp backend-templates/UserController.php app/Http/Controllers/Api/
cp backend-templates/AttachmentController.php app/Http/Controllers/Api/
```

### 2. Copy Routes
```bash
cp backend-templates/api.php routes/
```

### 3. Create Middleware
```bash
php artisan make:middleware CheckRole
# Then copy content from backend-templates/CheckRole.php
```

### 4. Create Traits Directory & File
```bash
mkdir -p app/Traits
cp backend-templates/HasRoles.php app/Traits/
```

### 5. Update User Model
Add to your User model:
```php
use App\Traits\HasRoles;

class User extends Authenticatable
{
    use HasRoles; // Add this trait
    
    // ... rest of your User model
}
```

### 6. Register Middleware (if needed)
In `app/Http/Kernel.php`:
```php
protected $routeMiddleware = [
    // ... existing middleware
    'role' => \App\Http\Middleware\CheckRole::class,
];
```

### 7. Configure File Storage
In `config/filesystems.php`, make sure you have 'private' disk:
```php
'private' => [
    'driver' => 'local',
    'root' => storage_path('app/private'),
],
```

### 8. Run Migrations
Make sure all your models have proper migrations:
```bash
php artisan migrate
```

### 9. Test API Endpoints
Use Postman or similar to test all endpoints:
- Authentication: `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`
- Submissions: `/api/submissions` (CRUD)
- Reviews: `/api/reviews` (index, show, submit, assign)
- Validations: `/api/validations` (index, show, submit, assign)
- Users: `/api/users` (CRUD)
- Attachments: `/api/attachments` (upload, download, delete)

## Features Implemented:

✅ **Complete CRUD for all entities**
✅ **Role-based access control**
✅ **File upload/download system**
✅ **Workflow management (form → review → validation → completed)**
✅ **Assignment system for reviewers/validators**
✅ **Proper error handling**
✅ **Consistent API response format**
✅ **Authentication with Sanctum**
✅ **Permission checking**
✅ **Search and filtering**

## Response Format:
All APIs return consistent JSON format:
```json
{
    "success": true/false,
    "data": {...},
    "message": "Success message"
}
```

## Next Steps:
1. Implement seeder untuk test data
2. Add API documentation (Swagger/OpenAPI)
3. Add unit tests
4. Setup logging dan monitoring
5. Add rate limiting untuk security
