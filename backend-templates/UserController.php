<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Check if user has permission to view users
            if (!auth()->user()->hasRole(['admin', 'superadmin'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to view users'
                ], 403);
            }
            
            $query = User::query();
            
            // Apply filters
            if ($request->has('role')) {
                $query->where('role', $request->role);
            }
            
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('username', 'like', "%{$search}%");
                });
            }
            
            $users = $query->orderBy('created_at', 'desc')->paginate(10);
            
            return response()->json([
                'success' => true,
                'data' => $users
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch users',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Check if user has permission to create users
            if (!auth()->user()->hasRole(['admin', 'superadmin'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to create users'
                ], 403);
            }
            
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'username' => 'required|string|max:255|unique:users,username',
                'password' => 'required|string|min:8',
                'role' => 'required|string|in:admin,user,reviewer,validator,superadmin,form,review,validasi,rekap'
            ]);
            
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'username' => $validated['username'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
                'email_verified_at' => now()
            ]);
            
            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'User created successfully'
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified user.
     */
    public function show(string $id): JsonResponse
    {
        try {
            // Check if user has permission or is viewing own profile
            if (!auth()->user()->hasRole(['admin', 'superadmin']) && auth()->id() !== (int)$id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to view this user'
                ], 403);
            }
            
            $user = User::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $user
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);
            
            // Check if user has permission or is updating own profile
            if (!auth()->user()->hasRole(['admin', 'superadmin']) && auth()->id() !== (int)$id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to update this user'
                ], 403);
            }
            
            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'email' => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
                'username' => ['sometimes', 'string', 'max:255', Rule::unique('users')->ignore($user->id)],
                'password' => 'sometimes|string|min:8',
                'role' => 'sometimes|string|in:admin,user,reviewer,validator,superadmin,form,review,validasi,rekap'
            ]);
            
            // Only admin/superadmin can change roles
            if (isset($validated['role']) && !auth()->user()->hasRole(['admin', 'superadmin'])) {
                unset($validated['role']);
            }
            
            // Hash password if provided
            if (isset($validated['password'])) {
                $validated['password'] = Hash::make($validated['password']);
            }
            
            $user->update($validated);
            
            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'User updated successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified user.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            // Check if user has permission to delete users
            if (!auth()->user()->hasRole(['admin', 'superadmin'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to delete users'
                ], 403);
            }
            
            $user = User::findOrFail($id);
            
            // Prevent self-deletion
            if (auth()->id() === (int)$id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete your own account'
                ], 422);
            }
            
            $user->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete user',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
