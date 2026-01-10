package com.jj.eventify.controller;

import com.jj.eventify.model.Message;
import com.jj.eventify.service.MessageService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping
    public Message sendMessage(@RequestBody Map<String, Object> payload) {
        return messageService.sendMessage(
            Long.valueOf(payload.get("eventId").toString()),
            Long.valueOf(payload.get("senderId").toString()),
            Long.valueOf(payload.get("receiverId").toString()),
            payload.get("content").toString()
        );
    }

    @GetMapping("/history")
    public List<Message> getHistory(
            @RequestParam Long eventId, 
            @RequestParam Long user1, 
            @RequestParam Long user2) {
        return messageService.getHistory(eventId, user1, user2);
    }
}
