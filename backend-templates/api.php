<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PengajuanController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SubmissionController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ValidationController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AttachmentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Authentication routes
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

// Protected API routes
Route::middleware('auth:sanctum')->group(function () {
    
    // Submissions Management
    Route::apiResource('submissions', SubmissionController::class);
    
    // Reviews Management  
    Route::prefix('reviews')->group(function () {
        Route::get('/', [ReviewController::class, 'index']);
        Route::get('{id}', [ReviewController::class, 'show']);
        Route::post('{id}', [ReviewController::class, 'submitReview']);
        Route::post('{id}/assign', [ReviewController::class, 'assignReview']);
    });
    
    // Validations Management
    Route::prefix('validations')->group(function () {
        Route::get('/', [ValidationController::class, 'index']);
        Route::get('{id}', [ValidationController::class, 'show']);
        Route::post('{id}', [ValidationController::class, 'submitValidation']);
        Route::post('{id}/assign', [ValidationController::class, 'assignValidation']);
    });
    
    // User Management
    Route::apiResource('users', UserController::class);
    
    // File/Attachment handling
    Route::prefix('attachments')->group(function () {
        Route::post('upload', [AttachmentController::class, 'upload']);
        Route::get('{id}', [AttachmentController::class, 'show']);
        Route::get('{id}/download', [AttachmentController::class, 'download']);
        Route::delete('{id}', [AttachmentController::class, 'delete']);
    });
    
    // Legacy pengajuan routes (jika masih diperlukan)
    Route::apiResource('pengajuan', PengajuanController::class);
});

// Public routes (jika diperlukan)
Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'API is running',
        'timestamp' => now()
    ]);
});
