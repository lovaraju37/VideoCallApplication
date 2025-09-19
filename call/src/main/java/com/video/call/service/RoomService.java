package com.video.call.service;

import com.video.call.model.Room;
import com.video.call.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public Room createRoom(String roomName, String hostId) {
        String roomId = UUID.randomUUID().toString();
        Room room = new Room(roomId, roomName, hostId);
        return roomRepository.save(room);
    }

    public Optional<Room> getRoomByRoomId(String roomId) {
        return roomRepository.findByRoomId(roomId);
    }

    public List<Room> getAllActiveRooms() {
        return roomRepository.findByActiveTrue();
    }

    public Room addUserToRoom(String roomId, String userId) {
        Optional<Room> roomOpt = roomRepository.findByRoomId(roomId);
        if (roomOpt.isPresent()) {
            Room room = roomOpt.get();
            room.addParticipant(userId);
            return roomRepository.save(room);
        }
        // create room lazily if not exists - first user becomes host
        Room newRoom = new Room(roomId, roomId, userId);
        newRoom.addParticipant(userId);
        return roomRepository.save(newRoom);
    }

    public Room removeUserFromRoom(String roomId, String userId) {
        Optional<Room> roomOpt = roomRepository.findByRoomId(roomId);
        if (roomOpt.isPresent()) {
            Room room = roomOpt.get();
            room.removeParticipant(userId);
            return roomRepository.save(room);
        }
        return null;
    }

    public boolean roomExists(String roomId) {
        return roomRepository.existsByRoomId(roomId);
    }

    public void deleteRoom(String roomId) {
        Optional<Room> roomOpt = roomRepository.findByRoomId(roomId);
        if (roomOpt.isPresent()) {
            Room room = roomOpt.get();
            room.setActive(false);
            roomRepository.save(room);
        }
    }
}
