// Simple SVG icons for video call controls
const MicIcon = ({ muted = false }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

const VideoIcon = ({ off = false }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

const ScreenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export default function Controls({ onToggleAudio, onToggleVideo, onScreenShare, onLeave, joined, isAudioOn, isVideoOn }) {
  return (
    <div className="controls">
      <button className={`btn ${isAudioOn ? 'btn-toggle' : 'btn-danger'}`} onClick={onToggleAudio} disabled={!joined} title={isAudioOn ? 'Mute' : 'Unmute'}>
        <MicIcon muted={!isAudioOn} />
      </button>
      <button className={`btn ${isVideoOn ? 'btn-toggle' : 'btn-danger'}`} onClick={onToggleVideo} disabled={!joined} title={isVideoOn ? 'Turn video off' : 'Turn video on'}>
        <VideoIcon off={!isVideoOn} />
      </button>
      <button className="btn btn-primary" onClick={onScreenShare} disabled={!joined} title="Share Screen">
        <ScreenIcon />
      </button>
      <button className="btn btn-danger" onClick={onLeave} disabled={!joined} title="Leave call">
        <PhoneIcon />
      </button>
    </div>
  );
}
