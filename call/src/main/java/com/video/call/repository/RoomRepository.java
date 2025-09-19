package com.video.call.repository;

import com.video.call.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findByRoomId(String roomId);
    List<Room> findByActiveTrue();
    boolean existsByRoomId(String roomId);
}
