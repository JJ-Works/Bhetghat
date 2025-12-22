package com.jj.bhetghat.repository;

import com.jj.bhetghat.model.JoinRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JoinRequestRepository extends JpaRepository<JoinRequest, Long> {
    List<JoinRequest> findByEventId(Long eventId);
    List<JoinRequest> findByUserId(Long userId);
}
