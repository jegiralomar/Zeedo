import { useEffect, useRef, useCallback } from 'react';
import { ZEEDO_CONFIG } from '../config/api';
import { BidRecord } from '../types';

// --- Event Payloads -----------------------------------------------------------

export interface NewBidPayload {
  auctionId: string;
  currentBidIqd: number;
  highestBidder: { id: string; name: string; phone: string; city: string };
  totalBids: number;
  auctionEndsAt: string;
  isAntiSnipingActive: boolean;
  antiSnipingResetsCount: number;
  newBidRecord: BidRecord;
}

export interface TimerResetPayload {
  auctionId: string;
  auctionEndsAt: string;
  isAntiSnipingActive: boolean;
  antiSnipingResetsCount: number;
  additionalMinutes?: number;
}

export interface AuctionEndedPayload {
  auctionId: string;
  status: 'completed';
  highestBidder: { id: string; name: string; phone?: string; city?: string } | null;
  currentBidIqd: number;
  packageAwbId: string;
  concludedAt: string;
}

export interface OutbidAlertPayload {
  auctionId: string;
  auctionTitle: string;
  newBidIqd?: number;
  isWinner?: boolean;
  wonPriceIqd?: number;
  packageAwbId?: string;
}

export interface AuctionSocketCallbacks {
  onNewBid?: (payload: NewBidPayload) => void;
  onTimerReset?: (payload: TimerResetPayload) => void;
  onAuctionEnded?: (payload: AuctionEndedPayload) => void;
  onOutbidAlert?: (payload: OutbidAlertPayload) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

// --- Constants ----------------------------------------------------------------

const PING_INTERVAL_MS = 25_000;
const RECONNECT_BASE_MS = 1_000;
const RECONNECT_MAX_MS = 30_000;
const MAX_RECONNECT_ATTEMPTS = 10;

// --- Hook ---------------------------------------------------------------------

export function useAuctionSocket(
  auctionId: string | null,
  userId: string | null | undefined,
  callbacks: AuctionSocketCallbacks
) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isUnmountedRef = useRef(false);

  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const clearTimers = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (isUnmountedRef.current || !auctionId) return;

    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }

    let ws: WebSocket;
    try {
      ws = new WebSocket(ZEEDO_CONFIG.WS_URL);
    } catch {
      return;
    }

    wsRef.current = ws;

    ws.onopen = () => {
      if (isUnmountedRef.current) { ws.close(); return; }
      reconnectAttemptRef.current = 0;
      callbacksRef.current.onConnected?.();

      const channels = [`auction:${auctionId}`, 'global'];
      if (userId) channels.push(`user:${userId}`);
      ws.send(JSON.stringify({ action: 'subscribe', channels }));

      clearTimers();
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ action: 'ping' }));
        }
      }, PING_INTERVAL_MS);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string);
        const { event: evtName, data } = msg;
        if (!evtName || !data) return;

        switch (evtName) {
          case 'NEW_BID':
            if (data.auctionId === auctionId) callbacksRef.current.onNewBid?.(data as NewBidPayload);
            break;
          case 'TIMER_RESET':
          case 'TIMER_EXTENDED':
            if (data.auctionId === auctionId) callbacksRef.current.onTimerReset?.(data as TimerResetPayload);
            break;
          case 'AUCTION_ENDED':
            if (data.auctionId === auctionId) callbacksRef.current.onAuctionEnded?.(data as AuctionEndedPayload);
            break;
          case 'OUTBID_ALERT':
            callbacksRef.current.onOutbidAlert?.(data as OutbidAlertPayload);
            break;
          default:
            break;
        }
      } catch { /* malformed frame */ }
    };

    ws.onclose = () => {
      clearTimers();
      callbacksRef.current.onDisconnected?.();
      if (!isUnmountedRef.current) {
        const attempt = reconnectAttemptRef.current;
        if (attempt >= MAX_RECONNECT_ATTEMPTS) return;
        reconnectAttemptRef.current += 1;
        const delay = Math.min(RECONNECT_BASE_MS * 2 ** attempt, RECONNECT_MAX_MS);
        reconnectTimeoutRef.current = setTimeout(() => {
          if (!isUnmountedRef.current) connect();
        }, delay);
      }
    };

    ws.onerror = () => { /* onclose handles reconnection */ };
  }, [auctionId, userId, clearTimers]);

  useEffect(() => {
    isUnmountedRef.current = false;
    if (auctionId) connect();
    return () => {
      isUnmountedRef.current = true;
      clearTimers();
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [auctionId, userId, connect, clearTimers]);
}
