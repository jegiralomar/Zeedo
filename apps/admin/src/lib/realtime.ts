/**
 * Real-Time Bidding Gateway Client
 * Dispatches live events from Next.js API to the high-performance WebSocket Gateway.
 */

const WS_GATEWAY_URL = process.env.WS_GATEWAY_URL || 'http://127.0.0.1:8080';
const WS_BROADCAST_SECRET = process.env.WS_BROADCAST_SECRET || 'zeedo_internal_live_socket_key_9898';

export interface LiveBroadcastPayload {
  channel?: string;
  channels?: string[];
  event: 'NEW_BID' | 'TIMER_RESET' | 'AUCTION_ENDED' | 'OUTBID_ALERT' | 'NEW_DROP';
  data: any;
}

/**
 * Broadcasts an event to all connected mobile & web clients in < 5ms
 */
export async function broadcastLiveEvent(payload: LiveBroadcastPayload): Promise<boolean> {
  try {
    const res = await fetch(`${WS_GATEWAY_URL}/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-broadcast-secret': WS_BROADCAST_SECRET,
      },
      body: JSON.stringify(payload),
      // Fast timeout so API requests are never blocked if gateway is offline
      signal: AbortSignal.timeout(1500),
    });

    if (res.ok) {
      return true;
    }
    return false;
  } catch (err: any) {
    // Non-fatal: if gateway is warming up or not configured locally, continue gracefully
    return false;
  }
}
