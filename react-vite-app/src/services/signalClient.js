import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = import.meta.env.VITE_SIGNALING_URL || 'http://localhost:8080/ws';

export class SignalClient {
  constructor({ userId }) {
    this.userId = userId;
    this.stompClient = null;
    this.connected = false;
    this.subscriptions = [];
    this.onRoomMessage = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.stompClient = new Client({
        webSocketFactory: () => new SockJS(WS_URL),
        onConnect: () => {
          this.connected = true;
          console.log('Connected to signaling server');
          resolve();
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame);
          reject(new Error(frame.headers['message']));
        },
        onWebSocketError: (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        }
      });
      
      this.stompClient.activate();
    });
  }

  subscribeToRoom(roomId) {
    if (!this.connected || !this.stompClient) return;
    
    const subscription = this.stompClient.subscribe(`/topic/room/${roomId}`, (message) => {
      const parsedMessage = JSON.parse(message.body);
      if (this.onRoomMessage) {
        this.onRoomMessage(parsedMessage);
      }
    });
    
    this.subscriptions.push(subscription);
    return subscription;
  }

  sendSignal(roomId, type, data, targetUserId = null) {
    if (!this.connected || !this.stompClient) return;
    
    const message = {
      type,
      data,
      roomId,
      userId: this.userId,
      targetUserId
    };
    
    this.stompClient.publish({
      destination: '/app/signal',
      body: JSON.stringify(message)
    });
  }

  sendChatMessage(roomId, content, senderName) {
    this.sendSignal(roomId, 'CHAT_MESSAGE', {
      content,
      senderName,
      timestamp: new Date().toISOString()
    });
  }

  sendHostAction(roomId, action, targetUserId = null) {
    this.sendSignal(roomId, 'HOST_ACTION', {
      action,
      targetUserId
    }, targetUserId);
  }

  disconnect() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.connected = false;
    }
  }
}
