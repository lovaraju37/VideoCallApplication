package com.video.call.controller;

import com.video.call.model.ChatMessage;
import com.video.call.repository.ChatMessageRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatMessageRepository chatMessageRepository;

    public ChatController(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<ChatMessage>> getChatHistory(@PathVariable String roomId) {
        List<ChatMessage> messages = chatMessageRepository.findTop50ByRoomIdOrderByTimestampDesc(roomId);
        // Reverse to get chronological order (oldest first)
        messages = messages.reversed();
        return ResponseEntity.ok(messages);
    }

    @DeleteMapping("/room/{roomId}")
    public ResponseEntity<Void> clearChatHistory(@PathVariable String roomId) {
        chatMessageRepository.deleteByRoomId(roomId);
        return ResponseEntity.ok().build();
    }
}
