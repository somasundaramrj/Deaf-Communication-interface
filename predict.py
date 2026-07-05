import os
import cv2
import numpy as np
import tensorflow as tf
import mediapipe as mp
from django.http import StreamingHttpResponse, HttpResponse, JsonResponse
from django.shortcuts import render
from django.urls import path
from django.core.management import execute_from_command_line
from django.conf import settings
from django.apps import apps
from django import setup
import json
import threading
import time
# -------------------- Load model and Mediapipe --------------------
model = tf.keras.models.load_model("action.h5")
mp_holistic = mp.solutions.holistic
sequence_length = 30
actions = np.array(['hello', 'thanks', 'iloveyou', 'Yes', 'No', 'Goodbye','Please','Sorry','-'])
sequence_buffer = []

# -------------------- Global state --------------------
app_state = {
    'current_sign': '',
    'confidence': 0.0,
    'is_muted': False,
    'is_video_off': False,
    'last_sign_time': 0,
    'sign_display_duration': 2.0,  # Show sign for 2 seconds after detection
}
state_lock = threading.Lock()

# -------------------- Utility functions --------------------
def mediapipe_detection(image, model_holistic):
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image_rgb.flags.writeable = False
    results = model_holistic.process(image_rgb)
    image_rgb.flags.writeable = True
    return results

def extract_keypoints(results):
    pose = np.array([[res.x, res.y, res.z, res.visibility] 
                     for res in results.pose_landmarks.landmark]).flatten() if results.pose_landmarks else np.zeros(33*4)
    lh = np.array([[res.x, res.y, res.z] 
                   for res in results.left_hand_landmarks.landmark]).flatten() if results.left_hand_landmarks else np.zeros(21*3)
    rh = np.array([[res.x, res.y, res.z] 
                   for res in results.right_hand_landmarks.landmark]).flatten() if results.right_hand_landmarks else np.zeros(21*3)
    return np.concatenate([pose, lh, rh])

# -------------------- Video generator --------------------
def gen_frames():
    global sequence_buffer
    cap = cv2.VideoCapture(0)
    with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
        while True:
            success, frame = cap.read()
            if not success:
                break
            
            if app_state['is_video_off']:
                # Show black screen with icon
                frame = np.zeros_like(frame)
                h, w = frame.shape[:2]
                cv2.putText(frame, "Camera Off", (w//2 - 100, h//2),
                           cv2.FONT_HERSHEY_SIMPLEX, 1.5, (255, 255, 255), 2, cv2.LINE_AA)
                # Clear sequence buffer when camera is off
                sequence_buffer = []
            else:
                frame = cv2.flip(frame, 1)  # Mirror

                results = mediapipe_detection(frame, holistic)
                keypoints = extract_keypoints(results)
                sequence_buffer.append(keypoints)
                if len(sequence_buffer) > sequence_length:
                    sequence_buffer.pop(0)

                if len(sequence_buffer) == sequence_length:
                    res = model.predict(np.expand_dims(sequence_buffer, axis=0), verbose=0)[0]
                    confidence = float(res[np.argmax(res)])
                    
                    if confidence > 0.8:
                        sign = actions[np.argmax(res)]
                        
                        with state_lock:
                            if sign != '-':
                                app_state['current_sign'] = sign
                                app_state['confidence'] = confidence
                                app_state['last_sign_time'] = time.time()

            ret, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

# -------------------- Django views --------------------
def index(request):
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Video Call - Sign Language Recognition</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: #1a1a1a;
                overflow: hidden;
                height: 100vh;
            }
            
            .video-container {
                width: 100%;
                height: 100vh;
                display: flex;
                background: #202124;
                position: relative;
            }
            
            .main-video-area {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                position: relative;
            }
            
            .video-wrapper {
                width: 100%;
                max-width: 1200px;
                max-height: 90vh;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                position: relative;
                background: #000;
            }
            
            #video-feed {
                width: 100%;
                height: 100%;
                display: block;
                object-fit: cover;
            }
            
            .video-label {
                position: absolute;
                bottom: 16px;
                left: 16px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .mic-indicator {
                width: 8px;
                height: 8px;
                background: #34a853;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }
            
            .mic-indicator.muted {
                background: #ea4335;
                animation: none;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            /* Camera Status Badge */
            .camera-status {
                position: absolute;
                top: 16px;
                right: 16px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .camera-indicator {
                width: 8px;
                height: 8px;
                background: #34a853;
                border-radius: 50%;
            }
            
            .camera-indicator.off {
                background: #ea4335;
            }
            
            /* Sign Recognition Panel */
            .sign-panel {
                width: 320px;
                background: #292a2d;
                display: flex;
                flex-direction: column;
                border-left: 1px solid #3c4043;
            }
            
            .sign-panel-header {
                padding: 20px;
                border-bottom: 1px solid #3c4043;
            }
            
            .sign-panel-header h2 {
                color: #e8eaed;
                font-size: 18px;
                font-weight: 500;
                margin: 0;
            }
            
            .sign-display {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px 20px;
                transition: opacity 0.3s;
            }
            
            .sign-display.fade-out {
                opacity: 0.3;
            }
            
            .sign-icon {
                width: 120px;
                height: 120px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 24px;
                font-size: 60px;
                animation: scaleIn 0.3s;
            }
            
            @keyframes scaleIn {
                from { transform: scale(0.8); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            
            .sign-text {
                color: #e8eaed;
                font-size: 32px;
                font-weight: 600;
                margin-bottom: 12px;
                text-align: center;
                animation: fadeIn 0.3s;
            }
            
            .sign-confidence {
                color: #9aa0a6;
                font-size: 14px;
            }
            
            .no-sign {
                color: #9aa0a6;
                font-size: 16px;
                text-align: center;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            /* Sign History */
            .sign-history {
                padding: 20px;
                border-top: 1px solid #3c4043;
                max-height: 200px;
                overflow-y: auto;
            }
            
            .sign-history h3 {
                color: #e8eaed;
                font-size: 14px;
                font-weight: 500;
                margin-bottom: 12px;
            }
            
            .history-item {
                background: rgba(255, 255, 255, 0.05);
                padding: 8px 12px;
                border-radius: 6px;
                margin-bottom: 8px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                animation: slideIn 0.3s;
            }
            
            @keyframes slideIn {
                from { transform: translateX(-20px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .history-sign {
                color: #e8eaed;
                font-size: 14px;
            }
            
            .history-time {
                color: #9aa0a6;
                font-size: 12px;
            }
            
            /* Control Bar */
            .control-bar {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 80px;
                background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 16px;
                padding: 0 20px;
                z-index: 10;
            }
            
            .control-btn {
                width: 56px;
                height: 56px;
                border-radius: 50%;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                transition: all 0.2s;
                background: rgba(60, 64, 67, 0.9);
                color: white;
                position: relative;
            }
            
            .control-btn:hover {
                background: rgba(80, 84, 87, 0.9);
                transform: scale(1.1);
            }
            
            .control-btn.active {
                background: #ea4335;
            }
            
            .control-btn.end-call {
                background: #ea4335;
                width: 64px;
                height: 64px;
            }
            
            .control-btn.end-call:hover {
                background: #c5372c;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .video-container {
                    flex-direction: column;
                }
                
                .sign-panel {
                    width: 100%;
                    height: 250px;
                    border-left: none;
                    border-top: 1px solid #3c4043;
                }
                
                .sign-display {
                    flex-direction: row;
                    padding: 20px;
                }
                
                .sign-icon {
                    width: 80px;
                    height: 80px;
                    font-size: 40px;
                    margin-bottom: 0;
                    margin-right: 20px;
                }
                
                .sign-text {
                    font-size: 24px;
                }
            }
            
            .tooltip {
                position: absolute;
                bottom: 70px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                white-space: nowrap;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s;
            }
            
            .control-btn:hover .tooltip {
                opacity: 1;
            }
        </style>
    </head>
    <body>
        <div class="video-container">
            <div class="main-video-area">
                <div class="video-wrapper">
                    <img id="video-feed" src="/video_feed" alt="Video Feed">
                    <div class="video-label">
                        <div class="mic-indicator" id="mic-indicator"></div>
                        <span>You</span>
                    </div>
                    <div class="camera-status">
                        <div class="camera-indicator" id="camera-indicator"></div>
                        <span id="camera-status-text">Camera On</span>
                    </div>
                </div>
                
                <div class="control-bar">
                    <button class="control-btn" id="mic-btn" onclick="toggleMic()">
                        <span id="mic-icon">🎤</span>
                        <div class="tooltip">Mute</div>
                    </button>
                    
                    <button class="control-btn" id="video-btn" onclick="toggleVideo()">
                        <span id="video-icon">📹</span>
                        <div class="tooltip">Stop video</div>
                    </button>
                    
                    <button class="control-btn end-call" onclick="endCall()">
                        <span>📞</span>
                        <div class="tooltip">End call</div>
                    </button>
                    
                    <button class="control-btn" onclick="toggleFullscreen()">
                        <span>⛶</span>
                        <div class="tooltip">Fullscreen</div>
                    </button>
                </div>
            </div>
            
            <div class="sign-panel">
                <div class="sign-panel-header">
                    <h2>🤟 Sign Recognition</h2>
                </div>
                <div class="sign-display" id="sign-display">
                    <p class="no-sign">Waiting for sign...</p>
                </div>
                <div class="sign-history" id="sign-history">
                    <h3>Recent Signs</h3>
                    <div id="history-list"></div>
                </div>
            </div>
        </div>
        
        <script>
            let isMuted = false;
            let isVideoOff = false;
            let signHistory = [];
            let lastSignText = '';
            
            const signEmojis = {
                'hello': '👋',
                'thanks': '🙏',
                'iloveyou': '❤️',
                'Yes': '✅',
                'No': '❌',
                'Goodbye': '👋',
                'Please': '🙏',
                'Sorry': '😔'
            };
            
            function updateSignDisplay() {
                fetch('/api/current_sign')
                    .then(response => response.json())
                    .then(data => {
                        const signDisplay = document.getElementById('sign-display');
                        
                        if (data.current_sign && data.current_sign !== '-') {
                            const emoji = signEmojis[data.current_sign] || '✋';
                            signDisplay.innerHTML = `
                                <div class="sign-icon">${emoji}</div>
                                <div>
                                    <div class="sign-text">${data.current_sign}</div>
                                    <div class="sign-confidence">Confidence: ${(data.confidence * 100).toFixed(0)}%</div>
                                </div>
                            `;
                            signDisplay.classList.remove('fade-out');
                            
                            // Add to history if it's a new sign
                            if (data.current_sign !== lastSignText) {
                                addToHistory(data.current_sign, emoji);
                                lastSignText = data.current_sign;
                            }
                            
                            // Auto-clear after detection period
                            setTimeout(() => {
                                signDisplay.classList.add('fade-out');
                            }, 1500);
                        } else if (data.expired) {
                            // Show waiting message when sign expires
                            signDisplay.innerHTML = '<p class="no-sign">Waiting for sign...</p>';
                            signDisplay.classList.remove('fade-out');
                            lastSignText = '';
                        }
                    });
            }
            
            function addToHistory(sign, emoji) {
                const now = new Date();
                const timeStr = now.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                });
                
                signHistory.unshift({ sign, emoji, time: timeStr });
                if (signHistory.length > 10) {
                    signHistory.pop();
                }
                
                updateHistoryDisplay();
            }
            
            function updateHistoryDisplay() {
                const historyList = document.getElementById('history-list');
                historyList.innerHTML = signHistory.map(item => `
                    <div class="history-item">
                        <span class="history-sign">${item.emoji} ${item.sign}</span>
                        <span class="history-time">${item.time}</span>
                    </div>
                `).join('');
            }
            
            function toggleMic() {
                isMuted = !isMuted;
                const micBtn = document.getElementById('mic-btn');
                const micIcon = document.getElementById('mic-icon');
                const micIndicator = document.getElementById('mic-indicator');
                const tooltip = micBtn.querySelector('.tooltip');
                
                if (isMuted) {
                    micBtn.classList.add('active');
                    micIcon.textContent = '🔇';
                    micIndicator.classList.add('muted');
                    tooltip.textContent = 'Unmute';
                } else {
                    micBtn.classList.remove('active');
                    micIcon.textContent = '🎤';
                    micIndicator.classList.remove('muted');
                    tooltip.textContent = 'Mute';
                }
                
                fetch('/api/toggle_mic', { method: 'POST' });
            }
            
            function toggleVideo() {
                isVideoOff = !isVideoOff;
                const videoBtn = document.getElementById('video-btn');
                const videoIcon = document.getElementById('video-icon');
                const cameraIndicator = document.getElementById('camera-indicator');
                const cameraStatusText = document.getElementById('camera-status-text');
                const tooltip = videoBtn.querySelector('.tooltip');
                
                if (isVideoOff) {
                    videoBtn.classList.add('active');
                    videoIcon.textContent = '🚫';
                    cameraIndicator.classList.add('off');
                    cameraStatusText.textContent = 'Camera Off';
                    tooltip.textContent = 'Start video';
                } else {
                    videoBtn.classList.remove('active');
                    videoIcon.textContent = '📹';
                    cameraIndicator.classList.remove('off');
                    cameraStatusText.textContent = 'Camera On';
                    tooltip.textContent = 'Stop video';
                }
                
                fetch('/api/toggle_video', { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ video_off: isVideoOff })
                });
            }
            
            function endCall() {
                if (confirm('End the call?')) {
                    window.close();
                }
            }
            
            function toggleFullscreen() {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
            }
            
            // Update sign display every 300ms for smoother updates
            setInterval(updateSignDisplay, 300);
            
            // Initial load
            updateSignDisplay();
        </script>
    </body>
    </html>
    """
    return HttpResponse(html)

def video_feed(request):
    return StreamingHttpResponse(gen_frames(), content_type='multipart/x-mixed-replace; boundary=frame')

def api_current_sign(request):
    with state_lock:
        current_time = time.time()
        time_since_last_sign = current_time - app_state['last_sign_time']
        
        # Auto-clear sign after display duration
        if time_since_last_sign > app_state['sign_display_duration']:
            return JsonResponse({
                'current_sign': '',
                'confidence': 0.0,
                'expired': True
            })
        
        return JsonResponse({
            'current_sign': app_state['current_sign'],
            'confidence': app_state['confidence'],
            'expired': False
        })

def api_toggle_mic(request):
    if request.method == 'POST':
        app_state['is_muted'] = not app_state['is_muted']
        return JsonResponse({'muted': app_state['is_muted']})
    return JsonResponse({'error': 'Invalid method'}, status=400)

def api_toggle_video(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        app_state['is_video_off'] = data.get('video_off', False)
        
        # Clear sign when camera is turned off
        if app_state['is_video_off']:
            with state_lock:
                app_state['current_sign'] = ''
                app_state['confidence'] = 0.0
                app_state['last_sign_time'] = 0
        
        return JsonResponse({'video_off': app_state['is_video_off']})
    return JsonResponse({'error': 'Invalid method'}, status=400)

# -------------------- Django URL patterns --------------------
urlpatterns = [
    path("", index),
    path("video_feed", video_feed),
    path("api/current_sign", api_current_sign),
    path("api/toggle_mic", api_toggle_mic),
    path("api/toggle_video", api_toggle_video),
]

# -------------------- Run server --------------------
if __name__ == "__main__":
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', '__main__')
    execute_from_command_line(["manage.py", "runserver", "127.0.0.1:9000"])
