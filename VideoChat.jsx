import React, { useRef, useState, useEffect } from "react";
import Peer from "simple-peer";
import { db } from "../firebase/firebase";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  collection
} from "firebase/firestore";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Phone,
  Settings,
  MoreVertical,
  MessageSquare,
  Users
} from "lucide-react";

function VideoChat() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [peer, setPeer] = useState(null);
  const [callId, setCallId] = useState("");
  const [myMessages, setMyMessages] = useState([]);
  const [peerMessages, setPeerMessages] = useState([]);
  const [currentDetectedSign, setCurrentDetectedSign] = useState("None");
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isInCall, setIsInCall] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const wsRef = useRef(null);
  const streamRef = useRef(null);

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      streamRef.current = stream;
      return stream;
    } catch (err) {
      console.error("Camera error:", err);
      return null;
    }
  };

  // Start call
  const startCall = async () => {
    const stream = await startCamera();
    if (!stream) return;

    const callDoc = doc(collection(db, "calls"));
    setCallId(callDoc.id);

    const newPeer = new Peer({ initiator: true, trickle: false, stream });
    setPeer(newPeer);
    setIsInCall(true);

    newPeer.on("signal", async (data) => {
      await setDoc(callDoc, { offer: JSON.stringify(data) });
    });

    newPeer.on("stream", (remoteStream) => {
      if (remoteVideoRef.current)
        remoteVideoRef.current.srcObject = remoteStream;
    });

    newPeer.on("data", (data) => {
      setPeerMessages((prev) => [...prev, data.toString()]);
    });

    onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (data?.answer) newPeer.signal(JSON.parse(data.answer));
    });
  };

  // Join call
  const joinCall = async () => {
    if (!callId.trim()) return alert("Enter Call ID");

    const stream = await startCamera();
    if (!stream) return;

    const callDoc = doc(db, "calls", callId);
    const callData = (await getDoc(callDoc)).data();

    const newPeer = new Peer({ initiator: false, trickle: false, stream });
    setPeer(newPeer);
    setIsInCall(true);

    newPeer.on("signal", async (data) => {
      await updateDoc(callDoc, { answer: JSON.stringify(data) });
    });

    newPeer.on("stream", (remoteStream) => {
      if (remoteVideoRef.current)
        remoteVideoRef.current.srcObject = remoteStream;
    });

    newPeer.on("data", (data) => {
      setPeerMessages((prev) => [...prev, data.toString()]);
    });

    newPeer.signal(JSON.parse(callData.offer));
  };

  // End call
  const endCall = () => {
    if (peer) peer.destroy();
    if (streamRef.current)
      streamRef.current.getTracks().forEach((t) => t.stop());
    setPeer(null);
    setIsInCall(false);
    setCallId("");
    setCurrentDetectedSign("None");
  };

  // Toggle audio/video
  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);
    }
  };
  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);
    }
  };

  // Send message
  const sendMessage = () => {
    if (newMessage.trim() && peer) {
      peer.send(newMessage);
      setMyMessages((prev) => [...prev, newMessage]);
      setNewMessage("");
    }
  };

  // WebSocket Sign Detection
  useEffect(() => {
    if (!isInCall) return;
    const ws = new WebSocket("ws://localhost:5000");
    wsRef.current = ws;

    ws.onopen = () => console.log("Connected to sign detection server");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.sign) setCurrentDetectedSign(data.sign);
      } catch {}
    };

    const sendFrame = () => {
      if (!localVideoRef.current || ws.readyState !== WebSocket.OPEN) return;
      const video = localVideoRef.current;
      if (!video.videoWidth || !video.videoHeight) return;

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const frame = canvas.toDataURL("image/jpeg", 0.7);
      console.log(frame);
      ws.send(JSON.stringify({ frame: frame.split(",")[1] }));
    };

    const interval = setInterval(sendFrame, 100);
    return () => {
      clearInterval(interval);
      if (ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, [isInCall]);

  return (
    <div style={{ display: "flex", height: "100vh", background: "#111827" }}>
      {/* Video Area */}
      <div style={{ flex: 1, position: "relative", padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, height: "85%" }}>
          {/* Remote */}
          <div style={{ background: "#222", borderRadius: 8, position: "relative" }}>
            <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", bottom: 8, left: 8, color: "#fff" }}>Peer</div>
            {!isInCall && <Users size={64} color="#aaa" style={{ position: "absolute", top: "40%", left: "45%" }} />}
          </div>
          {/* Local */}
          <div style={{ background: "#222", borderRadius: 8, position: "relative" }}>
            <video ref={localVideoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} />
            <div style={{ position: "absolute", bottom: 8, left: 8, color: "#fff" }}>
              You {!isVideoEnabled && "(Camera Off)"}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 12 }}>
          {!isInCall ? (
            <>
              <input type="text" placeholder="Enter Meeting ID" value={callId} onChange={(e) => setCallId(e.target.value)} style={{ padding: 8, borderRadius: 4 }} />
              <button onClick={startCall} style={{ padding: 12, borderRadius: "50%", background: "green", color: "#fff" }}>
                <Phone size={20} />
              </button>
              <button onClick={joinCall} style={{ padding: 12, borderRadius: "50%", background: "blue", color: "#fff" }}>
                <Video size={20} />
              </button>
            </>
          ) : (
            <>
              <button onClick={toggleAudio} style={{ padding: 12, borderRadius: "50%", background: isAudioEnabled ? "#444" : "red", color: "#fff" }}>
                {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              <button onClick={toggleVideo} style={{ padding: 12, borderRadius: "50%", background: isVideoEnabled ? "#444" : "red", color: "#fff" }}>
                {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
              </button>
              <button onClick={() => setShowChat(!showChat)} style={{ padding: 12, borderRadius: "50%", background: "#444", color: "#fff" }}>
                <MessageSquare size={20} />
              </button>
              <button onClick={endCall} style={{ padding: 12, borderRadius: "50%", background: "red", color: "#fff" }}>
                <PhoneOff size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Side Panel */}
      <div style={{ width: 300, background: "#1f2937", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 16, borderBottom: "1px solid #333" }}>
          <h3 style={{ color: "#fff" }}>Sign Detection</h3>
          <div style={{ background: "#111827", border: "1px solid #444", borderRadius: 8, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: "bold", color: "#60a5fa" }}>{currentDetectedSign}</div>
            <div style={{ fontSize: 14, color: "#aaa" }}>{isInCall ? "Live Detection" : "Start a call to begin"}</div>
          </div>
        </div>

        {/* Chat */}
        {showChat && isInCall && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
              {myMessages.map((msg, idx) => (
                <div key={`my-${idx}`} style={{ textAlign: "right", marginBottom: 6 }}>
                  <span style={{ background: "#2563eb", color: "#fff", padding: "8px 12px", borderRadius: 8 }}>{msg}</span>
                </div>
              ))}
              {peerMessages.map((msg, idx) => (
                <div key={`peer-${idx}`} style={{ textAlign: "left", marginBottom: 6 }}>
                  <span style={{ background: "#444", color: "#fff", padding: "8px 12px", borderRadius: 8 }}>{msg}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: 12, borderTop: "1px solid #333", display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder="Type a message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                style={{ flex: 1, padding: 8, borderRadius: 4 }}
              />
              <button onClick={sendMessage} style={{ padding: "8px 12px", background: "#2563eb", color: "#fff", borderRadius: 4 }}>
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoChat;
