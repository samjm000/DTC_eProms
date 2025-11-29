# EPROMS API Documentation

Base URL: `http://localhost:3001/api`

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "07XXX XXXXXX",
  "role": "patient"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "patient"
  }
}
```

### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "patient"
  }
}
```

### GET /auth/nhs-sso
Redirect to NHS SSO login (for clinicians).

### POST /auth/nhs-sso/callback
NHS SSO callback endpoint.

### GET /auth/me
Get current user information.

**Authentication:** Required

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "patient",
    "lastLogin": "2024-01-15T10:30:00Z"
  }
}
```

### PUT /auth/profile
Update user profile.

**Authentication:** Required

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "07XXX XXXXXX"
}
```

### POST /auth/change-password
Change user password.

**Authentication:** Required

**Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword456"
}
```

## Patient Endpoints

### GET /patients
Get list of all patients (clinicians only).

**Authentication:** Required (Clinician/Admin)

**Query Parameters:**
- `search` (optional): Search by name, email, or NHS number
- `cancerType` (optional): Filter by cancer type
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)

**Response:**
```json
{
  "patients": [
    {
      "id": "uuid",
      "nhsNumber": "1234567890",
      "dateOfBirth": "1980-01-15",
      "gender": "Female",
      "cancerType": "Breast Cancer",
      "cancerStage": "II",
      "diagnosisDate": "2023-06-01",
      "user": {
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane@example.com"
      },
      "primaryClinician": {
        "firstName": "Dr. Sarah",
        "lastName": "Johnson"
      }
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

### GET /patients/dashboard
Get patient dashboard (patients only).

**Authentication:** Required (Patient)

**Response:**
```json
{
  "patient": {
    "id": "uuid",
    "cancerType": "Breast Cancer",
    "diagnosisDate": "2023-06-01",
    "primaryClinician": {
      "firstName": "Dr. Sarah",
      "lastName": "Johnson",
      "email": "sarah.johnson@nhs.net"
    },
    "treatmentPlans": [...]
  },
  "recentSideEffects": [...],
  "stats": {
    "urgentSideEffects": 2,
    "activeTreatments": 1
  }
}
```

### GET /patients/:id
Get patient details by ID.

**Authentication:** Required

**Response:**
```json
{
  "patient": {
    "id": "uuid",
    "nhsNumber": "1234567890",
    "dateOfBirth": "1980-01-15",
    "cancerType": "Breast Cancer",
    "user": {...},
    "primaryClinician": {...},
    "treatmentPlans": [...],
    "sideEffects": [...]
  }
}
```

### POST /patients
Create a new patient profile (clinicians only).

**Authentication:** Required (Clinician/Admin)

**Request Body:**
```json
{
  "userId": "user_uuid",
  "nhsNumber": "1234567890",
  "dateOfBirth": "1980-01-15",
  "gender": "Female",
  "cancerType": "Breast Cancer",
  "cancerStage": "II",
  "diagnosisDate": "2023-06-01",
  "hospitalNumber": "H123456",
  "emergencyContactName": "John Smith",
  "emergencyContactPhone": "07XXX XXXXXX",
  "contactPreference": "email"
}
```

### PUT /patients/:id
Update patient information (clinicians only).

**Authentication:** Required (Clinician/Admin)

**Request Body:**
```json
{
  "cancerStage": "III",
  "contactPreference": "both",
  "emergencyContactName": "Jane Smith",
  "emergencyContactPhone": "07XXX XXXXXX"
}
```

## Side Effect Endpoints

### GET /side-effects/ctcae-events
Get list of CTCAE adverse events.

**Authentication:** Required

**Query Parameters:**
- `search` (optional): Search by event name
- `category` (optional): Filter by category ID

**Response:**
```json
{
  "events": [
    {
      "id": "uuid",
      "eventName": "Nausea",
      "patientFriendlyName": "Feeling sick",
      "patientFriendlyDescription": "Feeling like you might vomit",
      "grade1Description": "Loss of appetite without...",
      "grade2Description": "Oral intake decreased...",
      "grade3Description": "Inadequate oral caloric...",
      "grade4Description": "Life-threatening...",
      "grade5Description": "Death"
    }
  ]
}
```

### GET /side-effects/ctcae-events/:id
Get specific CTCAE event details.

**Authentication:** Required

### POST /side-effects/report
Report a new side effect (patients only).

**Authentication:** Required (Patient)

**Request Body:**
```json
{
  "ctcaeEventId": "event_uuid",
  "grade": 2,
  "onsetDate": "2024-01-10",
  "severityScore": 6,
  "impactOnDailyLife": "moderate",
  "patientNotes": "Feeling nauseous after morning medication",
  "treatmentCycleId": "cycle_uuid"
}
```

**Response:**
```json
{
  "message": "Side effect reported successfully",
  "sideEffect": {
    "id": "uuid",
    "grade": 2,
    "onsetDate": "2024-01-10",
    "clinicianReviewStatus": "pending",
    "requiresUrgentAttention": false,
    "adverseEvent": {...}
  }
}
```

### GET /side-effects
Get side effects for a patient.

**Authentication:** Required

**Query Parameters:**
- `patientId` (optional, clinicians only): Specific patient ID
- `status` (optional): Filter by review status
- `urgent` (optional): Filter urgent side effects (true/false)
- `startDate` (optional): Filter by onset date range
- `endDate` (optional): Filter by onset date range

**Response:**
```json
{
  "sideEffects": [
    {
      "id": "uuid",
      "grade": 2,
      "onsetDate": "2024-01-10",
      "isOngoing": true,
      "severityScore": 6,
      "impactOnDailyLife": "moderate",
      "patientNotes": "Feeling nauseous...",
      "clinicianReviewStatus": "pending",
      "requiresUrgentAttention": false,
      "adverseEvent": {
        "eventName": "Nausea",
        "patientFriendlyName": "Feeling sick"
      },
      "reviewer": null,
      "reviewedAt": null
    }
  ]
}
```

### GET /side-effects/urgent
Get urgent side effects requiring attention (clinicians only).

**Authentication:** Required (Clinician/Admin)

**Response:**
```json
{
  "sideEffects": [
    {
      "id": "uuid",
      "grade": 3,
      "requiresUrgentAttention": true,
      "clinicianReviewStatus": "pending",
      "patient": {
        "nhsNumber": "1234567890",
        "user": {
          "firstName": "Jane",
          "lastName": "Smith",
          "email": "jane@example.com"
        }
      },
      "adverseEvent": {
        "eventName": "Dyspnea",
        "patientFriendlyName": "Shortness of breath"
      }
    }
  ]
}
```

### PUT /side-effects/:id
Update side effect information.

**Authentication:** Required

**Request Body (Patient):**
```json
{
  "resolutionDate": "2024-01-15",
  "isOngoing": false,
  "severityScore": 3,
  "patientNotes": "Feeling better now"
}
```

**Request Body (Clinician):**
```json
{
  "clinicianReviewStatus": "reviewed",
  "clinicianNotes": "Prescribed anti-emetic medication",
  "requiresUrgentAttention": false
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request data",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden: Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

The API implements rate limiting:
- Window: 15 minutes
- Max requests: 100 per window per IP

Exceeding the limit returns:
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

## CTCAE Grading System

Side effects are graded 1-5 according to CTCAE guidelines:

- **Grade 1**: Mild; asymptomatic or mild symptoms
- **Grade 2**: Moderate; minimal, local or noninvasive intervention indicated
- **Grade 3**: Severe or medically significant but not immediately life-threatening
- **Grade 4**: Life-threatening consequences; urgent intervention indicated
- **Grade 5**: Death related to adverse event

Grade 3+ side effects are automatically flagged as requiring urgent attention.
