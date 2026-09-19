/**
 * SaferPath Backend API Client
 *
 * This module owns all HTTP communication with the SaferPath backend.
 * It is the ONLY place in the frontend that should construct fetch() calls
 * against the backend API.
 *
 * Authentication: Currently uses ephemeral session_id correlation identifiers.
 * When BE-01 lands, the auth headers/cookies will be injected here.
 *
 * Error contract: All methods throw ApiError on non-2xx responses.
 * Callers should catch ApiError and render appropriate UX states.
 */

import { getSessionId } from "../../lib/session";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/v1";

// ---------------------------------------------------------------------------
// Error type
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId?: string;

  constructor(
    status: number,
    code: string,
    message: string,
    requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }

  get isNetworkError() {
    return this.status === 0;
  }
  get isValidation() {
    return this.status === 422;
  }
  get isConflict() {
    return this.status === 409;
  }
  get isNotFound() {
    return this.status === 404;
  }
  get isUnavailable() {
    return this.status >= 502 && this.status <= 504;
  }
}

// ---------------------------------------------------------------------------
// Core fetch helper
// ---------------------------------------------------------------------------

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch (err: unknown) {
    clearTimeout(timeout);
    const msg = err instanceof Error ? err.message : "Network error";
    throw new ApiError(0, "NETWORK_ERROR", msg);
  }
  clearTimeout(timeout);

  if (response.ok) {
    // 204 No Content
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  }

  // Parse error envelope
  let body: {
    error?: { code?: string; message?: string; request_id?: string };
  } = {};
  try {
    body = await response.json();
  } catch {
    // ignore
  }
  const err = body.error || {};
  throw new ApiError(
    response.status,
    err.code || "HTTP_ERROR",
    err.message || `HTTP ${response.status}`,
    err.request_id,
  );
}

// ---------------------------------------------------------------------------
// Reports API
// ---------------------------------------------------------------------------

export type ReportCategory =
  | "LIGHTING"
  | "ACCESSIBILITY"
  | "PEDESTRIAN_INFRASTRUCTURE"
  | "ACTIVITY_CONTEXT"
  | "TRANSIT_CONTEXT";

export type PublicationIntent = "PUBLIC_CONTEXT" | "RESTRICTED_EVIDENCE";

export type CoarseArea =
  | "MUMBAI_SOUTH"
  | "MUMBAI_CENTRAL"
  | "MUMBAI_NORTH"
  | "MUMBAI_EAST"
  | "MUMBAI_WEST";

export interface CreateReportPayload {
  idempotency_key: string;
  category: ReportCategory;
  observed_at: string; // ISO 8601 with timezone
  coarse_area?: CoarseArea;
  route_segment_id?: string;
  publication_intent?: PublicationIntent;
}

export interface ReportResponse {
  report_id: string;
  reference: string;
  category: ReportCategory;
  observed_at: string;
  submitted_at: string;
  publication_intent: PublicationIntent;
  moderation_status: string;
  expires_at: string;
  coarse_area: string | null;
  reused: boolean;
}

export async function createReport(
  payload: CreateReportPayload,
): Promise<ReportResponse> {
  return apiFetch<ReportResponse>("/reports", {
    method: "POST",
    body: JSON.stringify({
      session_id: getSessionId(),
      ...payload,
    }),
  });
}

export async function getReport(reportId: string): Promise<ReportResponse> {
  return apiFetch<ReportResponse>(
    `/reports/${encodeURIComponent(reportId)}?session_id=${encodeURIComponent(getSessionId())}`,
  );
}

// ---------------------------------------------------------------------------
// Evidence API
// ---------------------------------------------------------------------------

export interface EvidenceAuthorizationResponse {
  evidence_id: string;
  reference: string;
  upload_token: string;
  expires_at: string;
}

export interface EvidenceCompletionResponse {
  evidence_id: string;
  reference: string;
  state: string;
}

export interface EvidenceItem {
  evidence_id: string;
  reference: string;
  content_type: string;
  size_bytes: number;
  state: string;
  retention_until: string;
}

export async function authorizeEvidence(
  reportId: string,
  idempotencyKey: string,
  contentType: string,
  sizeBytes: number,
): Promise<EvidenceAuthorizationResponse> {
  return apiFetch<EvidenceAuthorizationResponse>(
    `/reports/${encodeURIComponent(reportId)}/evidence/upload-authorizations`,
    {
      method: "POST",
      body: JSON.stringify({
        session_id: getSessionId(),
        idempotency_key: idempotencyKey,
        content_type: contentType,
        size_bytes: sizeBytes,
      }),
    },
  );
}

export async function completeEvidence(
  reportId: string,
  evidenceId: string,
  uploadToken: string,
  contentBase64: string,
): Promise<EvidenceCompletionResponse> {
  return apiFetch<EvidenceCompletionResponse>(
    `/reports/${encodeURIComponent(reportId)}/evidence/${encodeURIComponent(evidenceId)}/complete`,
    {
      method: "POST",
      body: JSON.stringify({
        session_id: getSessionId(),
        upload_token: uploadToken,
        content_base64: contentBase64,
      }),
    },
  );
}

export async function listEvidence(reportId: string): Promise<EvidenceItem[]> {
  return apiFetch<EvidenceItem[]>(
    `/reports/${encodeURIComponent(reportId)}/evidence?session_id=${encodeURIComponent(getSessionId())}`,
  );
}

export async function deleteEvidence(
  reportId: string,
  evidenceId: string,
): Promise<void> {
  return apiFetch<void>(
    `/reports/${encodeURIComponent(reportId)}/evidence/${encodeURIComponent(evidenceId)}?session_id=${encodeURIComponent(getSessionId())}`,
    { method: "DELETE" },
  );
}

// ---------------------------------------------------------------------------
// Help Points API
// ---------------------------------------------------------------------------

export interface HelpPointApiItem {
  reference: string;
  category: string;
  contact: Record<string, string> | null;
  accessibility: string[] | null;
  verification_status: string;
  operating_status: string;
  sponsor_disclosure: string | null;
}

export async function getNearbyHelpPoints(
  latitude: number,
  longitude: number,
  radiusMeters: number = 1000,
  category?: string,
  accessibility?: string,
  verifiedOnly?: boolean,
): Promise<HelpPointApiItem[]> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    radius_meters: String(radiusMeters),
  });
  if (category) params.set("category", category);
  if (accessibility) params.set("accessibility", accessibility);
  if (verifiedOnly) params.set("verified_only", "true");

  return apiFetch<HelpPointApiItem[]>(
    `/help-points/nearby?${params.toString()}`,
  );
}

// ---------------------------------------------------------------------------
// Trips API
// ---------------------------------------------------------------------------

export interface CreateTripPayload {
  route_id: string;
  planned_arrival: string; // ISO 8601 with timezone
  planned_departure?: string;
  travel_mode: "walking";
  active_trip_consent: boolean;
  consent_reference: string;
  consent_version: string;
  sharing_scope?: "STATUS_ONLY" | "LOCATION";
}

export interface TripApiResponse {
  trip_id: string;
  status: string;
  selected_route_id: string;
  planned_arrival: string;
  travel_mode: string;
  sharing_scope: string;
  consent_version: string;
  last_update_at: string;
  retention_until: string;
}

export interface TripPollResponse extends TripApiResponse {
  latest_event_id: string | null;
  stale: boolean;
  deviation: DeviationSummary | null;
  emergency_handoff: Record<string, string> | null;
}

export interface DeviationSummary {
  deviation_id: string;
  status: string;
  detected_at: string;
  confirmation_required: boolean;
  user_response: string | null;
  alternate_route_id: string | null;
  context_band: string | null;
  confidence: string | null;
  explanation: Record<string, unknown> | null;
}

export async function createTrip(
  payload: CreateTripPayload,
): Promise<TripApiResponse> {
  return apiFetch<TripApiResponse>("/trips", {
    method: "POST",
    body: JSON.stringify({
      session_id: getSessionId(),
      ...payload,
    }),
  });
}

export interface TripEventPayload {
  event_id: string;
  idempotency_key: string;
  event_type: "TRIP_UPDATED" | "USER_CONFIRMED_OK" | "SHARING_GRANT_REVOKED";
  actor: "USER";
  occurred_at: string; // ISO with timezone
  location?: { longitude: number; latitude: number };
}

export async function postTripEvent(
  tripId: string,
  payload: TripEventPayload,
): Promise<void> {
  return apiFetch<void>(`/trips/${encodeURIComponent(tripId)}/events`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface TripActionPayload {
  event_id: string;
  idempotency_key: string;
  occurred_at: string;
}

export async function checkInTrip(
  tripId: string,
  payload: TripActionPayload,
): Promise<TripApiResponse> {
  return apiFetch<TripApiResponse>(
    `/trips/${encodeURIComponent(tripId)}/check-in`,
    {
      method: "POST",
      body: JSON.stringify({
        session_id: getSessionId(),
        ...payload,
      }),
    },
  );
}

export async function stopTrip(
  tripId: string,
  payload: TripActionPayload,
): Promise<TripApiResponse> {
  return apiFetch<TripApiResponse>(
    `/trips/${encodeURIComponent(tripId)}/stop`,
    {
      method: "POST",
      body: JSON.stringify({
        session_id: getSessionId(),
        ...payload,
      }),
    },
  );
}

export async function pollTrip(tripId: string): Promise<TripPollResponse> {
  return apiFetch<TripPollResponse>(
    `/trips/${encodeURIComponent(tripId)}?session_id=${encodeURIComponent(getSessionId())}`,
  );
}

export type DeviationUserResponse =
  | "CONFIRM_ROUTE_CHANGE"
  | "REJECT_ROUTE_CHANGE"
  | "UNSURE";

export interface DeviationResponsePayload {
  idempotency_key: string;
  response: DeviationUserResponse;
  occurred_at: string;
  alternate_location?: { longitude: number; latitude: number };
}

export interface DeviationResponseResult {
  trip_id: string;
  deviation_id: string;
  status: string;
  user_response: string;
  alternate_route_id: string | null;
  context_band: string | null;
  confidence: string | null;
  explanation: Record<string, unknown> | null;
}

export async function respondToDeviation(
  tripId: string,
  payload: DeviationResponsePayload,
): Promise<DeviationResponseResult> {
  return apiFetch<DeviationResponseResult>(
    `/trips/${encodeURIComponent(tripId)}/deviation-response`,
    {
      method: "POST",
      body: JSON.stringify({
        session_id: getSessionId(),
        ...payload,
      }),
    },
  );
}

// ---------------------------------------------------------------------------
// Trusted Contacts API
// ---------------------------------------------------------------------------

export interface TrustedContactApiResponse {
  contact_id: string;
  contact_reference: string;
  display_name: string;
  relationship_label: string;
  verification_status: string;
  verified_at: string | null;
  created_at: string;
  verification_token?: string;
}

export async function createTrustedContact(
  contactReference: string,
  displayName: string,
  relationshipLabel: string,
): Promise<TrustedContactApiResponse> {
  return apiFetch<TrustedContactApiResponse>("/trusted-contacts", {
    method: "POST",
    body: JSON.stringify({
      session_id: getSessionId(),
      contact_reference: contactReference,
      display_name: displayName,
      relationship_label: relationshipLabel,
    }),
  });
}

export async function listTrustedContacts(): Promise<
  TrustedContactApiResponse[]
> {
  return apiFetch<TrustedContactApiResponse[]>(
    `/trusted-contacts?session_id=${encodeURIComponent(getSessionId())}`,
  );
}

export async function revokeTrustedContact(
  contactId: string,
): Promise<TrustedContactApiResponse> {
  return apiFetch<TrustedContactApiResponse>(
    `/trusted-contacts/${encodeURIComponent(contactId)}/revoke?session_id=${encodeURIComponent(getSessionId())}`,
    { method: "POST" },
  );
}

// ---------------------------------------------------------------------------
// Sharing Grants API
// ---------------------------------------------------------------------------

export interface SharingGrantResponse {
  grant_id: string;
  trip_id: string;
  contact_id: string;
  scope: string;
  status: string;
  issued_at: string;
  expires_at: string;
  revoked_at: string | null;
  share_token: string | null;
}

export async function createSharingGrant(
  tripId: string,
  contactId: string,
  scope: "STATUS_ONLY" | "LOCATION" | "TRIP_CONTEXT",
  ttlHours?: number,
): Promise<SharingGrantResponse> {
  return apiFetch<SharingGrantResponse>("/sharing-grants", {
    method: "POST",
    body: JSON.stringify({
      session_id: getSessionId(),
      trip_id: tripId,
      contact_id: contactId,
      scope,
      ttl_hours: ttlHours,
    }),
  });
}

export async function revokeSharingGrant(
  grantId: string,
): Promise<SharingGrantResponse> {
  return apiFetch<SharingGrantResponse>(
    `/sharing-grants/${encodeURIComponent(grantId)}/revoke?session_id=${encodeURIComponent(getSessionId())}`,
    { method: "POST" },
  );
}

// ---------------------------------------------------------------------------
// Emergency Handoff API
// ---------------------------------------------------------------------------

export interface EmergencyHandoffResponse {
  handoff_id: string;
  method: string;
  status: string;
  requested_at: string;
  next_action: string;
  provider_reference: string | null;
}

export type EmergencyHandoffMethod =
  | "OFFICIAL_CALL"
  | "OFFICIAL_DEEP_LINK"
  | "APPROVED_INTEGRATION";

export async function createEmergencyHandoff(
  tripId: string,
  method: EmergencyHandoffMethod,
  idempotencyKey: string,
  consentVersion: string = "1.0",
  consentSource: string = "user_explicit_tap",
): Promise<EmergencyHandoffResponse> {
  return apiFetch<EmergencyHandoffResponse>("/emergency/handoff", {
    method: "POST",
    body: JSON.stringify({
      session_id: getSessionId(),
      trip_id: tripId,
      method,
      idempotency_key: idempotencyKey,
      explicit_user_action: true,
      consent_version: consentVersion,
      consent_source: consentSource,
    }),
  });
}

// ---------------------------------------------------------------------------
// Route Context API
// ---------------------------------------------------------------------------

export interface SegmentContextResponse {
  segment_id: string;
  sequence: number;
  expected_local_time: string;
  context_band: string;
  confidence: string;
  coverage: string;
  source_classes: string[];
  strongest_support: string[];
  caution: string[];
  unknown: string[];
  stale_groups: string[];
  freshness: Record<string, string>;
}

export interface RouteContextResponse {
  route_id: string;
  context_version: string;
  model_version: string;
  feature_version: string;
  rule_version: string;
  requested_local_time: string;
  timezone: string;
  time_mode: string;
  route_context_band: string;
  route_confidence: string;
  route_coverage: string;
  freshness_summary: Record<string, string>;
  affected_segments: string[];
  explanation: {
    strongest_support?: string[];
    strongest_caution?: string[];
    unknown_groups?: string[];
    stale_groups?: string[];
    [key: string]: any;
  };
  segments: SegmentContextResponse[];
}

export async function getRouteContext(
  routeId: string,
): Promise<RouteContextResponse> {
  return apiFetch<RouteContextResponse>(
    `/routes/${encodeURIComponent(routeId)}/context`,
  );
}
