import json
import requests
import time

# === Configuration ===
API_URL = "http://localhost:3000/api/addJob"  # Replace with your actual API endpoint
BEARER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NjM2YjNmZjhmNzY0YjE1Mzk2YTMxNSIsImVtYWlsIjoidGVzdGVtcGxveWVyMUBlbWFpbC5jb20iLCJyb2xlIjoiZW1wbG95ZXIiLCJpYXQiOjE3NTI1NTY5NjYsImV4cCI6MTc1MjU2MDU2Nn0.N0-wXSi4-qcoi8seC9xfTZWqEshRAl-7PntBOvhAEC0"  # Replace with your real token
JSON_FILE_PATH = "jobs.json"  # Ensure this file contains the job array

# === Load JSON Data ===
with open(JSON_FILE_PATH, "r") as file:
    job_data = json.load(file)

# === Set Headers ===
headers = {
    "Authorization": f"Bearer {BEARER_TOKEN}",
    "Content-Type": "application/json",
}

# === POST Each Job ===
for index, job in enumerate(job_data, start=1):
    try:
        response = requests.post(API_URL, headers=headers, json=job)
        print(
            f"[{index}] Status: {response.status_code} - {response.json().get('message', 'No message')}"
        )
    except Exception as e:
        print(f"[{index}] Failed to post job: {e}")

    time.sleep(0.5)  # Optional: small delay to avoid overwhelming the server
