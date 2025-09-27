import { WebSocket } from 'ws';

// In-memory store for WebSocket connections
const clients = new Set<WebSocket>();

// Interface for WebSocket server
export interface WebSocketServer {
  on(event: 'connection', callback: (ws: WebSocket) => void): void;
  // Add other necessary methods if needed
}

// This is a helper function to broadcast messages to all connected clients
export function broadcastMessage(message: any) {
  const data = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Initialize WebSocket server
export function initializeWebSocketServer(): WebSocketServer | null {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const WebSocket = require('ws');
  const wss = new WebSocket.Server({ noServer: true });
  
  wss.on('connection', (ws: WebSocket) => {
    clients.add(ws);
    
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        // Broadcast the message to all clients
        broadcastMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
    });
  });

  return wss;
}

// Get the WebSocket server instance
let wss: WebSocketServer | null = null;

export function getWebSocketServer(): WebSocketServer | null {
  if (!wss) {
    wss = initializeWebSocketServer();
  }
  return wss;
}
