package com.jj.eventify.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class EventTest {

    @Test
    void testEventRelationships() {
        Event event = new Event();
        assertNotNull(event.getJoinRequests(), "JoinRequests should be initialized");
        assertNotNull(event.getMessages(), "Messages should be initialized");
    }
}
