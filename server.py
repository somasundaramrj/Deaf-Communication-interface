import asyncio
import websockets
import json
import base64
import cv2
import numpy as np
import tensorflow as tf
import mediapipe as mp

model = tf.keras.models.load_model("action.h5")
mp_holistic = mp.solutions.holistic

actions = np.array(['hello', 'thanks', 'iloveyou', 'Yes', 'No', 'Goodbye','Please','Sorry','-'])
sequence_length = 30
sequence_buffer = []

def decode_image(base64_str):
    img_bytes = base64.b64decode(base64_str)
    img_array = np.frombuffer(img_bytes, np.uint8)
    return cv2.imdecode(img_array, cv2.IMREAD_COLOR)

async def handler(websocket, path):
    with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
        async for message in websocket:
            data = json.loads(message)
            frame_b64 = data.get("frame")
            if not frame_b64:
                continue
            image = decode_image(frame_b64)
            image = cv2.flip(image, 1)
            # Detection and keypoint extraction
            results = holistic.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
            pose = np.array([[res.x, res.y, res.z, res.visibility] 
                            for res in results.pose_landmarks.landmark]).flatten() if results.pose_landmarks else np.zeros(33*4)
            lh = np.array([[res.x, res.y, res.z] 
                            for res in results.left_hand_landmarks.landmark]).flatten() if results.left_hand_landmarks else np.zeros(21*3)
            rh = np.array([[res.x, res.y, res.z] 
                            for res in results.right_hand_landmarks.landmark]).flatten() if results.right_hand_landmarks else np.zeros(21*3)
            keypoints = np.concatenate([pose, lh, rh])
            # Maintain buffer
            sequence_buffer.append(keypoints)
            if len(sequence_buffer) > sequence_length:
                sequence_buffer.pop(0)
            sign = ""
            if len(sequence_buffer) == sequence_length:
                res = model.predict(np.expand_dims(sequence_buffer, axis=0), verbose=0)[0]
                if res[np.argmax(res)] > 0.8:
                    sign = actions[np.argmax(res)]
            if sign:
                await websocket.send(json.dumps({"sign": sign}))
            else:
                await websocket.send(json.dumps({"sign": ""}))

# Run server
start_server = websockets.serve(handler, "localhost", 5001)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
