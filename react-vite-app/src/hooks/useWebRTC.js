import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const iceServers = [
  { urls: 'stun:stun.l.google.com:19302' },
];

export default function useWebRTC({ userId, roomId, signalClient }) {
  const [localStream, setLocalStream] = useState(null);
  const [peers, setPeers] = useState({}); // { [remoteUserId]: { pc, stream } }
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState(null);

  const peersRef = useRef({});

  const createPeerConnection = useCallback((remoteUserId) => {
    const pc = new RTCPeerConnection({ iceServers });

    // Forward ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        signalClient.sendSignal(roomId, 'ICE_CANDIDATE', event.candidate, remoteUserId);
      }
    };

    // Remote track handling
    const remoteStream = new MediaStream();
    pc.ontrack = (event) => {
      event.streams[0]?.getTracks().forEach((t) => remoteStream.addTrack(t));
      setPeers((prev) => ({
        ...prev,
        [remoteUserId]: { ...prev[remoteUserId], stream: remoteStream },
      }));
    };

    // Add local tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
    }

    peersRef.current[remoteUserId] = { pc, stream: remoteStream };
    setPeers((prev) => ({ ...prev, [remoteUserId]: { pc, stream: remoteStream } }));
    return pc;
  }, [localStream, roomId, signalClient, userId]);

  const makeOfferTo = useCallback(async (remoteUserId) => {
    const pc = peersRef.current[remoteUserId] || createPeerConnection(remoteUserId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    signalClient.sendSignal(roomId, 'OFFER', offer, remoteUserId);
  }, [createPeerConnection, roomId, signalClient]);

  const handleOffer = useCallback(async ({ userId: remoteUserId, data }) => {
    const pc = peersRef.current[remoteUserId] || createPeerConnection(remoteUserId);
    await pc.setRemoteDescription(new RTCSessionDescription(data));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    signalClient.sendSignal(roomId, 'ANSWER', answer, remoteUserId);
  }, [createPeerConnection, roomId, signalClient]);

  const handleAnswer = useCallback(async ({ userId: remoteUserId, data }) => {
    const pc = peersRef.current[remoteUserId];
    if (!pc) return;
    await pc.setRemoteDescription(new RTCSessionDescription(data));
  }, []);

  const handleIce = useCallback(async ({ userId: remoteUserId, data }) => {
    const pc = peersRef.current[remoteUserId];
    if (!pc) return;
    try {
      await pc.addIceCandidate(new RTCIceCandidate(data));
    } catch (e) {
      console.error('Error adding ICE candidate', e);
    }
  }, []);

  // Signaling subscriptions
  useEffect(() => {
    if (!signalClient || !userId || !roomId) return;

    const onRoomMessage = async (msg) => {
      // Ignore messages that are not meant for us when targetUserId is set
      if (msg.targetUserId && msg.targetUserId !== userId) return;
      // Ignore messages we sent
      if (msg.userId && msg.userId === userId) return;

      if (msg.type === 'USER_JOINED') {
        // Proactively create offer to the new user
        await makeOfferTo(msg.userId);
        return;
      }
      if (msg.type === 'USER_LEFT') {
        const rid = msg.userId;
        peersRef.current[rid]?.pc.close();
        delete peersRef.current[rid];
        setPeers((prev) => {
          const p = { ...prev };
          delete p[rid];
          return p;
        });
        return;
      }

      if (msg.type === 'OFFER') await handleOffer(msg);
      else if (msg.type === 'ANSWER') await handleAnswer(msg);
      else if (msg.type === 'ICE_CANDIDATE') await handleIce(msg);
    };

    signalClient.onRoomMessage = onRoomMessage;
  }, [handleAnswer, handleIce, handleOffer, makeOfferTo, roomId, signalClient, userId]);

  const joinRoom = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setJoined(true);

      await signalClient.connect();
      signalClient.subscribeToRoom(roomId);
      signalClient.sendSignal(roomId, 'JOIN_ROOM', {});
    } catch (e) {
      console.error(e);
      setError(e?.message || 'Failed to join room');
    }
  }, [roomId, signalClient]);

  const leaveRoom = useCallback(() => {
    try {
      signalClient?.sendSignal(roomId, 'LEAVE_ROOM', {});
    } catch {}
    Object.values(peersRef.current).forEach(({ pc }) => pc.close());
    peersRef.current = {};
    setPeers({});
    setJoined(false);
    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    signalClient?.disconnect();
  }, [localStream, roomId, signalClient]);

  const toggleAudio = useCallback(() => {
    localStream?.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    localStream?.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
  }, [localStream]);

  const startScreenShare = useCallback(async () => {
    try {
      const display = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = display.getVideoTracks()[0];
      // Replace track in each peer connection
      Object.values(peersRef.current).forEach(({ pc }) => {
        const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
        if (sender) sender.replaceTrack(screenTrack);
      });
      // Replace local stream track for local preview
      const newStream = new MediaStream([
        screenTrack,
        ...localStream.getAudioTracks(),
      ]);
      setLocalStream(newStream);

      screenTrack.onended = () => {
        // revert back to camera
        localStream.getVideoTracks().forEach((camTrack) => {
          Object.values(peersRef.current).forEach(({ pc }) => {
            const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
            if (sender) sender.replaceTrack(camTrack);
          });
        });
        setLocalStream(localStream);
      };
    } catch (e) {
      console.error('Screen share failed', e);
    }
  }, [localStream]);

  const state = useMemo(() => ({
    localStream,
    peers,
    joined,
    error,
    isAudioOn: !!localStream?.getAudioTracks()?.[0]?.enabled,
    isVideoOn: !!localStream?.getVideoTracks()?.[0]?.enabled,
  }), [error, joined, localStream, peers]);

  const actions = useMemo(() => ({
    joinRoom,
    leaveRoom,
    toggleAudio,
    toggleVideo,
    startScreenShare,
  }), [joinRoom, leaveRoom, startScreenShare, toggleAudio, toggleVideo]);

  return { state, actions };
}
