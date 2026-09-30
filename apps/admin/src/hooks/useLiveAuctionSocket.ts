'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useBuyerAuctionStore } from '@/store/useBuyerAuctionStore';

interface UseLiveAuctionSocketOptions {
  auctionId?: string;
  enabled?: boolean;
}

/**
 * Real-Time Bidding Socket Hook
 * Connects to the $5/mo Zeedo WebSocket Gateway, subscribes to auction channel,
 * and synchronizes live bids & anti-sniping timer extensions with 0 polling.
 */
export function useLiveAuctionSocket({ auctionId, enabled = true }: UseLiveAuctionSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  const handleLiveEvent = useCallback((eventPayload: any) => {
    try {
      const { event, data } = eventPayload;
      if (event === 'NEW_BID' && data && data.auctionId) {
        useBuyerAuctionStore.setState((state) => ({
          auctions: state.auctions.map((a) => {
            if (a.id !== data.auctionId) return a;
            return {
              ...a,
              currentBidIqd: data.currentBidIqd,
              totalBids: data.totalBids,
              auctionEndsAt: data.auctionEndsAt,
              isAntiSnipingActive: data.isAntiSnipingActive,
              antiSnipingResetsCount: data.antiSnipingResetsCount,
              highestBidder: data.highestBidder,
              bidsHistory: data.newBidRecord
                ? [data.newBidRecord, ...(a.bidsHistory || [])].slice(0, 50)
                : a.bidsHistory,
            };
          }),
        }));
      }
    } catch (err) {
      console.warn('[Zeedo WS] Error processing socket event:', err);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL ||
      (typeof window !== 'undefined' && window.location.protocol === 'https:'
        ? `wss://${window.location.host}/ws`
        : `ws://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:8080`);

    let isUnmounted = false;

    function connect() {
      if (isUnmounted) return;

      try {
        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          if (isUnmounted) {
            ws.close();
            return;
          }
          setIsConnected(true);

          // If an auctionId is provided, subscribe immediately
          if (auctionId) {
            ws.send(JSON.stringify({ action: 'subscribe', channel: `auction:${auctionId}` }));
          }
          // Also subscribe to global announcements
          ws.send(JSON.stringify({ action: 'subscribe', channel: 'global' }));
        };

        ws.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            handleLiveEvent(parsed);
          } catch {
            // Non-JSON frame
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          socketRef.current = null;
          // Reconnect with exponential backoff if unmounted is false
          if (!isUnmounted) {
            reconnectTimeoutRef.current = setTimeout(connect, 3000);
          }
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {
        if (!isUnmounted) {
          reconnectTimeoutRef.current = setTimeout(connect, 5000);
        }
      }
    }

    connect();

    return () => {
      isUnmounted = true;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        if (auctionId) {
          socketRef.current.send(JSON.stringify({ action: 'unsubscribe', channel: `auction:${auctionId}` }));
        }
        socketRef.current.close();
      }
    };
  }, [auctionId, enabled, handleLiveEvent]);

  return { isConnected };
}
