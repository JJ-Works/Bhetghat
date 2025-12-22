package com.jj.bhetghat.service;

import com.jj.bhetghat.model.Event;
import com.jj.bhetghat.model.User;
import java.util.List;

public interface UserService {
    User saveUser(User user);
    User getUserById(Long id);
    List<User> getAllUsers();
    void deleteUser(Long id);

    List<Event> getEventsHostedByUser(Long id);
}
