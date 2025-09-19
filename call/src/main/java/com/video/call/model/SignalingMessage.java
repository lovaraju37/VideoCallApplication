package com.video.call.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SignalingMessage {
    
    public enum Type {
        OFFER, ANSWER, ICE_CANDIDATE, JOIN_ROOM, LEAVE_ROOM, USER_JOINED, USER_LEFT,
        CHAT_MESSAGE, HOST_ACTION, MUTE_PARTICIPANT, KICK_PARTICIPANT, RECORDING_START, RECORDING_STOP
    }
    
    @JsonProperty("type")
    private Type type;
    
    @JsonProperty("data")
    private Object data;
    
    @JsonProperty("roomId")
    private String roomId;
    
    @JsonProperty("userId")
    private String userId;
    
    @JsonProperty("targetUserId")
    private String targetUserId;
    
    public SignalingMessage() {}
    
    public SignalingMessage(Type type, Object data, String roomId, String userId) {
        this.type = type;
        this.data = data;
        this.roomId = roomId;
        this.userId = userId;
    }
    
    // Getters and Setters
    public Type getType() {
        return type;
    }
    
    public void setType(Type type) {
        this.type = type;
    }
    
    public Object getData() {
        return data;
    }
    
    public void setData(Object data) {
        this.data = data;
    }
    
    public String getRoomId() {
        return roomId;
    }
    
    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getTargetUserId() {
        return targetUserId;
    }
    
    public void setTargetUserId(String targetUserId) {
        this.targetUserId = targetUserId;
    }
}
