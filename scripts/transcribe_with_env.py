import os
import sys

workspace = r"C:/Users/erfan/AppData/Local/hermes/installs/90872d1b46cd2fab/environments/cdd39f2e73d24cf2b91f949b74c12d02/workspace"
sys.path.insert(0, workspace)
os.environ["PATH"] = r"C:/Users/erfan/AppData/Local/hermes/tools/ffmpeg-9.0.1-win32-x64/bin;" + os.environ.get("PATH", "")

# Load .env file from hermes
env_path = r"C:/Users/erfan/AppData/Local/hermes/.env"
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ[k.strip()] = v.strip().strip("'\"")

from tools.transcription_tools import transcribe_audio
res = transcribe_audio(r"C:/Users/erfan/Desktop/audio_2026-10-17_23-35-25.ogg")
print("RESULT:", res)
