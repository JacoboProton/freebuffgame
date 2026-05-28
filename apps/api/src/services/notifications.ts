import { Response } from 'express';

interface Connection {
  res: Response;
  connectedAt: number;
}

// Map of userId -> Map of Response -> Connection info
const userConnections = new Map<string, Map<Response, Connection>>();

// Cleanup stale connections every 60 seconds
setInterval(() => {
  const maxAge = 60000; // 60 seconds
  const now = Date.now();
  let cleaned = 0;
  
  for (const [userId, connections] of userConnections) {
    for (const [res, conn] of connections) {
      // Check if connection is still alive by testing if response is writable
      if (!res.writable || (now - conn.connectedAt) > maxAge * 10) {
        connections.delete(res);
        cleaned++;
      }
    }
    if (connections.size === 0) {
      userConnections.delete(userId);
    }
  }
  
  if (cleaned > 0) {
    console.log(`Cleaned up ${cleaned} stale notification connections`);
  }
}, 60000);

// Subscribe a user to real-time notifications via SSE
export function subscribeUser(userId: string, res: Response): void {
  if (!userConnections.has(userId)) {
    userConnections.set(userId, new Map());
  }
  userConnections.get(userId)!.set(res, { res, connectedAt: Date.now() });
  
  console.log(`User ${userId} subscribed to notifications. Total: ${userConnections.get(userId)!.size}`);
}

// Unsubscribe a user from notifications
export function unsubscribeUser(userId: string, res: Response): void {
  const connections = userConnections.get(userId);
  if (connections) {
    connections.delete(res);
    if (connections.size === 0) {
      userConnections.delete(userId);
    }
  }
}

// Broadcast a notification to a specific user via SSE
export function notifyUser(userId: string, notification: {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  createdAt: Date;
}): void {
  const connections = userConnections.get(userId);
  if (!connections || connections.size === 0) {
    return;
  }

  const message = formatSSEMessage('notification', notification);
  
  for (const [res] of connections) {
    if (res.writable) {
      res.write(message);
    }
  }
}

// Broadcast to all connected users (for system announcements)
export function broadcastToAll(notification: {
  id?: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  createdAt?: Date;
}): void {
  const message = formatSSEMessage('broadcast', notification);
  
  for (const [, connections] of userConnections) {
    for (const [res] of connections) {
      if (res.writable) {
        res.write(message);
      }
    }
  }
}

// Format SSE message
function formatSSEMessage(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

// Get connection count (for debugging)
export function getConnectionCount(): number {
  let total = 0;
  for (const connections of userConnections.values()) {
    total += connections.size;
  }
  return total;
}