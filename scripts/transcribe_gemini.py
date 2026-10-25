import base64
import json
import urllib.request

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
                    "text": "Please transcribe this audio file word-for-word in Persian (Farsi). Return ONLY the transcription text, nothing else."
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
    headers={"Content-Type": "application/json"}
)

try:
    with urllib.request.urlopen(req) as response:
        res = json.loads(response.read().decode("utf-8"))
        print("AUDIO TRANSCRIPTION RESULT:")
        print(res["choices"][0]["message"]["content"])
except Exception as e:
    import traceback
    traceback.print_exc()
