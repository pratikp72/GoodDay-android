import io from 'socket.io-client';
import { env } from 'src/config';


class SocketService {
  socket = null;

  connect(token) {
    if (this.socket) return this.socket;

    this.socket = io(env.SOCKET_URL, {
      transports: ['websocket'],
      auth: { Authorization: `Bearer ${token}` },
    });

    this.socket.on('connect', () => console.log('✅ Socket connected'));
    this.socket.on('disconnect', () => console.log('❌ Socket disconnected'));

    return this.socket;
  }

 
  startCall(params, callback) {
    this.socket?.emit('start-call', params, callback);
  }

  pickUpCall(params, callback) {
    this.socket?.emit('pick-up-call', params, callback);
  }

  hangUpCall(params, callback) {
    this.socket?.emit('decline-call', params, callback);
  }

  // listen for notifications
  onNotification(handler) {
    this.socket?.on('notification', handler);
  }

  removeListeners() {
    this.socket?.off('notification');
  }
}

export const socketService = new SocketService();
