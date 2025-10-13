import os
import cv2
import numpy as np
import mediapipe as mp

# === Parameters ===
DATA_PATH = os.path.join('MP_Data')
actions = np.array(['hello', 'thanks', 'iloveyou', 'Yes', 'No', 'Goodbye','Please','Sorry','-'])
additional_sequences = 30
sequence_length = 30

mp_holistic = mp.solutions.holistic
mp_drawing = mp.solutions.drawing_utils

def mediapipe_detection(image, model):
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image_rgb.flags.writeable = False
    results = model.process(image_rgb)
    image_rgb.flags.writeable = True
    return results

def draw_body_hand_landmarks(image, results):
    """Draw only pose (arms/torso) and hands, exclude face."""
    # Pose (torso and arms)
    if results.pose_landmarks:
        for lm in results.pose_landmarks.landmark:
            x, y = int(lm.x * image.shape[1]), int(lm.y * image.shape[0])
            cv2.circle(image, (x, y), 4, (0, 255, 0), -1)
        mp_drawing.draw_landmarks(
            image, results.pose_landmarks, mp.solutions.pose.POSE_CONNECTIONS,
            mp_drawing.DrawingSpec(color=(0,255,0), thickness=2, circle_radius=2),
            mp_drawing.DrawingSpec(color=(0,128,0), thickness=2, circle_radius=1)
        )
    # Left hand
    if results.left_hand_landmarks:
        for lm in results.left_hand_landmarks.landmark:
            x, y = int(lm.x * image.shape[1]), int(lm.y * image.shape[0])
            cv2.circle(image, (x, y), 4, (255,0,0), -1)
        mp_drawing.draw_landmarks(
            image, results.left_hand_landmarks, mp_holistic.HAND_CONNECTIONS
        )
    # Right hand
    if results.right_hand_landmarks:
        for lm in results.right_hand_landmarks.landmark:
            x, y = int(lm.x * image.shape[1]), int(lm.y * image.shape[0])
            cv2.circle(image, (x, y), 4, (0,0,255), -1)
        mp_drawing.draw_landmarks(
            image, results.right_hand_landmarks, mp_holistic.HAND_CONNECTIONS
        )

def extract_body_hand_keypoints(results):
    """Extract only body (pose) + left/right hand keypoints, ignore face"""
    pose = np.array([[lm.x, lm.y, lm.z, lm.visibility] for lm in results.pose_landmarks.landmark]).flatten() if results.pose_landmarks else np.zeros(33*4)
    lh = np.array([[lm.x, lm.y, lm.z] for lm in results.left_hand_landmarks.landmark]).flatten() if results.left_hand_landmarks else np.zeros(21*3)
    rh = np.array([[lm.x, lm.y, lm.z] for lm in results.right_hand_landmarks.landmark]).flatten() if results.right_hand_landmarks else np.zeros(21*3)
    return np.concatenate([pose, lh, rh])

# ===== Collection =====
for action in actions:
    action_path = os.path.join(DATA_PATH, action)
    os.makedirs(action_path, exist_ok=True)
    existing = [int(seq) for seq in os.listdir(action_path) if seq.isdigit()]
    next_seq = max(existing)+1 if existing else 0
    print(f"Starting for '{action}'. Next sequence is: {next_seq}")

    cap = cv2.VideoCapture(0)
    with mp_holistic.Holistic(min_detection_confidence=0.7, min_tracking_confidence=0.7) as holistic:
        for sequence in range(next_seq, next_seq + additional_sequences):
            for frame_num in range(sequence_length):
                ret, frame = cap.read()
                if not ret:
                    continue
                frame = cv2.flip(frame, 1)  # mirror
                results = mediapipe_detection(frame, holistic)

                draw_body_hand_landmarks(frame, results)

                # Show instructions
                if frame_num == 0:
                    cv2.putText(frame, f'Starting {action} Video #{sequence}', (10,50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,0), 2)
                    cv2.imshow('Hand+Body', frame)
                    cv2.waitKey(2000)
                else:
                    cv2.putText(frame, f'{action} Video #{sequence}', (10,50), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,255,0), 2)
                    cv2.imshow('Hand+Body', frame)

                # Save keypoints only
                keypoints = extract_body_hand_keypoints(results)
                seq_path = os.path.join(action_path, str(sequence))
                os.makedirs(seq_path, exist_ok=True)
                np.save(os.path.join(seq_path, f"{frame_num}.npy"), keypoints)

                if cv2.waitKey(10) & 0xFF == ord('q'):
                    break

    cap.release()
    cv2.destroyAllWindows()

print("DONE: Captured body + hand landmarks only, no face.")
