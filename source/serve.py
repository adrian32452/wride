import http.server, sys, os
os.chdir(sys.argv[1])
H = http.server.SimpleHTTPRequestHandler
H.extensions_map.update({'.html': 'text/html; charset=utf-8', '.json': 'application/json; charset=utf-8'})
http.server.ThreadingHTTPServer(('', 8765), H).serve_forever()
