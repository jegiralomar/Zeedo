'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useBuyerAuctionStore } from '@/store/useBuyerAuctionStore';
import { useBuyerAuthStore } from '@/store/useBuyerAuthStore';
import { useAdminStore } from '@/store/useAdminStore';

interface UseLiveAuctionSocketOptions {
  auctionId?: string;
  userId?: string;
  enabled?: boolean;
}

/**
 * Real-Time Bidding Socket Hook
 * Connects to the $5/mo Zeedo WebSocket Gateway, subscribes to auction and global channels,
 * and synchronizes live bids & anti-sniping timer extensions across Buyer and Admin panels.
 */
export function useLiveAuctionSocket({ auctionId, userId, enabled = true }: UseLiveAuctionSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  const handleLiveEvent = useCallback((eventPayload: any) => {
    try {
      const { event, data } = eventPayload;

      if (event === 'NEW_BID' && data && data.auctionId) {
        // 1. Update Buyer Marketplace Store
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

        // 2. Update Admin Operations Store
        useAdminStore.setState((state) => ({
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

      if (event === 'OUTBID_ALERT' && data) {
        useBuyerAuctionStore.setState({
          lastBidAlert: `⚠️ You were outbid on ${data.auctionTitle || 'an item'}! New lead: ${data.newBidIqd?.toLocaleString()} IQD`,
        });
      }

      // 3. Anti-Sniping & Admin Timer Extensions
      if ((event === 'TIMER_EXTENDED' || event === 'TIMER_RESET') && data && data.auctionId) {
        const updateFn = (a: any) => {
          if (a.id !== data.auctionId) return a;
          return {
            ...a,
            auctionEndsAt: data.auctionEndsAt || a.auctionEndsAt,
            isAntiSnipingActive:
              data.isAntiSnipingActive !== undefined
                ? data.isAntiSnipingActive
                : a.isAntiSnipingActive,
            antiSnipingResetsCount:
              data.antiSnipingResetsCount !== undefined
                ? data.antiSnipingResetsCount
                : a.antiSnipingResetsCount,
            status: data.status || a.status,
          };
        };
        useBuyerAuctionStore.setState((state) => ({ auctions: state.auctions.map(updateFn) }));
        useAdminStore.setState((state) => ({ auctions: state.auctions.map(updateFn) }));
      }

      // 4. Pause & Resume Operations
      if ((event === 'AUCTION_PAUSED' || event === 'AUCTION_RESUMED') && data && data.auctionId) {
        const newStatus = data.status || (event === 'AUCTION_RESUMED' ? 'live' : 'cancelled');
        const updateFn = (a: any) => {
          if (a.id !== data.auctionId) return a;
          return { ...a, status: newStatus };
        };
        useBuyerAuctionStore.setState((state) => ({ auctions: state.auctions.map(updateFn) }));
        useAdminStore.setState((state) => ({ auctions: state.auctions.map(updateFn) }));
      }

      // 5. Force End / Concluded Auction
      if (event === 'AUCTION_ENDED' && data && data.auctionId) {
        const updateFn = (a: any) => {
          if (a.id !== data.auctionId) return a;
          return {
            ...a,
            status: 'completed',
            currentBidIqd: data.currentBidIqd || a.currentBidIqd,
            highestBidder: data.highestBidder !== undefined ? data.highestBidder : a.highestBidder,
            packageAwbId: data.packageAwbId || a.packageAwbId,
            auctionEndsAt: data.concludedAt || a.auctionEndsAt,
          };
        };
        useBuyerAuctionStore.setState((state) => ({ auctions: state.auctions.map(updateFn) }));
        useAdminStore.setState((state) => ({ auctions: state.auctions.map(updateFn) }));
      }

      // 6. Voided Bid Event
      if (event === 'BID_VOIDED' && data && data.auctionId) {
        const updateFn = (a: any) => {
          if (a.id !== data.auctionId) return a;
          return {
            ...a,
            currentBidIqd: data.currentBidIqd,
            highestBidder: data.highestBidder,
            totalBids: data.totalBids !== undefined ? data.totalBids : a.totalBids,
            bidsHistory:
              data.bidsHistory ||
              a.bidsHistory?.map((b: any) =>
                b.id === data.voidedBidId || b.bidId === data.voidedBidId
                  ? { ...b, isVoided: true, voidReason: data.voidReason }
                  : b
              ),
          };
        };
        useBuyerAuctionStore.setState((state) => ({ auctions: state.auctions.map(updateFn) }));
        useAdminStore.setState((state) => ({ auctions: state.auctions.map(updateFn) }));
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

          const channelsToSub = ['global'];

          if (auctionId) {
            channelsToSub.push(`auction:${auctionId}`);
          }

          const effectiveUserId = userId || useBuyerAuthStore.getState().buyer?.id;
          if (effectiveUserId) {
            channelsToSub.push(`user:${effectiveUserId}`);
          }

          ws.send(JSON.stringify({ action: 'subscribe', channels: channelsToSub }));
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
