# API Documentation - Reviews Module

## Base URL
- **Development**: `http://localhost:3001/api`
- **Production**: `https://be-savana.budiutamamandiri.com/api`

## Reviews Endpoints

### 1. Get All Reviews
```
GET /api/reviews
```

**Description**: Fetch all reviews/submissions that are ready for review process.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "no_comtab": "20250818001/IKP/08/2025",
      "title": "Kampanye Digital Marketing Diskominfo",
      "tema": "Digital Marketing",
      "media_type": "Digital",
      "media_pemerintah": ["Website", "Instagram", "Facebook"],
      "media_massa": ["Kompas", "Detik"],
      "jenis_konten": ["video", "infografis", "artikel"],
      "tanggal_order": "2025-08-15",
      "petugas_pelaksana": "Ahmad Rizki",
      "supervisor": "Budi Santoso",
      "jumlah_produksi": "5 konten",
      "tanggal_submit": "2025-08-18",
      "workflow_stage": "review",
      "review_status": "pending",
      "content_items": [...],
      "dokumen_pendukung": [],
      "created_at": "2025-08-15T10:30:00Z",
      "updated_at": "2025-08-18T14:20:00Z"
    }
  ],
  "message": "Reviews fetched successfully",
  "total": 2
}
```

### 2. Get Single Review
```
GET /api/reviews/[id]
```

**Description**: Fetch a specific review by ID.

**Parameters**:
- `id` (string): Review ID

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "no_comtab": "20250818001/IKP/08/2025",
    "title": "Kampanye Digital Marketing Diskominfo",
    // ... same structure as above
  },
  "message": "Review fetched successfully"
}
```

### 3. Update Review Status
```
PUT /api/reviews/[id]
```

**Description**: Update review status and add review notes.

**Parameters**:
- `id` (string): Review ID

**Request Body**:
```json
{
  "status": "approved" | "rejected",
  "notes": "Review notes/comments",
  "reviewerId": "reviewer_id",
  "reviewerName": "Reviewer Name"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "approved",
    "notes": "Content approved with minor suggestions",
    "reviewerId": "reviewer_123",
    "reviewerName": "John Doe"
  },
  "message": "Review updated successfully"
}
```

### 4. Assign Reviewer
```
POST /api/reviews/[id]/assign
```

**Description**: Assign a reviewer to a specific review.

**Parameters**:
- `id` (string): Review ID

**Request Body**:
```json
{
  "reviewerId": "reviewer_123",
  "reviewerName": "John Doe"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "reviewer_id": "reviewer_123",
    "reviewer_name": "John Doe",
    "assigned_at": "2025-08-18T10:30:00Z",
    "status": "assigned"
  },
  "message": "Review 1 assigned to John Doe successfully"
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

**Common HTTP Status Codes**:
- `200`: Success
- `400`: Bad Request (missing required fields)
- `404`: Not Found
- `500`: Internal Server Error

## Integration Status

✅ **API Endpoints**: Created and ready  
✅ **Frontend Integration**: Connected via api-client.ts  
✅ **Review Page**: Uses getReviews() function  
🔄 **Database**: Currently using mock data (ready for database integration)  

## Next Steps for Database Integration

1. **Replace Mock Data**: Update route handlers to use actual database queries
2. **Add Database Models**: Create proper models for reviews, content_items, etc.
3. **Add Validation**: Implement proper input validation and sanitization
4. **Add Authentication**: Secure endpoints with proper auth middleware
5. **Add Pagination**: Implement pagination for large datasets

## Testing

You can test the endpoints using:
- Browser: Visit `http://localhost:3001/admin/review`
- API Tool: Make direct requests to `http://localhost:3001/api/reviews`
- Console: Check browser console for API call logs
