import { useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SignalClient } from '../services/signalClient';
import useWebRTC from '../hooks/useWebRTC';
import VideoPlayer from './VideoPlayer';
import Controls from './Controls';
import ParticipantsList from './ParticipantsList';
import ChatPanel from './ChatPanel';

export default function VideoCall({ initialName }) {
  const [roomInput, setRoomInput] = useState('demo-room');
  const [roomId, setRoomId] = useState(null);
  const [userId] = useState(() => uuidv4());
  const [displayName, setDisplayName] = useState(initialName || 'Guest');
  const [preJoinStream, setPreJoinStream] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [participantsCollapsed, setParticipantsCollapsed] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(false);

  const signalClient = useMemo(() => new SignalClient({ userId }), [userId]);

  const { state, actions } = useWebRTC({ userId, roomId, signalClient });
  const { localStream, peers, joined, error, isAudioOn, isVideoOn } = state;
  const { joinRoom, leaveRoom, toggleAudio, toggleVideo, startScreenShare } = actions;

  // Handle incoming signaling messages
  useEffect(() => {
    if (!signalClient || !roomId) return;

    const originalOnRoomMessage = signalClient.onRoomMessage;
    signalClient.onRoomMessage = (message) => {
      // Call original handler for WebRTC messages
      if (originalOnRoomMessage) {
        originalOnRoomMessage(message);
      }

      // Handle chat messages
      if (message.type === 'CHAT_MESSAGE' && message.userId !== userId) {
        const newMessage = {
          id: Date.now(),
          sender: message.data.senderName,
          content: message.data.content,
          timestamp: new Date(message.data.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        };
        setChatMessages(prev => [...prev, newMessage]);
      }

      // Handle host actions
      if (message.type === 'HOST_ACTION') {
        const { action, targetUserId } = message.data;
        if (targetUserId === userId) {
          switch (action) {
            case 'MUTE':
              if (isAudioOn) toggleAudio();
              break;
            case 'KICK':
              leaveRoom();
              break;
          }
        }
      }
    };

    return () => {
      signalClient.onRoomMessage = originalOnRoomMessage;
    };
  }, [signalClient, roomId, userId, isAudioOn, toggleAudio, leaveRoom]);

  const handleJoin = async () => {
    setRoomId(roomInput.trim());
    // joinRoom will use updated roomId via state in the hook on next render
    setTimeout(() => joinRoom(), 0);
    // Stop pre-join preview stream if any
    preJoinStream?.getTracks().forEach((t) => t.stop());
    setPreJoinStream(null);
  };

  // Load a camera preview for pre-join (stopped on join)
  useEffect(() => {
    if (preJoinStream || (roomId && roomId.length > 0)) return;
    let cancelled = false;
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!cancelled) setPreJoinStream(s);
      } catch {}
    })();
    return () => {
      cancelled = true;
      preJoinStream?.getTracks().forEach((t) => t.stop());
    };
  }, [preJoinStream, roomId]);

  const handleSendMessage = (message) => {
    if (joined && roomId) {
      signalClient.sendChatMessage(roomId, message, displayName);
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    // TODO: Show toast notification
  };

  if (!joined) {
    return (
      <div>
        <div className="app-header">
          <div className="brand">LiveCall</div>
        </div>

        <div className="panel">
          <div className="topbar">
            <input
              className="room-input"
              type="text"
              placeholder="Enter room id (e.g., team-standup)"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
            />
            <button className="primary btn-gradient" onClick={handleJoin} disabled={!roomInput.trim()}>
              Join
            </button>
          </div>

          {error && <div style={{ color: '#ff6b6b', padding: '0 12px 8px' }}>{error}</div>}

          <div className="stage">
            <div className="videos-layout">
              <VideoPlayer stream={preJoinStream} muted label={`Preview • ${displayName}`} />
              <div className="placeholder">
                <span>Waiting for participants… Share the room ID to invite others.</span>
              </div>
            </div>

            <div className="controls-dock">
              <Controls
                joined={false}
                isAudioOn={preJoinStream?.getAudioTracks()?.[0]?.enabled}
                isVideoOn={preJoinStream?.getVideoTracks()?.[0]?.enabled}
                onToggleAudio={() => {}}
                onToggleVideo={() => {}}
                onScreenShare={() => {}}
                onLeave={() => {}}
              />
            </div>
          </div>

          <div style={{display:'flex', gap:12, padding:'0 16px 16px', alignItems:'center'}}>
            <input
              className="room-input"
              type="text"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={{maxWidth:300}}
            />
            <span className="meta">Your name will be shown to others in the call.</span>
          </div>

          <div className="meta">
            Room: {roomId || '-'} | User: {userId.slice(0, 8)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="app-header">
        <div className="brand">LiveCall</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="meta">Room: {roomId}</span>
          <button className="primary" onClick={copyRoomId} title="Copy room ID">
            📋
          </button>
          <button className="danger" onClick={leaveRoom}>Leave</button>
        </div>
      </div>

      <div className="conference-layout">
        <div className="conference-main">
          {error && <div style={{ color: '#ff6b6b', padding: '12px' }}>{error}</div>}
          
          <div className="panel stage">
            <div className="videos-layout">
              <VideoPlayer stream={localStream} muted label={`You • ${displayName}`} />
              
              {Object.entries(peers).length === 0 ? (
                <div className="placeholder">
                  <span>Waiting for participants… Share the room ID to invite others.</span>
                </div>
              ) : (
                <div className="videos-grid">
                  {Object.entries(peers).map(([pid, p]) => (
                    <VideoPlayer 
                      key={pid} 
                      stream={p.stream} 
                      label={p.displayName || `Participant ${pid.slice(0, 6)}`} 
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="controls-dock">
              <Controls
                joined={joined}
                isAudioOn={isAudioOn}
                isVideoOn={isVideoOn}
                onToggleAudio={toggleAudio}
                onToggleVideo={toggleVideo}
                onScreenShare={startScreenShare}
                onLeave={leaveRoom}
              />
            </div>
          </div>
        </div>

        <div className="conference-sidebar">
          <ParticipantsList
            peers={peers}
            localStream={localStream}
            displayName={displayName}
            isCollapsed={participantsCollapsed}
            onToggleCollapse={() => setParticipantsCollapsed(!participantsCollapsed)}
            isHost={true} // TODO: Get from room data
            onHostAction={(action, targetUserId) => {
              if (joined && roomId) {
                signalClient.sendHostAction(roomId, action, targetUserId);
              }
            }}
          />
          
          <ChatPanel
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            displayName={displayName}
            isCollapsed={chatCollapsed}
            onToggleCollapse={() => setChatCollapsed(!chatCollapsed)}
          />
        </div>
      </div>

      {/* Collapsed panels for mobile/small screens */}
      {participantsCollapsed && (
        <ParticipantsList
          peers={peers}
          localStream={localStream}
          displayName={displayName}
          isCollapsed={true}
          onToggleCollapse={() => setParticipantsCollapsed(false)}
          isHost={true}
          onHostAction={(action, targetUserId) => {
            if (joined && roomId) {
              signalClient.sendHostAction(roomId, action, targetUserId);
            }
          }}
        />
      )}
      
      {chatCollapsed && (
        <ChatPanel
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          displayName={displayName}
          isCollapsed={true}
          onToggleCollapse={() => setChatCollapsed(false)}
        />
      )}
    </div>
  );
}
