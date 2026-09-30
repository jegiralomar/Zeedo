/**
 * Real-Time Bidding WebSocket Client for React Native (Expo)
 * Maintains persistent, low-latency live stream of new bids, anti-sniping timer extensions, and outbid alerts.
 */

type MessageHandler = (data: any) => void;

class ZeedoBiddingSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private channelHandlers = new Map<string, Set<MessageHandler>>();
  private eventHandlers = new Map<string, Set<MessageHandler>>();
  private reconnectTimer: any = null;
  private isConnected = false;
  private currentUserId: string | null = null;

  constructor(url?: string) {
    this.url =
      url ||
      process.env.EXPO_PUBLIC_WS_URL ||
      'wss://zeedo.auction/ws';
  }

  public setUserId(userId: string | null) {
    if (this.currentUserId === userId) return;

    if (this.currentUserId && this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'unsubscribe', channel: `user:${this.currentUserId}` }));
    }

    this.currentUserId = userId;

    if (this.currentUserId && this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'subscribe', channel: `user:${this.currentUserId}` }));
    }
  }

  public connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isConnected = true;

        // 1. Always subscribe to global marketplace feed
        const channelsToSub = ['global', ...Array.from(this.channelHandlers.keys())];

        // 2. Subscribe to user personal channel if logged in
        if (this.currentUserId) {
          channelsToSub.push(`user:${this.currentUserId}`);
        }

        this.ws?.send(JSON.stringify({ action: 'subscribe', channels: channelsToSub }));
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const channel = payload.channel;
          const eventName = payload.event;
          const data = payload.data || payload;

          // 1. Dispatch to channel handlers
          if (channel && this.channelHandlers.has(channel)) {
            for (const handler of this.channelHandlers.get(channel)!) {
              handler(data);
            }
          }

          // 2. Dispatch to event handlers (e.g. 'NEW_BID', 'OUTBID_ALERT')
          if (eventName && this.eventHandlers.has(eventName)) {
            for (const handler of this.eventHandlers.get(eventName)!) {
              handler(data);
            }
          }
        } catch {
          // Ignore invalid frames
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.ws = null;
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  /**
   * Listen to any event by name (e.g. 'NEW_BID', 'OUTBID_ALERT', 'TIMER_RESET')
   */
  public on(event: string, handler: MessageHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  public off(event: string, handler: MessageHandler) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event)!.delete(handler);
    }
  }

  /**
   * Subscribe to a specific channel (e.g. 'auction:auc-123')
   */
  public subscribe(channel: string, handler: MessageHandler): () => void {
    if (!this.channelHandlers.has(channel)) {
      this.channelHandlers.set(channel, new Set());
      if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ action: 'subscribe', channel }));
      }
    }
    this.channelHandlers.get(channel)!.add(handler);

    return () => this.unsubscribe(channel, handler);
  }

  public unsubscribe(channel: string, handler: MessageHandler) {
    if (this.channelHandlers.has(channel)) {
      this.channelHandlers.get(channel)!.delete(handler);
      if (this.channelHandlers.get(channel)!.size === 0) {
        this.channelHandlers.delete(channel);
        if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ action: 'unsubscribe', channel }));
        }
      }
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 3000);
  }

  public disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const liveSocket = new ZeedoBiddingSocket();
