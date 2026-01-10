package com.jj.eventify.service;

import com.jj.eventify.model.Message;
import com.jj.eventify.model.User;
import com.jj.eventify.model.Event;
import com.jj.eventify.repository.MessageRepository;
import com.jj.eventify.repository.UserRepository;
import com.jj.eventify.repository.EventRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;

    public MessageService(MessageRepository messageRepository, UserRepository userRepository, EventRepository eventRepository) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
    }

    public Message sendMessage(Long eventId, Long senderId, Long receiverId, String content) {
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));
        User sender = userRepository.findById(senderId).orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(receiverId).orElseThrow(() -> new RuntimeException("Receiver not found"));

        // Validation: Both must be participants
        if (!event.getParticipants().contains(sender) || !event.getParticipants().contains(receiver)) {
            throw new RuntimeException("Both users must be participants of the event to message.");
        }

        Message msg = new Message();
        msg.setEvent(event);
        msg.setSender(sender);
        msg.setReceiver(receiver);
        msg.setContent(content);
        msg.setTimestamp(LocalDateTime.now());
        
        return messageRepository.save(msg);
    }

    public List<Message> getHistory(Long eventId, Long u1, Long u2) {
        return messageRepository.findChatHistory(eventId, u1, u2);
    }
}
