package com.video.call.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String roomId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String hostId;

    @ElementCollection
    @CollectionTable(name = "room_participants", joinColumns = @JoinColumn(name = "room_id"))
    @Column(name = "participant_id")
    private Set<String> participants = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "room_moderators", joinColumns = @JoinColumn(name = "room_id"))
    @Column(name = "moderator_id")
    private Set<String> moderators = new HashSet<>();

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private boolean waitingRoomEnabled = false;

    @Column(nullable = false)
    private boolean recordingEnabled = false;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Constructors
    public Room() {}

    public Room(String roomId, String name, String hostId) {
        this.roomId = roomId;
        this.name = name;
        this.hostId = hostId;
        this.moderators.add(hostId); // Host is automatically a moderator
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getHostId() { return hostId; }
    public void setHostId(String hostId) { this.hostId = hostId; }

    public Set<String> getParticipants() { return participants; }
    public void setParticipants(Set<String> participants) { this.participants = participants; }

    public Set<String> getModerators() { return moderators; }
    public void setModerators(Set<String> moderators) { this.moderators = moderators; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public boolean isWaitingRoomEnabled() { return waitingRoomEnabled; }
    public void setWaitingRoomEnabled(boolean waitingRoomEnabled) { this.waitingRoomEnabled = waitingRoomEnabled; }

    public boolean isRecordingEnabled() { return recordingEnabled; }
    public void setRecordingEnabled(boolean recordingEnabled) { this.recordingEnabled = recordingEnabled; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Helper methods
    public void addParticipant(String participantId) {
        this.participants.add(participantId);
    }

    public void removeParticipant(String participantId) {
        this.participants.remove(participantId);
    }

    public boolean isHost(String userId) {
        return hostId.equals(userId);
    }

    public boolean isModerator(String userId) {
        return moderators.contains(userId);
    }

    public void addModerator(String userId) {
        this.moderators.add(userId);
    }

    public void removeModerator(String userId) {
        if (!isHost(userId)) { // Can't remove host as moderator
            this.moderators.remove(userId);
        }
    }
}
