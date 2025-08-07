<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReviewController extends Controller
{
    /**
     * Display a listing of submissions that need review.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Submission::with(['user', 'attachments', 'contentItems'])
                ->where('workflow_stage', 'review')
                ->orWhere('status', 'confirmed');
            
            // Apply filters
            if ($request->has('status')) {
                $query->where('review_status', $request->status);
            }
            
            if ($request->has('assigned_to')) {
                $query->where('assigned_to', $request->assigned_to);
            }
            
            // Only show items assigned to current user (if not admin)
            if (!auth()->user()->hasRole(['admin', 'superadmin'])) {
                $query->where('assigned_to', auth()->id());
            }
            
            $submissions = $query->orderBy('created_at', 'desc')->paginate(10);
            
            return response()->json([
                'success' => true,
                'data' => $submissions
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch reviews',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified submission for review.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $submission = Submission::with(['user', 'attachments', 'contentItems', 'reviews'])
                ->where('id', $id)
                ->where(function($query) {
                    $query->where('workflow_stage', 'review')
                          ->orWhere('status', 'confirmed');
                })
                ->firstOrFail();
            
            return response()->json([
                'success' => true,
                'data' => $submission
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Review not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Submit a review (approve/reject).
     */
    public function submitReview(Request $request, string $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'status' => 'required|string|in:approved,rejected',
                'notes' => 'nullable|string',
                'reviewerId' => 'required|string'
            ]);
            
            $submission = Submission::findOrFail($id);
            
            // Check if user can review this submission
            if ($submission->assigned_to !== auth()->id() && !auth()->user()->hasRole(['admin', 'superadmin', 'reviewer'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to review this submission'
                ], 403);
            }
            
            // Create review record
            $review = Review::create([
                'submission_id' => $submission->id,
                'reviewer_id' => $validated['reviewerId'],
                'status' => $validated['status'],
                'notes' => $validated['notes'],
                'reviewed_at' => now()
            ]);
            
            // Update submission status
            $submission->update([
                'review_status' => $validated['status'],
                'review_notes' => $validated['notes'],
                'reviewed_by' => $validated['reviewerId'],
                'reviewed_at' => now(),
                'workflow_stage' => $validated['status'] === 'approved' ? 'validation' : 'completed'
            ]);
            
            $submission->load(['user', 'attachments', 'contentItems', 'reviews']);
            
            return response()->json([
                'success' => true,
                'data' => $submission,
                'message' => 'Review submitted successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Assign a reviewer to a submission.
     */
    public function assignReview(Request $request, string $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'assigneeId' => 'required|string|exists:users,id'
            ]);
            
            $submission = Submission::findOrFail($id);
            
            // Check if user can assign reviews (admin/superadmin only)
            if (!auth()->user()->hasRole(['admin', 'superadmin'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to assign reviews'
                ], 403);
            }
            
            $submission->update([
                'assigned_to' => $validated['assigneeId'],
                'assigned_at' => now(),
                'workflow_stage' => 'review'
            ]);
            
            $submission->load(['user', 'attachments', 'contentItems']);
            
            return response()->json([
                'success' => true,
                'data' => $submission,
                'message' => 'Review assigned successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign review',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
