package com.video.call.controller;

import com.video.call.model.ChatMessage;
import com.video.call.model.Room;
import com.video.call.model.SignalingMessage;
import com.video.call.repository.ChatMessageRepository;
import com.video.call.service.RoomService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class SignalingController {

    private final SimpMessagingTemplate messagingTemplate;
    private final RoomService roomService;
    private final ChatMessageRepository chatMessageRepository;

    public SignalingController(SimpMessagingTemplate messagingTemplate, RoomService roomService, ChatMessageRepository chatMessageRepository) {
        this.messagingTemplate = messagingTemplate;
        this.roomService = roomService;
        this.chatMessageRepository = chatMessageRepository;
    }

    @MessageMapping("/signal")
    public void handleSignal(@Payload SignalingMessage message) {
        // Handle different message types
        switch (message.getType()) {
            case JOIN_ROOM:
                handleJoinRoom(message);
                break;
            case LEAVE_ROOM:
                handleLeaveRoom(message);
                break;
            case CHAT_MESSAGE:
                handleChatMessage(message);
                break;
            case HOST_ACTION:
                handleHostAction(message);
                break;
            default:
                // Broadcast WebRTC signaling messages to all users in the room
                messagingTemplate.convertAndSend("/topic/room/" + message.getRoomId(), message);
                break;
        }
    }

    private void handleJoinRoom(SignalingMessage message) {
        Room room = roomService.addUserToRoom(message.getRoomId(), message.getUserId());
        
        // Broadcast user joined to room
        SignalingMessage joinedMessage = new SignalingMessage(
            SignalingMessage.Type.USER_JOINED, 
            Map.of("userId", message.getUserId(), "isHost", room.isHost(message.getUserId())),
            message.getRoomId(), 
            message.getUserId()
        );
        messagingTemplate.convertAndSend("/topic/room/" + message.getRoomId(), joinedMessage);
    }

    private void handleLeaveRoom(SignalingMessage message) {
        roomService.removeUserFromRoom(message.getRoomId(), message.getUserId());
        
        // Broadcast user left to room
        SignalingMessage leftMessage = new SignalingMessage(
            SignalingMessage.Type.USER_LEFT, 
            Map.of("userId", message.getUserId()),
            message.getRoomId(), 
            message.getUserId()
        );
        messagingTemplate.convertAndSend("/topic/room/" + message.getRoomId(), leftMessage);
    }

    private void handleChatMessage(SignalingMessage message) {
        // Save chat message to database
        @SuppressWarnings("unchecked")
        Map<String, Object> chatData = (Map<String, Object>) message.getData();
        
        ChatMessage chatMessage = new ChatMessage(
            message.getRoomId(),
            message.getUserId(),
            (String) chatData.get("senderName"),
            (String) chatData.get("content")
        );
        chatMessageRepository.save(chatMessage);
        
        // Broadcast chat message to room
        messagingTemplate.convertAndSend("/topic/room/" + message.getRoomId(), message);
    }

    private void handleHostAction(SignalingMessage message) {
        // Verify user is host or moderator
        Room room = roomService.getRoomByRoomId(message.getRoomId()).orElse(null);
        if (room == null || !room.isModerator(message.getUserId())) {
            return; // Unauthorized
        }

        // Broadcast host action to room
        messagingTemplate.convertAndSend("/topic/room/" + message.getRoomId(), message);
    }
}
