package com.jj.bhetghat.service;

import com.jj.bhetghat.model.Message;
import java.util.List;

public interface MessageService {
    Message sendMessage(Message message);                 // method to save message
    List<Message> getMessagesByEventId(Long eventId);    // method to fetch messages by event
}
