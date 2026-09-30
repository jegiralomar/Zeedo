import { WS_BASE_URL } from './config';

type MessageHandler = (data: any) => void;
type ConnectionHandler = (connected: boolean) => void;

class ZeedoBiddingSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private channelHandlers = new Map<string, Set<MessageHandler>>();
  private eventHandlers = new Map<string, Set<MessageHandler>>();
  private connectionListeners = new Set<ConnectionHandler>();
  private reconnectTimer: any = null;
  private isConnected = false;
  private currentUserId: string | null = null;

  constructor(url?: string) {
    this.url = url || WS_BASE_URL;
  }

  public onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionListeners.add(handler);
    handler(this.isConnected);
    return () => {
      this.connectionListeners.delete(handler);
    };
  }

  private notifyConnection(connected: boolean) {
    this.isConnected = connected;
    for (const listener of this.connectionListeners) {
      try {
        listener(connected);
      } catch {}
    }
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
        this.notifyConnection(true);

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
        this.notifyConnection(false);
        this.ws = null;
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.notifyConnection(false);
        this.ws?.close();
      };
    } catch {
      this.notifyConnection(false);
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

  public sendBid(auctionId: string, amountIqd: number) {
    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'bid', auctionId, amountIqd }));
    }
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
