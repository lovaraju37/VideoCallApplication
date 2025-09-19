import { useState } from 'react';

const ParticipantsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const MicIcon = ({ muted }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {muted ? (
      <>
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="m9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
        <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </>
    ) : (
      <>
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </>
    )}
  </svg>
);

const VideoIcon = ({ off }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {off ? (
      <>
        <path d="m16 16 4-4-4-4" />
        <path d="M12 12H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
        <path d="m2 2 20 20" />
      </>
    ) : (
      <>
        <polygon points="23,7 16,12 23,17" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </>
    )}
  </svg>
);

export default function ParticipantsList({ peers, localStream, displayName, isCollapsed, onToggleCollapse, isHost, onHostAction }) {
  const [showActions, setShowActions] = useState(null);

  const participants = [
    {
      id: 'local',
      name: displayName || 'You',
      isLocal: true,
      isMuted: !localStream?.getAudioTracks()?.[0]?.enabled,
      isVideoOff: !localStream?.getVideoTracks()?.[0]?.enabled,
    },
    ...Object.entries(peers).map(([peerId, peer]) => ({
      id: peerId,
      name: peer.displayName || `Participant ${peerId.slice(0, 6)}`,
      isLocal: false,
      isMuted: !peer.stream?.getAudioTracks()?.[0]?.enabled,
      isVideoOff: !peer.stream?.getVideoTracks()?.[0]?.enabled,
    }))
  ];

  if (isCollapsed) {
    return (
      <div className="participants-collapsed">
        <button className="participants-toggle" onClick={onToggleCollapse} title="Show participants">
          <ParticipantsIcon />
          <span className="participant-count">{participants.length}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="participants-panel">
      <div className="participants-header">
        <div className="participants-title">
          <ParticipantsIcon />
          <span>Participants ({participants.length})</span>
        </div>
        <button className="participants-collapse" onClick={onToggleCollapse} title="Hide participants">
          ×
        </button>
      </div>
      
      <div className="participants-list">
        {participants.map((participant) => (
          <div 
            key={participant.id} 
            className={`participant-item ${participant.isLocal ? 'local' : ''}`}
            onMouseEnter={() => setShowActions(participant.id)}
            onMouseLeave={() => setShowActions(null)}
          >
            <div className="participant-avatar">
              {participant.name.charAt(0).toUpperCase()}
            </div>
            
            <div className="participant-info">
              <div className="participant-name">
                {participant.name}
                {participant.isLocal && <span className="you-label">(You)</span>}
              </div>
              <div className="participant-status">
                <span className={`status-indicator ${participant.isMuted ? 'muted' : 'active'}`}>
                  <MicIcon muted={participant.isMuted} />
                </span>
                <span className={`status-indicator ${participant.isVideoOff ? 'off' : 'active'}`}>
                  <VideoIcon off={participant.isVideoOff} />
                </span>
              </div>
            </div>

            {showActions === participant.id && !participant.isLocal && isHost && (
              <div className="participant-actions">
                <button 
                  className="action-btn" 
                  title="Mute participant"
                  onClick={() => onHostAction?.('MUTE', participant.id)}
                >
                  <MicIcon muted={true} />
                </button>
                <button 
                  className="action-btn danger" 
                  title="Remove participant"
                  onClick={() => onHostAction?.('KICK', participant.id)}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="participants-footer">
        <button className="invite-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
          Invite others
        </button>
      </div>
    </div>
  );
}
