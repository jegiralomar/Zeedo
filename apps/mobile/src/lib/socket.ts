/**
 * Real-Time Bidding WebSocket Client for React Native (Expo)
 * Maintains persistent live stream of new bids & timer extensions.
 */

type MessageHandler = (data: any) => void;

class ZeedoBiddingSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private handlers = new Map<string, Set<MessageHandler>>();
  private reconnectTimer: any = null;
  private isConnected = false;

  constructor(url = 'wss://zeedo.auction/ws') {
    this.url = url;
  }

  public connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isConnected = true;
        // Resubscribe to active channels
        for (const channel of this.handlers.keys()) {
          this.ws?.send(JSON.stringify({ action: 'subscribe', channel }));
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const channel = payload.channel;
          if (channel && this.handlers.has(channel)) {
            for (const handler of this.handlers.get(channel)!) {
              handler(payload);
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

  public subscribe(channel: string, handler: MessageHandler) {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());
      if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ action: 'subscribe', channel }));
      }
    }
    this.handlers.get(channel)!.add(handler);
  }

  public unsubscribe(channel: string, handler: MessageHandler) {
    if (this.handlers.has(channel)) {
      this.handlers.get(channel)!.delete(handler);
      if (this.handlers.get(channel)!.size === 0) {
        this.handlers.delete(channel);
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
