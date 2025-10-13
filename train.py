import os
import numpy as np
from sklearn.model_selection import train_test_split
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, BatchNormalization
from tensorflow.keras.callbacks import TensorBoard, EarlyStopping, ReduceLROnPlateau

# ==== Parameters ====
DATA_PATH = os.path.join('MP_Data')
actions = np.array(['hello', 'thanks', 'iloveyou', 'Yes', 'No', 'Goodbye', 'Please', 'Sorry', '-'])
no_sequences = 30        # Number of videos per gesture
sequence_length = 30     # Number of frames per video
feature_length = 258     # pose(132) + left hand(63) + right hand(63)

# ==== Prepare Data ====
label_map = {label: num for num, label in enumerate(actions)}
sequences, labels = [], []

print("🔹 Loading dataset...")
for action in actions:
    for sequence in range(no_sequences):
        window = []
        for frame_num in range(sequence_length):
            npy_path = os.path.join(DATA_PATH, action, str(sequence), f"{frame_num}.npy")
            res = np.load(npy_path)
            window.append(res)
        sequences.append(window)
        labels.append(label_map[action])

X = np.array(sequences)
y = to_categorical(labels).astype(int)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.05, random_state=42)
print(f"✅ Dataset loaded. Train shape: {X_train.shape}, Test shape: {X_test.shape}")

# ==== Build LSTM Model ====
model = Sequential()
model.add(LSTM(64, return_sequences=True, activation='tanh', input_shape=(sequence_length, feature_length)))
model.add(Dropout(0.3))
model.add(BatchNormalization())

model.add(LSTM(64, return_sequences=False, activation='tanh'))
model.add(Dropout(0.3))
model.add(BatchNormalization())

model.add(Dense(64, activation='relu'))
model.add(Dropout(0.3))
model.add(Dense(32, activation='relu'))

model.add(Dense(actions.shape[0], activation='softmax'))

# ==== Compile Model ====
model.compile(optimizer='Adam', loss='categorical_crossentropy', metrics=['categorical_accuracy'])
print("✅ Model compiled.")

# ==== Callbacks ====
log_dir = os.path.join('Logs')
os.makedirs(log_dir, exist_ok=True)
tb_callback = TensorBoard(log_dir=log_dir)
early_stop = EarlyStopping(monitor='val_loss', patience=30, restore_best_weights=True)
lr_reduction = ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=15, min_lr=1e-5)

# ==== Train Model ====
history = model.fit(
    X_train, y_train,
    validation_data=(X_test, y_test),
    epochs=200,
    batch_size=16,
    callbacks=[tb_callback, early_stop, lr_reduction],
    verbose=1
)

# ==== Save Model ====
model.save('action.h5')
print("✅ Model training complete and saved as 'action.h5'.")
