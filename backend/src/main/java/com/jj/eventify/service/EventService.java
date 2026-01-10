package com.jj.eventify.service;

import com.jj.eventify.model.Event;
import com.jj.eventify.model.JoinRequest;
import com.jj.eventify.model.User;
import com.jj.eventify.repository.EventRepository;
import com.jj.eventify.repository.JoinRequestRepository;
import com.jj.eventify.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final JoinRequestRepository joinRequestRepository;



    public EventService(EventRepository eventRepository, UserRepository userRepository, JoinRequestRepository joinRequestRepository) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.joinRequestRepository = joinRequestRepository;
    }

    public Event createEvent(Event event) {
        if (event.getHost() != null) {
            event.getParticipants().add(event.getHost());
        }
        return eventRepository.save(event);
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event getEventById(Long id) {
        return eventRepository.findById(id).orElse(null);
    }

    public void requestToJoin(Long eventId, Long userId) {
        if (joinRequestRepository.findByEventIdAndUserId(eventId, userId).isPresent()) {
            throw new RuntimeException("Request already sent");
        }
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        JoinRequest request = new JoinRequest();
        request.setEvent(event);
        request.setUser(user);
        request.setStatus("PENDING");
        joinRequestRepository.save(request);
    }

    public List<JoinRequest> getPendingRequests(Long eventId) {
        return joinRequestRepository.findByEventIdAndStatus(eventId, "PENDING");
    }

    public void approveRequest(Long requestId) {
        JoinRequest request = joinRequestRepository.findById(requestId).orElseThrow(() -> new RuntimeException("Request not found"));
        Event event = request.getEvent();
        User user = request.getUser();

        event.getParticipants().add(user);
        request.setStatus("APPROVED");
        
        eventRepository.save(event);
        joinRequestRepository.save(request);
    }

    public void cancelJoinRequest(Long eventId, Long userId) {
        joinRequestRepository.findByEventIdAndUserId(eventId, userId)
                .ifPresent(joinRequestRepository::delete);
    }

    public void leaveEvent(Long eventId, Long userId) {
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        event.getParticipants().remove(user);
        eventRepository.save(event);
        
        // Also clean up the join request record
        joinRequestRepository.findByEventIdAndUserId(eventId, userId)
                .ifPresent(joinRequestRepository::delete);
    }

    public void removeParticipant(Long eventId, Long userId) {
        // Same logic as leaveEvent
        leaveEvent(eventId, userId);
    }

    public String getJoinStatus(Long eventId, Long userId) {
        return joinRequestRepository.findByEventIdAndUserId(eventId, userId)
                .map(JoinRequest::getStatus)
                .orElse("NONE");
    }

    public void deleteEvent(Long eventId) {
        eventRepository.deleteById(eventId);
    }
}
