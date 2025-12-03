"""
Simple HTTP server to serve the landing page for testing
Run with: python3 /app/landing-page/serve.py
"""
import http.server
import socketserver
import os

PORT = 8080
DIRECTORY = "/app/landing-page"

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

if __name__ == "__main__":
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"✅ Landing page server running at http://localhost:{PORT}")
        print(f"📁 Serving files from: {DIRECTORY}")
        httpd.serve_forever()
