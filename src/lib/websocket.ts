// Mock WebSocket service
export type MessageListener = (data: any) => void;
export type ConnectionListener = (status: boolean) => void;

class MockWebSocket {
  private listeners: Map<string, MessageListener[]> = new Map();
  private connectionListeners: ConnectionListener[] = [];
  private connected: boolean = false;
  private timeout: number | null = null;

  constructor() {
    // Simulate connection after a short delay
    this.timeout = window.setTimeout(() => {
      this.connected = true;
      this.notifyConnectionChange();
      console.log('WebSocket connected');
    }, 1000);
  }

  public connect(): void {
    if (this.connected) return;
    
    this.connected = true;
    this.notifyConnectionChange();
    console.log('WebSocket connected');
  }

  public disconnect(): void {
    if (!this.connected) return;
    
    this.connected = false;
    this.notifyConnectionChange();
    console.log('WebSocket disconnected');
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public subscribe(channel: string, callback: MessageListener): void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, []);
    }
    this.listeners.get(channel)?.push(callback);
    console.log(`Subscribed to channel: ${channel}`);
  }

  public unsubscribe(channel: string, callback: MessageListener): void {
    if (!this.listeners.has(channel)) return;
    
    const channelListeners = this.listeners.get(channel) || [];
    const index = channelListeners.indexOf(callback);
    
    if (index !== -1) {
      channelListeners.splice(index, 1);
      console.log(`Unsubscribed from channel: ${channel}`);
    }
  }

  public onConnectionChange(callback: ConnectionListener): void {
    this.connectionListeners.push(callback);
  }

  public publish(channel: string, data: any): void {
    if (!this.connected) {
      console.warn('Cannot publish: WebSocket not connected');
      return;
    }

    const channelListeners = this.listeners.get(channel) || [];
    
    // Simulate network delay
    setTimeout(() => {
      channelListeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('Error in listener:', error);
        }
      });
      console.log(`Published to channel ${channel}:`, data);
    }, 100);
  }

  private notifyConnectionChange(): void {
    this.connectionListeners.forEach(listener => {
      try {
        listener(this.connected);
      } catch (error) {
        console.error('Error in connection listener:', error);
      }
    });
  }

  public cleanup(): void {
    if (this.timeout !== null) {
      clearTimeout(this.timeout);
    }
    this.listeners.clear();
    this.connectionListeners = [];
  }
}

// Singleton instance
const webSocketInstance = new MockWebSocket();
export default webSocketInstance;