import cv2
import insightface
from insightface.app import FaceAnalysis
import requests
import logging
import os 

# Configuration
API_ENDPOINT = "http://localhost:8000/match_face/"
CAMERA_INDEX = 0 

# Get the absolute path to the directory containing facecap.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Define model root where 'buffalo_l' folder is located
MODEL_ROOT = os.path.join(BASE_DIR, "backend", "models", "models")

# Optional: full path to a specific .onnx file if needed later
MODEL_PATH = os.path.join(MODEL_ROOT, "buffalo_l", "det_10g.onnx")


# Setup logging
logging.basicConfig(level=logging.INFO, format='[%(levelname)s] %(message)s')


# Initialize the model with the already downloaded files
logging.info(f"📁 Using model directory: {MODEL_ROOT}")
app = FaceAnalysis(name='buffalo_l', root=MODEL_ROOT,providers=['CPUExecutionProvider'])  
app.prepare(ctx_id=-1)

# Open webcam
cap = cv2.VideoCapture(CAMERA_INDEX)
if not cap.isOpened():
    logging.error("Failed to access the webcam.")
    exit(1)

logging.info("Face capture started. Press 'q' to quit.")

try:
    while True:
        ret, frame = cap.read()
        if not ret:
            logging.warning("Unable to read from webcam.")
            break

        faces = app.get(frame)  # Detect and align faces

        if faces:
           # Instead of cropping, encode the entire frame
            _, img_encoded = cv2.imencode('.jpg', frame)

            try:
                # Send the face to your API every time
                response = requests.post(
                    API_ENDPOINT,
                    files={'file': ('face.jpg', img_encoded.tobytes(), 'image/jpeg')}
                )
                data = response.json()
                if response.status_code == 200 and data.get("status") == "matched":
                    name = data.get('name')
                    medical_id = data.get('medical_id')
                    logging.info(f"Matched: {name} | Medical ID: {medical_id}")
                else:
                    logging.info("No face match found.")
            except Exception as e:
                logging.error(f"Error sending request: {e}")

              # Draw bounding boxes on all faces
            for face in faces:
                x1, y1, x2, y2 = map(int, face.bbox)
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

        # Display the frame
        cv2.imshow("InsightFace Detection", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

except KeyboardInterrupt:
    logging.info("Stopped by user.")

finally:
    cap.release()
    cv2.destroyAllWindows()
    logging.info("Camera released. Application terminated.")
