import { io } from 'socket.io-client';
import { API_BASE } from '../config';

let socket = null;

export const connectSocket = (userId) => {
  if (!userId) return null;

  if (!socket) {
    socket = io(API_BASE, { withCredentials: true });
  }

  socket.emit('join', userId);
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
