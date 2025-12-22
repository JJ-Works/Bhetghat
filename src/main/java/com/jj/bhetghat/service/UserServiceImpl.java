package com.jj.bhetghat.service;

import com.jj.bhetghat.model.Event;
import com.jj.bhetghat.model.User;
import com.jj.bhetghat.repository.EventRepository;
import com.jj.bhetghat.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;

    // Inject both repositories via constructor
    public UserServiceImpl(UserRepository userRepository, EventRepository eventRepository) {
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
    }

    @Override
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public List<Event> getEventsHostedByUser(Long id) {
        User host = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return eventRepository.findByHost(host); // <-- use the instance, not the class
    }
}
