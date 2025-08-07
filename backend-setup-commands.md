# Backend Setup Commands for Laravel

## 1. Create Controllers
```bash
# Navigate to your Laravel backend project first
cd /path/to/your/laravel/backend

# Create all required controllers
php artisan make:controller Api/SubmissionController --api
php artisan make:controller Api/ReviewController
php artisan make:controller Api/ValidationController  
php artisan make:controller Api/UserController --api
php artisan make:controller Api/AttachmentController
```

## 2. Create Middleware (if needed)
```bash
php artisan make:middleware CheckRole
php artisan make:middleware CheckPermission
```

## 3. Create Requests for Validation
```bash
php artisan make:request StoreSubmissionRequest
php artisan make:request UpdateSubmissionRequest
php artisan make:request StoreUserRequest
php artisan make:request UpdateUserRequest
php artisan make:request SubmitReviewRequest
php artisan make:request SubmitValidationRequest
```

## 4. Create Resources (for API responses)
```bash
php artisan make:resource SubmissionResource
php artisan make:resource UserResource
php artisan make:resource ReviewResource
php artisan make:resource ValidationResource
```

Run these commands in your Laravel backend project directory!
