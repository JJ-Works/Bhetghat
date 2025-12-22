package com.jj.bhetghat.service;

import com.jj.bhetghat.model.Event;
import com.jj.bhetghat.repository.EventRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;

    public EventServiceImpl(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @Override
    public Event saveEvent(Event event) {
        return eventRepository.save(event);
    }

    @Override
    public Event getEventById(Long id) {
        return eventRepository.findById(id).orElseThrow(() -> new RuntimeException("Event not found"));
    }

    @Override
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    @Override
    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new RuntimeException("Event not found");
        }
        eventRepository.deleteById(id);
    }

}
