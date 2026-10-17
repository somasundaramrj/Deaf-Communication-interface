# GestureBridge – AI-Powered Sign Language Communication Platform

## 1. Project Overview

GestureBridge is an AI-powered sign language communication and learning platform designed to help deaf and hearing individuals communicate more effectively. The application uses computer vision and deep learning to recognize sign language gestures and convert them into text.

The platform also provides a learning environment where users can explore sign language educational videos, upload learning resources, and practice commonly used gestures. Its goal is to make sign language learning more accessible and improve communication through technology.

## 2. Objectives

- Recognize sign language gestures using a webcam.
- Convert recognized gestures into readable text.
- Provide an interactive platform for learning sign language.
- Allow users to browse, search, and upload educational videos.
- Provide user authentication and personalized access to application features.
- Integrate computer vision and deep learning into an accessible communication interface.

## 3. Key Features

### Real-Time Sign Language Recognition
- Captures video input using a webcam.
- Extracts body, hand, and facial landmarks using MediaPipe Holistic.
- Processes landmark sequences using a trained LSTM model.
- Displays the predicted sign as text.

### Sign Language Learning Portal
- Browse educational sign language videos.
- Upload learning videos and resources.
- Search and filter available learning content.
- Practice commonly used sign language gestures.

### User Authentication
- User registration and login.
- Authenticated access to application features.
- User-specific interfaces and dashboards.

### Interactive User Interface
- React-based frontend.
- Responsive layouts using Tailwind CSS.
- Dedicated sections for communication, learning, and video content.

## 4. Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React.js, Vite, Tailwind CSS |
| Backend | Python, Flask |
| Computer Vision | OpenCV, MediaPipe Holistic |
| Deep Learning | TensorFlow, Keras, LSTM |
| Database | MongoDB |
| Communication | REST APIs, WebSockets where configured |
| Model Format | HDF5 (`action.h5`) |

## 5. System Architecture

The application follows a frontend-backend architecture with a separate machine learning inference pipeline.

```text
                User
                  |
                  v
       React Frontend (Vite)
                  |
          +-------+--------+
          |                |
          v                v
    Flask REST API     Webcam Input
          |                |
          v                v
       MongoDB       OpenCV Processing
                           |
                           v
                  MediaPipe Holistic
                           |
                           v
                  Landmark Extraction
                           |
                           v
                    30-Frame Sequence
                           |
                           v
                     LSTM Model
                       action.h5
                           |
                           v
                  Gesture Prediction
                           |
                           v
                    Text Output
```

The Flask backend handles application requests and database operations. The recognition pipeline processes webcam frames, extracts landmarks, and uses the trained LSTM model to classify gesture sequences.

## 6. Sign Language Recognition Workflow

1. The user opens the sign recognition interface.
2. The webcam captures the user's gestures.
3. OpenCV processes the incoming video frames.
4. MediaPipe Holistic extracts relevant body, hand, and facial landmarks.
5. The system collects a sequence of 30 frames.
6. The trained LSTM model processes the sequence and predicts the gesture.
7. The predicted gesture is displayed as text in the interface.

### Supported Gesture Classes

The model's configured action classes include:

- Hello
- Thanks
- I Love You
- Yes
- No
- Goodbye
- Please
- Sorry

The available predictions depend on the gesture classes used to train the model.

## 7. Project Structure

An example organized project structure is shown below. Adjust the paths to match the actual files in your repository.

```text
Deaf-Communication-interface/
|
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |-- package.json
|   |-- index.html
|
|-- backend/
|   |-- app.py
|   |-- requirements.txt
|   |-- models/
|   |   |-- action.h5
|   |-- routes/
|   |-- services/
|
|-- README.md
|-- .gitignore
```

## 8. Installation and Setup

### Prerequisites

- Python 3.10 or another version compatible with the project's ML dependencies.
- Node.js and npm.
- MongoDB.
- A webcam for real-time gesture recognition.

### Step 1: Clone the Repository

```bash
git clone https://github.com/somasundaramrj/Deaf-Communication-interface.git
cd Deaf-Communication-interface
```

### Step 2: Set Up the Frontend

Navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your terminal.

### Step 3: Set Up the Backend

Open another terminal and navigate to the backend directory:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

Configure the MongoDB connection and other required environment variables according to your backend configuration.

Start the Flask application:

```bash
python app.py
```

The frontend and backend must be running, and the required model file must be available, for the corresponding recognition features to work.

## 9. Machine Learning Model

GestureBridge uses a Long Short-Term Memory (LSTM) neural network to classify sequences of extracted landmarks.

LSTM is suitable for sequential data because it can learn temporal patterns across multiple frames. This helps the model distinguish gestures based on how body and hand positions change over time rather than relying on a single frame.

The inference pipeline uses:

- **Input:** A sequence of 30 frames containing extracted landmark features.
- **Feature extraction:** MediaPipe Holistic.
- **Sequence classification:** TensorFlow/Keras LSTM model.
- **Model file:** `action.h5`.
- **Output:** The predicted gesture class, displayed as text.

The model must be trained with the same feature format and sequence dimensions expected by the inference pipeline.

## 10. Applications

- Assistive communication interfaces.
- Sign language learning platforms.
- Educational accessibility tools.
- Gesture-based human-computer interaction.
- Computer vision and deep learning applications.

## 11. Future Enhancements

- Expand the gesture vocabulary.
- Improve recognition accuracy under different lighting conditions.
- Support continuous gesture recognition and sentence formation.
- Add speech output for recognized text.
- Improve support for different sign languages.
- Optimize inference for lower-latency operation.

## 12. Limitations

- Recognition is limited to the gesture classes supported by the trained model.
- Prediction quality depends on training data, camera quality, lighting, and landmark extraction.
- Continuous sentence-level translation requires additional modeling and language-processing capabilities.
- Webcam access requires appropriate browser permissions.

## 13. Repository

GitHub: https://github.com/somasundaramrj/Deaf-Communication-interface

## 14. Conclusion

GestureBridge combines computer vision, deep learning, and web development to create an interactive sign language communication and learning platform. By integrating real-time gesture recognition with educational resources, the project explores how AI can support accessibility and make communication technologies more inclusive.
