import sys
import json
import urllib.request
import base64

workspace = r"C:/Users/erfan/AppData/Local/hermes/installs/90872d1b46cd2fab/environments/cdd39f2e73d24cf2b91f949b74c12d02/workspace"
sys.path.insert(0, workspace)

from tools.tool_backend_helpers import resolve_provider_secret

# Try to resolve erfan api key
api_key = resolve_provider_secret("HERMES_CUSTOM_ERFAN_API_KEY", "erfan")

with open(r"C:/Users/erfan/Desktop/audio_2026-10-17_23-35-25.ogg", "rb") as f:
    audio_bytes = f.read()

audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")

payload = {
    "model": "ag/gemini-3.8-flash-low",
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "لطفاً فایل صوتی را با دقت گوش بده و متن فارسی آن را کلمه به کلمه پیاده کن (فقط متن دقیق، بدون توضیح اضافی)."
                },
                {
                    "type": "input_audio",
                    "input_audio": {
                        "data": audio_b64,
                        "format": "ogg"
                    }
                }
            ]
        }
    ]
}

req = urllib.request.Request(
    "http://localhost:20128/v1/chat/completions",
    data=json.dumps(payload).encode("utf-8"),
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}" if api_key else ""
    }
)

try:
    with urllib.request.urlopen(req) as response:
        raw = response.read().decode("utf-8")
        print("RAW RESPONSE:", raw)
        res = json.loads(raw)
        print("TRANSCRIPTION:")
        print(res["choices"][0]["message"]["content"])
except urllib.error.HTTPError as he:
    print("HTTP ERROR:", he.code, he.read().decode("utf-8"))
except Exception as e:
    import traceback
    traceback.print_exc()
