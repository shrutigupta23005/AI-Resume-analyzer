# API Documentation — ResumeAI Pro

Base URL: `http://localhost:5000/api`

All protected routes require: `Authorization: Bearer <jwt_token>`

---

## Auth Routes

### POST /auth/register
Create a new user account.

**Body:**
```json
{ "name": "John Doe", "email": "john@example.com", "password": "password123" }
```
**Response (201):**
```json
{ "success": true, "data": { "user": { "id": "...", "name": "John Doe", "email": "john@example.com" }, "token": "jwt_token" } }
```

### POST /auth/login
Login with existing credentials.

**Body:**
```json
{ "email": "john@example.com", "password": "password123" }
```

### GET /auth/me *(Protected)*
Get current authenticated user profile.

---

## Resume Routes *(All Protected)*

### POST /resumes/upload
Upload a PDF resume file. Uses multipart/form-data.

**Form field:** `resume` (PDF file, max 10MB)

**Response (201):**
```json
{ "success": true, "data": { "resume": { "id": "...", "originalName": "resume.pdf", "wordCount": 450, "pages": 1, "status": "parsed" } } }
```

### GET /resumes
List all resumes for the current user.

### GET /resumes/:id
Get a single resume with extracted text and sections.

### DELETE /resumes/:id
Delete a resume and its file from server.

---

## Analysis Routes *(All Protected)*

### POST /analysis/:resumeId
Run ATS analysis on a resume. Returns scores across 10 categories.

**Response (201):**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "overallScore": 72,
      "categoryScores": [
        { "name": "Formatting", "score": 85, "weight": 15, "feedback": "..." },
        ...
      ],
      "strengths": ["..."],
      "weaknesses": ["..."],
      "recommendations": ["..."]
    }
  }
}
```

### POST /analysis/:resumeId/match
Match resume against a job description.

**Body:**
```json
{ "jobDescription": "Full job description text here (min 50 chars)..." }
```

### GET /analysis/dashboard/stats
Get dashboard statistics (totals, averages, recent scores).

### GET /analysis
List all analyses for the current user.

### GET /analysis/matches
List all job matches for the current user.

---

## AI Routes *(All Protected, Rate Limited)*

### POST /ai/:resumeId/improve
Get AI-powered resume improvements.

**Response:**
```json
{
  "success": true,
  "data": {
    "improvements": {
      "summaryRewrite": "...",
      "bulletImprovements": [{ "original": "...", "improved": "..." }],
      "grammarFixes": [{ "issue": "...", "fix": "..." }],
      "actionVerbSuggestions": ["Spearheaded", "Orchestrated", ...],
      "missingSkills": ["Docker", "AWS", ...],
      "overallTips": ["...", "...", "..."]
    }
  }
}
```

### POST /ai/:resumeId/summary
Generate an AI-powered professional summary.

### POST /ai/rewrite-bullets
Rewrite specific bullet points.

**Body:**
```json
{ "bullets": ["Worked on projects", "Did coding stuff"] }
```

---

## Error Responses

All errors follow this format:
```json
{ "success": false, "message": "Error description" }
```

Common status codes: 400 (validation), 401 (unauthorized), 404 (not found), 429 (rate limited), 500 (server error)

---

## Rate Limits

| Route Type | Limit |
|-----------|-------|
| General API | 100 requests / 15 min |
| Auth routes | 10 requests / 15 min |
| AI routes | 15 requests / 15 min |
