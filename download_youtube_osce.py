"""
download_youtube_osce.py
========================
Helper script to download a YouTube medical OSCE video as a test case.
Requires yt-dlp: pip install yt-dlp
"""

import sys
import subprocess

try:
    import yt_dlp
except ImportError:
    print("Installing yt-dlp...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "yt-dlp", "-q"])
    import yt_dlp

def download_video(url, output_name):
    print(f"Downloading: {url}")
    print(f"Saving as  : {output_name}")
    print("-" * 50)
    
    ydl_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '128',
        }],
        'outtmpl': output_name.replace('.mp4', '.mp3'),
        'quiet': False
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        print("-" * 50)
        final_name = output_name.replace(".mp4", ".mp3")
        print(f"[OK] Downloaded as AUDIO ONLY: {final_name}")
        print("Test it now by running:")
        print(f"  .\\venv\\Scripts\\python.exe clinical_ai_assistant.py {final_name}")
    except Exception as e:
        print(f"[ERROR] Failed to download: {e}")

if __name__ == "__main__":
    # Geeky Medics - History Taking OSCE guide (Perfect realistic doctor/patient test)
    video_url = "https://youtu.be/eiRIm6BOzP4"
    download_video(video_url, "medical_osce_test.mp4")
