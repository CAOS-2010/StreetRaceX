// Hook: subscribe to Socket.io events and auto-cleanup

import { useEffect } from 'react';
import { getSocket } from '../services/socket';

type RealtimeEvent =
  | 'challenge:received'
  | 'challenge:accepted'
  | 'challenge:rejected'
  | 'challenge:completed'
  | 'rank:upgraded'
  | 'notification:new';

export function useSocketEvent(event: RealtimeEvent, handler: (data: unknown) => void) {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  }, [event, handler]);
}
