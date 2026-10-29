"""Dev server for checking episodes: serves the project and saves files the page POSTs to it.

    python tools/dev_server.py . tools/out

Open http://127.0.0.1:8124/<episode>.html, then in the console: await import('/tools/sheet.js').
POST /save/<sub>/<name>.(png|mp4) writes OUT/<sub>/<name>. Nothing is cached, so edits show on reload.
"""
import http.server, pathlib, re, sys

ROOT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.').resolve()
OUT = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else 'tools/out').resolve()


class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(ROOT), **k)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, *a):
        pass

    def do_POST(self):
        # /export/<folder>/<file>: finished deliverables, written under ROOT/exports
        # (?append=1 adds to the file, so big videos can come in pieces)
        if self.path.startswith('/export/'):
            from urllib.parse import unquote
            rel = unquote(self.path[len('/export/'):].split('?')[0])
            if not re.fullmatch(r"[\w .()'!?,-]+/[\w .()'!?,-]+\.(?:png|mp4|txt|md)", rel) or '..' in rel:
                self.send_error(400); return
            d = ROOT / 'exports' / rel.split('/')[0]
            d.mkdir(parents=True, exist_ok=True)
            with open(d / rel.split('/')[1], 'ab' if 'append=1' in self.path else 'wb') as f:
                f.write(self.rfile.read(int(self.headers['Content-Length'])))
            self.send_response(200); self.end_headers(); self.wfile.write(b'ok'); return
        m = re.fullmatch(r'/save/(?:([\w-]+)/)?([\w.-]+\.(?:png|mp4))', self.path.split('?')[0])
        if not m:
            self.send_error(400); return
        sub, name = m.groups()
        d = OUT / sub if sub else OUT
        d.mkdir(parents=True, exist_ok=True)
        (d / name).write_bytes(self.rfile.read(int(self.headers['Content-Length'])))
        self.send_response(200); self.end_headers(); self.wfile.write(b'ok')


print(f'serving {ROOT} on http://127.0.0.1:8124, saving to {OUT}')
http.server.ThreadingHTTPServer(('127.0.0.1', 8124), H).serve_forever()
