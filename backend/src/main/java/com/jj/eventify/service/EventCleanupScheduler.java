package com.jj.eventify.service;

import com.jj.eventify.model.Event;
import com.jj.eventify.repository.EventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventCleanupScheduler {

    private static final Logger logger = LoggerFactory.getLogger(EventCleanupScheduler.class);
    private final EventRepository eventRepository;
    private final EventService eventService;

    public EventCleanupScheduler(EventRepository eventRepository, EventService eventService) {
        this.eventRepository = eventRepository;
        this.eventService = eventService;
    }

    // Run every minute
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void cleanupPastEvents() {
        LocalDateTime now = LocalDateTime.now();
        List<Event> pastEvents = eventRepository.findByEventDateBefore(now);

        if (!pastEvents.isEmpty()) {
            logger.info("Found {} past events to delete", pastEvents.size());
            for (Event event : pastEvents) {
                try {
                    logger.info("Deleting expired event: {} (Date: {})", event.getTitle(), event.getEventDate());
                    eventService.deleteEventById(event.getId());
                } catch (Exception e) {
                    logger.error("Error deleting event {}: {}", event.getId(), e.getMessage());
                }
            }
        }
    }
}
