<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Validation;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ValidationController extends Controller
{
    /**
     * Display a listing of submissions that need validation.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Submission::with(['user', 'attachments', 'contentItems'])
                ->where('workflow_stage', 'validation')
                ->where('review_status', 'approved');
            
            // Apply filters
            if ($request->has('status')) {
                $query->where('validation_status', $request->status);
            }
            
            if ($request->has('assigned_to')) {
                $query->where('validation_assigned_to', $request->assigned_to);
            }
            
            // Only show items assigned to current user (if not admin)
            if (!auth()->user()->hasRole(['admin', 'superadmin'])) {
                $query->where('validation_assigned_to', auth()->id());
            }
            
            $submissions = $query->orderBy('created_at', 'desc')->paginate(10);
            
            return response()->json([
                'success' => true,
                'data' => $submissions
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch validations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified submission for validation.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $submission = Submission::with(['user', 'attachments', 'contentItems', 'reviews', 'validations'])
                ->where('id', $id)
                ->where('workflow_stage', 'validation')
                ->where('review_status', 'approved')
                ->firstOrFail();
            
            return response()->json([
                'success' => true,
                'data' => $submission
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Submit a validation (validate/publish/reject).
     */
    public function submitValidation(Request $request, string $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'status' => 'required|string|in:validated,published,rejected',
                'notes' => 'nullable|string',
                'validatorId' => 'required|string',
                'publishDate' => 'nullable|date',
                'publishedContent' => 'nullable|array'
            ]);
            
            $submission = Submission::findOrFail($id);
            
            // Check if user can validate this submission
            if ($submission->validation_assigned_to !== auth()->id() && !auth()->user()->hasRole(['admin', 'superadmin', 'validator'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to validate this submission'
                ], 403);
            }
            
            // Create validation record
            $validation = Validation::create([
                'submission_id' => $submission->id,
                'validator_id' => $validated['validatorId'],
                'status' => $validated['status'],
                'notes' => $validated['notes'],
                'publish_date' => $validated['publishDate'] ?? null,
                'published_content' => $validated['publishedContent'] ?? null,
                'validated_at' => now()
            ]);
            
            // Update submission status
            $submission->update([
                'validation_status' => $validated['status'],
                'validation_notes' => $validated['notes'],
                'validated_by' => $validated['validatorId'],
                'validated_at' => now(),
                'publish_date' => $validated['publishDate'] ?? null,
                'published_content' => $validated['publishedContent'] ?? null,
                'workflow_stage' => $validated['status'] === 'published' ? 'completed' : 'validation'
            ]);
            
            $submission->load(['user', 'attachments', 'contentItems', 'reviews', 'validations']);
            
            return response()->json([
                'success' => true,
                'data' => $submission,
                'message' => 'Validation submitted successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit validation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Assign a validator to a submission.
     */
    public function assignValidation(Request $request, string $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'assigneeId' => 'required|string|exists:users,id'
            ]);
            
            $submission = Submission::findOrFail($id);
            
            // Check if user can assign validations (admin/superadmin only)
            if (!auth()->user()->hasRole(['admin', 'superadmin'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to assign validations'
                ], 403);
            }
            
            $submission->update([
                'validation_assigned_to' => $validated['assigneeId'],
                'validation_assigned_at' => now()
            ]);
            
            $submission->load(['user', 'attachments', 'contentItems']);
            
            return response()->json([
                'success' => true,
                'data' => $submission,
                'message' => 'Validation assigned successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign validation',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
