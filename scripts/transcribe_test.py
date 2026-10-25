import sys
import os

workspace = r"C:/Users/erfan/AppData/Local/hermes/installs/90872d1b46cd2fab/environments/cdd39f2e73d24cf2b91f949b74c12d02/workspace"
sys.path.insert(0, workspace)
os.environ["PATH"] = r"C:/Users/erfan/AppData/Local/hermes/tools/ffmpeg-9.0.1-win32-x64/bin;" + os.environ.get("PATH", "")

try:
    from tools.transcription_tools import transcribe_audio
    res = transcribe_audio(r"C:/Users/erfan/Desktop/audio_2026-10-17_23-35-25.ogg")
    print("TRANSCRIPTION_SUCCESS:")
    print(res)
except Exception as e:
    import traceback
    traceback.print_exc()
