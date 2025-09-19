import { useEffect, useRef } from 'react';

export default function VideoPlayer({ stream, muted = false, label }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    if (stream) {
      ref.current.srcObject = stream;
    } else {
      ref.current.srcObject = null;
    }
  }, [stream]);

  return (
    <div className="video-card">
      <video ref={ref} playsInline autoPlay muted={muted} />
      {label && <span className="video-label">{label}</span>}
    </div>
  );
}
