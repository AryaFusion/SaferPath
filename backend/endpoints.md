# SaferPath Backend Endpoints

### GET /
- **Summary**: Root
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: 
- **Response Body**: Response Root  Get

### GET /v1/health
- **Summary**: Health
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: 
- **Response Body**: Response Health V1 Health Get

### GET /v1/readiness
- **Summary**: Readiness
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: 
- **Response Body**: Response Readiness V1 Readiness Get

### GET /v1/help-points/nearby
- **Summary**: Nearby Help Points
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**:
  - latitude (required: True)
  - longitude (required: True)
  - radius_meters (required: True)
  - category (required: False)
  - accessibility (required: False)
  - verified_only (required: False)
- **Request Body**: 
- **Response Body**: No Body

### POST /v1/echo
- **Summary**: Echo
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: Inline Schema
- **Response Body**: Response Echo V1 Echo Post

### GET /v1/routes/{route_id}/context
- **Summary**: Route Context
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: 
- **Response Body**: Inline Schema

### POST /v1/routes/compare
- **Summary**: Create Route Request
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: Inline Schema
- **Response Body**: No Body

### POST /v1/reports
- **Summary**: Create Report
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: Inline Schema
- **Response Body**: No Body

### GET /v1/reports/{report_id}
- **Summary**: Get Report
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**:
  - session_id (required: False)
- **Request Body**: 
- **Response Body**: Inline Schema

### POST /v1/reports/{report_id}/evidence/upload-authorizations
- **Summary**: Authorize Evidence
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: Inline Schema
- **Response Body**: No Body

### POST /v1/reports/{report_id}/evidence/{evidence_id}/complete
- **Summary**: Complete Evidence
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: Inline Schema
- **Response Body**: No Body

### GET /v1/reports/{report_id}/evidence
- **Summary**: List Evidence
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**:
  - session_id (required: True)
- **Request Body**: 
- **Response Body**: No Body

### DELETE /v1/reports/{report_id}/evidence/{evidence_id}
- **Summary**: Delete Evidence
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**:
  - session_id (required: True)
- **Request Body**: 
- **Response Body**: No Body

### POST /v1/emergency/handoff/{handoff_id}/action
- **Summary**: Emergency Handoff Action
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: Inline Schema
- **Response Body**: Inline Schema

### POST /v1/emergency/handoff
- **Summary**: Create Emergency Handoff
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: Inline Schema
- **Response Body**: No Body

### POST /v1/trips
- **Summary**: Create Trip
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: Inline Schema
- **Response Body**: No Body

### POST /v1/trips/{trip_id}/events
- **Summary**: Trip Event
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**:
  - session_id (required: True)
- **Request Body**: Inline Schema
- **Response Body**: Inline Schema

### POST /v1/trips/{trip_id}/check-in
- **Summary**: Check In
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: Inline Schema
- **Response Body**: Inline Schema

### POST /v1/trips/{trip_id}/stop
- **Summary**: Stop Trip
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: Inline Schema
- **Response Body**: Inline Schema

### GET /v1/trips/{trip_id}
- **Summary**: Get Trip
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**:
  - session_id (required: True)
- **Request Body**: 
- **Response Body**: Inline Schema

### GET /v1/trips/{trip_id}/stream
- **Summary**: Trip Stream
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**:
  - session_id (required: True)
- **Request Body**: 
- **Response Body**: No Body

### POST /v1/trips/{trip_id}/deviation-response
- **Summary**: Respond To Deviation
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: Inline Schema
- **Response Body**: Inline Schema

### POST /v1/trusted-contacts
- **Summary**: Create Trusted Contact
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: Inline Schema
- **Response Body**: No Body

### GET /v1/trusted-contacts
- **Summary**: List Trusted Contacts
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**:
  - session_id (required: True)
- **Request Body**: 
- **Response Body**: Response List Trusted Contacts V1 Trusted Contacts Get

### POST /v1/trusted-contacts/{contact_id}/verify
- **Summary**: Verify Trusted Contact
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: Inline Schema
- **Response Body**: Inline Schema

### POST /v1/trusted-contacts/{contact_id}/revoke
- **Summary**: Revoke Trusted Contact
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**:
  - session_id (required: True)
- **Request Body**: 
- **Response Body**: Inline Schema

### POST /v1/sharing-grants
- **Summary**: Create Sharing Grant
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: Inline Schema
- **Response Body**: No Body

### POST /v1/sharing-grants/{grant_id}/revoke
- **Summary**: Revoke Sharing Grant
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**:
  - session_id (required: True)
- **Request Body**: 
- **Response Body**: Inline Schema

### GET /v1/shared-trips/{share_token}
- **Summary**: Get Shared Trip
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: 
- **Response Body**: Inline Schema

### GET /v1/shared-trips/{share_token}/stream
- **Summary**: Shared Trip Stream
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: 
- **Response Body**: No Body

### POST /v1/analytics/events
- **Summary**: Ingest
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: Inline Schema
- **Response Body**: No Body

### GET /v1/analytics/summary
- **Summary**: Summary
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**:
  - start (required: False)
  - end (required: False)
- **Request Body**: 
- **Response Body**: Response Summary V1 Analytics Summary Get

### GET /v1/analytics/allowlist
- **Summary**: Allowlist
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: 
- **Response Body**: Response Allowlist V1 Analytics Allowlist Get

### POST /v1/analytics/experiments
- **Summary**: Create Experiment
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: Inline Schema
- **Response Body**: No Body

### POST /v1/analytics/experiments/{experiment_key}/assign
- **Summary**: Assignment
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: 
- **Response Body**: Response Assignment V1 Analytics Experiments  Experiment Key  Assign Post

### POST /v1/auth/codes
- **Summary**: Request Code
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: Inline Schema
- **Response Body**: No Body

### POST /v1/auth/verify
- **Summary**: Verify
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: Inline Schema
- **Response Body**: Inline Schema

### POST /v1/auth/revoke
- **Summary**: Revoke
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: 
- **Response Body**: No Body

### GET /v1/auth/me
- **Summary**: Me
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: 
- **Response Body**: Inline Schema

### GET /v1/profile
- **Summary**: Get Profile
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: 
- **Response Body**: Inline Schema

### PUT /v1/profile
- **Summary**: Update Profile
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: Inline Schema
- **Response Body**: Inline Schema

### PATCH /v1/profile
- **Summary**: Update Profile
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: Inline Schema
- **Response Body**: Inline Schema

### GET /v1/onboarding/status
- **Summary**: Onboarding Status
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: 
- **Response Body**: Inline Schema

### POST /v1/consents
- **Summary**: Create Consent
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: Inline Schema
- **Response Body**: Inline Schema

### GET /v1/consents
- **Summary**: List Consents
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: 
- **Response Body**: Response List Consents V1 Consents Get

### POST /v1/consents/{consent_id}/withdraw
- **Summary**: Withdraw Consent
- **Auth Requirements**: No explicit auth documented
- **Query Parameters**: None
- **Request Body**: 
- **Response Body**: Inline Schema
