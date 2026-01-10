package com.jj.eventify.service;

import com.jj.eventify.model.Event;
import com.jj.eventify.repository.EventRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventCleanupScheduler {

    private final EventRepository eventRepository;

    public EventCleanupScheduler(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    // Run every minute
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void cleanupExpiredEvents() {
        List<Event> allEvents = eventRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        
        for (Event event : allEvents) {
            if (event.getEventDate() != null && event.getEventDate().isBefore(now)) {
                System.out.println("Deleting expired event: " + event.getTitle());
                eventRepository.delete(event);
            }
        }
    }
}
