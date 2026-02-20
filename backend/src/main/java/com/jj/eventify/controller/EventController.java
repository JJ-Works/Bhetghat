package com.jj.eventify.controller;

import com.jj.eventify.model.Event;
import com.jj.eventify.model.JoinRequest;
import com.jj.eventify.service.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping
    public Event createEvent(@RequestBody Event event) {
        return eventService.createEvent(event);
    }

    @GetMapping
    public List<Event> getAllEvents() {
        return eventService.getAllEvents();
    }

    @GetMapping("/{id}")
    public Event getEvent(@PathVariable Long id) {
        return eventService.getEventById(id);
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<?> requestToJoin(@PathVariable Long id, @RequestBody Map<String, Long> payload) {
        Long userId = payload.get("userId");
        eventService.requestToJoin(id, userId);
        return ResponseEntity.ok(Map.of("message", "Request sent successfully"));
    }

    @GetMapping("/{id}/requests")
    public List<JoinRequest> getRequests(@PathVariable Long id) {
        return eventService.getPendingRequests(id);
    }

    @PostMapping("/requests/{requestId}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long requestId) {
        eventService.approveRequest(requestId);
        return ResponseEntity.ok(Map.of("message", "Request approved"));
    }

    @GetMapping("/{id}/status/{userId}")
    public ResponseEntity<?> getStatus(@PathVariable Long id, @PathVariable Long userId) {
        return ResponseEntity.ok(Map.of("status", eventService.getJoinStatus(id, userId)));
    }

    @DeleteMapping("/{id}/join/{userId}")
    public ResponseEntity<?> cancelOrLeave(@PathVariable Long id, @PathVariable Long userId) {
        eventService.leaveEvent(id, userId);
        return ResponseEntity.ok(Map.of("message", "Success"));
    }

    @DeleteMapping("/{id}/participants/{userId}")
    public ResponseEntity<?> removeParticipant(@PathVariable Long id, @PathVariable Long userId) {
        eventService.removeParticipant(id, userId);
        return ResponseEntity.ok(Map.of("message", "Participant removed"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok(Map.of("message", "Event deleted successfully"));
    }
}
