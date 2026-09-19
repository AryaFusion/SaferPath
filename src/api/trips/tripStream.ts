/**
 * SaferPath Trip SSE Stream Client
 *
 * Connects to the backend's Server-Sent Events endpoint for real-time
 * trip updates during active walks. Falls back to polling when SSE
 * is unavailable or connection drops.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/v1';

export interface TripStreamEvent {
  type: 'trip_update' | 'deviation_detected' | 'check_in_reminder' | 'trip_ended' | 'heartbeat';
  data: Record<string, unknown>;
  timestamp: string;
}

export type TripStreamCallback = (event: TripStreamEvent) => void;
export type TripStreamErrorCallback = (error: Event) => void;

export interface TripStreamConnection {
  close: () => void;
  isConnected: () => boolean;
}

/**
 * Opens an SSE connection to the trip stream endpoint.
 *
 * @param tripId - The backend trip ID
 * @param onEvent - Callback fired for each SSE event
 * @param onError - Called when the connection encounters an error
 * @param onOpen - Called when the connection is established
 * @returns A TripStreamConnection object with close() and isConnected()
 */
export function connectTripStream(
  tripId: string,
  onEvent: TripStreamCallback,
  onError?: TripStreamErrorCallback,
  onOpen?: () => void,
): TripStreamConnection {
  const url = `${API_BASE}/trips/${encodeURIComponent(tripId)}/stream`;
  let connected = false;
  let eventSource: EventSource | null = null;

  try {
    eventSource = new EventSource(url);

    eventSource.onopen = () => {
      connected = true;
      onOpen?.();
    };

    eventSource.onmessage = (messageEvent: MessageEvent) => {
      try {
        const parsed = JSON.parse(messageEvent.data) as TripStreamEvent;
        onEvent(parsed);
      } catch {
        // If data isn't JSON, wrap it
        onEvent({
          type: 'trip_update',
          data: { raw: messageEvent.data },
          timestamp: new Date().toISOString(),
        });
      }
    };

    // Listen for specific named events from the backend
    eventSource.addEventListener('deviation_detected', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        onEvent({ type: 'deviation_detected', data, timestamp: new Date().toISOString() });
      } catch { /* ignore parse errors */ }
    });

    eventSource.addEventListener('check_in_reminder', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        onEvent({ type: 'check_in_reminder', data, timestamp: new Date().toISOString() });
      } catch { /* ignore parse errors */ }
    });

    eventSource.addEventListener('trip_ended', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        onEvent({ type: 'trip_ended', data, timestamp: new Date().toISOString() });
      } catch { /* ignore parse errors */ }
    });

    eventSource.onerror = (errorEvent: Event) => {
      connected = false;
      onError?.(errorEvent);
    };
  } catch {
    connected = false;
  }

  return {
    close: () => {
      connected = false;
      eventSource?.close();
      eventSource = null;
    },
    isConnected: () => connected,
  };
}
