# YOLO Analyser Backend Setup

This backend handles the YOLOv8 vehicle detection and provides a live MJPEG stream to the frontend.

## Prerequisites
- Python 3.8+
- (Optional) NVIDIA GPU with CUDA for faster processing

## Installation

1. Open a terminal in the project root.
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
   *Note: On Windows, use `pip install -r requirements.txt`*

## Running the Backend

Start the FastAPI server:
```bash
python main.py
```
The server will run at `http://localhost:8000`.

## Adding Your Own Videos
Place your video files (`.mp4`, `.avi`, etc.) in the `public/videos/` directory. They will automatically appear in the **Video Stacks** section on the Analyser page.
