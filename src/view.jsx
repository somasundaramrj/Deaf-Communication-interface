import React, { useRef, useEffect, useState } from "react";

const VideoChat = () => {
  const videoRef = useRef(null);
  const [ws, setWs] = useState(null);
  const [sign, setSign] = useState("");
  const [mirror, setMirror] = useState(true); // <-- Mirror toggle

  const sequenceLength = 30;
  const frameBuffer = useRef([]);

  // -------------------- WebSocket Setup --------------------
  useEffect(() => {
    const websocket = new WebSocket("ws://localhost:5000");
    websocket.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.sign) setSign(data.sign);
    };
    setWs(websocket);

    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) videoRef.current.srcObject = stream;
    });

    return () => websocket.close();
  }, []);

  // -------------------- Capture & Send Frames --------------------
  useEffect(() => {
    const interval = setInterval(() => {
      if (!videoRef.current || !ws || ws.readyState !== WebSocket.OPEN) return;

      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");

      // Mirror the video if toggle is ON
      if (mirror) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const frame = canvas.toDataURL("image/jpeg").split(",")[1]; // Base64 only
      frameBuffer.current.push(frame);

      if (frameBuffer.current.length === sequenceLength) {
        ws.send(JSON.stringify({ frames: frameBuffer.current }));
        frameBuffer.current = [];
      }
    }, 10); // Capture every 100ms (~10 fps)

    return () => clearInterval(interval);
  }, [ws, mirror]);

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: "400px",
          transform: mirror ? "scaleX(-1)" : "scaleX(1)", // Mirror the local video
        }}
      />
      <div>
        <button onClick={() => setMirror(!mirror)}>
          {mirror ? "Unmirror" : "Mirror"}
        </button>
      </div>
      <h2>Detected Sign: {sign}</h2>
    </div>
  );
};

export default VideoChat;
