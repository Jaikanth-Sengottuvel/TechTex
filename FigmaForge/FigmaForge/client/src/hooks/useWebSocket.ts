import { useEffect, useRef, useState } from 'react';

export interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  sessionId: string;
}

interface WebSocketMessage {
  type: string;
  data: any;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  users: CollaborationUser[];
  sendMessage: (message: WebSocketMessage) => void;
  joinRoom: (roomId: string, user: Omit<CollaborationUser, 'sessionId' | 'color'>) => void;
  sendCursorMove: (cursor: { x: number; y: number }) => void;
  sendLayerUpdate: (layer: any) => void;
  sendLayerAdd: (layer: any) => void;
  sendLayerDelete: (layerId: string) => void;
}

export function useWebSocket(onMessage?: (message: WebSocketMessage) => void): UseWebSocketReturn {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<CollaborationUser[]>([]);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = () => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        // Clear any pending reconnection
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
          if (onMessage) {
            onMessage(message);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setUsers([]);
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 3000);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setIsConnected(false);
    }
  };

  const handleMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'room-joined':
        setUsers(message.data.users);
        break;
      case 'user-joined':
        setUsers(prev => [...prev, message.data]);
        break;
      case 'user-left':
        setUsers(prev => prev.filter(user => user.sessionId !== message.data.sessionId));
        break;
      case 'cursor-update':
        setUsers(prev => prev.map(user => 
          user.sessionId === message.data.sessionId 
            ? { ...user, cursor: message.data.cursor }
            : user
        ));
        break;
    }
  };

  const sendMessage = (message: WebSocketMessage) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  };

  const joinRoom = (roomId: string, user: Omit<CollaborationUser, 'sessionId' | 'color'>) => {
    sendMessage({
      type: 'join-room',
      data: { roomId, user }
    });
  };

  const sendCursorMove = (cursor: { x: number; y: number }) => {
    sendMessage({
      type: 'cursor-move',
      data: { cursor }
    });
  };

  const sendLayerUpdate = (layer: any) => {
    sendMessage({
      type: 'layer-update',
      data: { layer }
    });
  };

  const sendLayerAdd = (layer: any) => {
    sendMessage({
      type: 'layer-add',
      data: { layer }
    });
  };

  const sendLayerDelete = (layerId: string) => {
    sendMessage({
      type: 'layer-delete',
      data: { layerId }
    });
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  return {
    isConnected,
    users,
    sendMessage,
    joinRoom,
    sendCursorMove,
    sendLayerUpdate,
    sendLayerAdd,
    sendLayerDelete,
  };
}