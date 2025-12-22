package com.jj.bhetghat.repository;

import com.jj.bhetghat.model.Event;
import com.jj.bhetghat.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByHost(User host);
}
