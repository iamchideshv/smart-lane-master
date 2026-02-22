import cv2
import torch
from ultralytics import YOLO
from fastapi import FastAPI, Response
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import time

# -----------------------------
# Configuration
# -----------------------------
app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLOv8 model (Switching to Nano for real-time performance)
model = YOLO("yolov8n.pt")
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

vehicle_classes = ["car", "motorcycle", "bus", "truck"]
VIDEO_DIR = os.path.join(os.getcwd(), "..", "public", "videos")

# -----------------------------
# Detection Logic
# -----------------------------
def detect_and_count(frame):
    # Resize for faster processing (640 is standard for YOLOv8n)
    frame_resized = cv2.resize(frame, (640, 480))

    results = model.track(
        frame_resized,
        persist=True,
        conf=0.25,
        iou=0.45,
        imgsz=640,
        verbose=False
    )

    active_ids = {
        "car": set(),
        "motorcycle": set(),
        "truck": set(),
        "bus": set()
    }

    for r in results:
        if r.boxes.id is None:
            continue

        for box in r.boxes:
            cls_id = int(box.cls[0])
            class_name = model.names[cls_id]

            if class_name in vehicle_classes:
                track_id = int(box.id[0])
                active_ids[class_name].add(track_id)

                x1, y1, x2, y2 = map(int, box.xyxy[0])

                # Draw bounding box
                cv2.rectangle(frame_resized, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame_resized, f"{class_name} {track_id}", (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

    counts = {
        "bikes": len(active_ids["motorcycle"]),
        "cars": len(active_ids["car"]),
        "trucks": len(active_ids["truck"]),
        "buses": len(active_ids["bus"]),
        "total": sum(len(ids) for ids in active_ids.values())
    }

    # Add overlay text
    y0, dy = 40, 40
    for i, (label, count) in enumerate(counts.items()):
        color = (255, 255, 255) if label == "total" else (0, 255, 0)
        cv2.putText(frame_resized, f"{label.upper()}: {count}", (20, y0 + i*dy),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)

    return frame_resized, counts

# -----------------------------
# Generator for Streaming
# -----------------------------
def gen_frames(source=0):
    cap = cv2.VideoCapture(source)
    frame_count = 0
    while True:
        success, frame = cap.read()
        if not success:
            if isinstance(source, str): # Loop video if it's a file
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                continue
            else:
                break
        
        frame_count += 1
        # Process every 2nd frame for maximum speed
        if frame_count % 2 == 0:
            processed_frame, counts = detect_and_count(frame)
            
            # Encode as JPG
            ret, buffer = cv2.imencode('.jpg', processed_frame)
            frame_bytes = buffer.tobytes()
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

# -----------------------------
# Endpoints
# -----------------------------
@app.get("/video_feed")
async def video_feed(source: str = "webcam"):
    """
    Streaming endpoint. 'source' can be 'webcam' or a filename in public/videos.
    """
    if source == "webcam":
        return StreamingResponse(gen_frames(0), media_type="multipart/x-mixed-replace; boundary=frame")
    else:
        video_path = os.path.join(VIDEO_DIR, source)
        if os.path.exists(video_path):
            return StreamingResponse(gen_frames(video_path), media_type="multipart/x-mixed-replace; boundary=frame")
        return Response(content="Video not found", status_code=404)

@app.get("/videos")
async def list_videos():
    """
    Lists available videos in public/videos.
    """
    if not os.path.exists(VIDEO_DIR):
        return []
    return [f for f in os.listdir(VIDEO_DIR) if f.lower().endswith(('.mp4', '.avi', '.mov'))]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
