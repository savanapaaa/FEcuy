<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SubmissionController extends Controller
{
    /**
     * Display a listing of submissions.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Submission::with(['user', 'attachments', 'contentItems']);
            
            // Apply filters
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            if ($request->has('workflow_stage')) {
                $query->where('workflow_stage', $request->workflow_stage);
            }
            
            if ($request->has('user_id')) {
                $query->where('user_id', $request->user_id);
            }
            
            // Search functionality
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }
            
            $submissions = $query->orderBy('created_at', 'desc')->paginate(10);
            
            return response()->json([
                'success' => true,
                'data' => $submissions
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch submissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created submission.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'content_items' => 'nullable|array',
                'attachments' => 'nullable|array',
                'status' => 'nullable|string|in:draft,submitted,confirmed',
                'workflow_stage' => 'nullable|string|in:form,review,validation,completed'
            ]);
            
            $submission = Submission::create([
                ...$validated,
                'user_id' => auth()->id(),
                'status' => $validated['status'] ?? 'draft',
                'workflow_stage' => $validated['workflow_stage'] ?? 'form'
            ]);
            
            // Handle content items if provided
            if (isset($validated['content_items'])) {
                foreach ($validated['content_items'] as $item) {
                    $submission->contentItems()->create($item);
                }
            }
            
            // Handle attachments if provided
            if (isset($validated['attachments'])) {
                foreach ($validated['attachments'] as $attachment) {
                    $submission->attachments()->create($attachment);
                }
            }
            
            $submission->load(['user', 'attachments', 'contentItems']);
            
            return response()->json([
                'success' => true,
                'data' => $submission,
                'message' => 'Submission created successfully'
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create submission',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified submission.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $submission = Submission::with(['user', 'attachments', 'contentItems', 'reviews', 'validations'])
                ->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $submission
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Submission not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified submission.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $submission = Submission::findOrFail($id);
            
            // Check if user can edit this submission
            if ($submission->user_id !== auth()->id() && !auth()->user()->hasRole(['admin', 'superadmin'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to edit this submission'
                ], 403);
            }
            
            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'content_items' => 'nullable|array',
                'attachments' => 'nullable|array',
                'status' => 'nullable|string|in:draft,submitted,confirmed',
                'workflow_stage' => 'nullable|string|in:form,review,validation,completed'
            ]);
            
            $submission->update($validated);
            
            // Update content items if provided
            if (isset($validated['content_items'])) {
                $submission->contentItems()->delete();
                foreach ($validated['content_items'] as $item) {
                    $submission->contentItems()->create($item);
                }
            }
            
            $submission->load(['user', 'attachments', 'contentItems']);
            
            return response()->json([
                'success' => true,
                'data' => $submission,
                'message' => 'Submission updated successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update submission',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified submission.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $submission = Submission::findOrFail($id);
            
            // Check if user can delete this submission
            if ($submission->user_id !== auth()->id() && !auth()->user()->hasRole(['admin', 'superadmin'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to delete this submission'
                ], 403);
            }
            
            // Delete related records
            $submission->contentItems()->delete();
            $submission->attachments()->delete();
            $submission->reviews()->delete();
            $submission->validations()->delete();
            
            $submission->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Submission deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete submission',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
