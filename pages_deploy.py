import os
#!/usr/bin/env python3
"""Cloudflare Pages Direct Upload deploy (replicates `wrangler pages deploy`).
Stages: hash → upload → deploy. State in /tmp/pd_state.json so each stage can
run in a separate short shell call. Usage: pages_deploy.py <stage>"""
import json, sys, os, base64, mimetypes, urllib.request, uuid

sys.path.insert(0, "/tmp")
from pure_blake3 import Hasher

ACCOUNT = "2c46b2a79ec379ad9e5d58836b0566ef"
PROJECT = "deltascreener"
TOKEN   = os.environ["CF_TOKEN"]  # see SECRETS.md
ROOT    = "/sessions/wonderful-zealous-thompson/mnt/Delta Screener/frontend"
WORKER  = "/sessions/wonderful-zealous-thompson/mnt/Delta Screener/build_worker.js"
ROUTES  = "/sessions/wonderful-zealous-thompson/mnt/Delta Screener/build_routes.json"
STATE   = "/tmp/pd_state.json"
API     = "https://api.cloudflare.com/client/v4"

SKIP_NAMES = {"_headers", "_redirects", "_worker.js", "_routes.json", ".DS_Store"}
SKIP_DIRS  = {".wrangler", "functions", "node_modules", ".git"}

def req(url, data=None, headers=None, method=None):
    r = urllib.request.Request(url, data=data, headers=headers or {}, method=method)
    with urllib.request.urlopen(r, timeout=40) as resp:
        return json.loads(resp.read())

def b3hex(s: bytes) -> str:
    h = Hasher(); h.update(s); return h.finalize(32).hex()

def collect():
    files = {}
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fn in filenames:
            if fn in SKIP_NAMES or fn.startswith(".fuse_hidden") or fn.startswith("."):
                continue
            full = os.path.join(dirpath, fn)
            rel = "/" + os.path.relpath(full, ROOT).replace(os.sep, "/")
            files[rel] = full
    return files

def stage_hash():
    files = collect()
    manifest, meta = {}, {}
    for rel, full in files.items():
        raw = open(full, "rb").read()
        b64 = base64.b64encode(raw).decode()
        ext = os.path.splitext(rel)[1].lstrip(".")
        h = b3hex((b64 + ext).encode())[:32]
        manifest[rel] = h
        ctype = mimetypes.guess_type(rel)[0] or "application/octet-stream"
        meta[h] = {"path": full, "contentType": ctype}
    json.dump({"manifest": manifest, "meta": meta}, open(STATE, "w"))
    print(f"hashed {len(manifest)} files")

def get_jwt():
    d = req(f"{API}/accounts/{ACCOUNT}/pages/projects/{PROJECT}/upload-token",
            headers={"Authorization": f"Bearer {TOKEN}"})
    return d["result"]["jwt"]

def stage_upload():
    st = json.load(open(STATE))
    jwt = get_jwt()
    hashes = list(set(st["manifest"].values()))
    d = req(f"{API}/pages/assets/check-missing",
            data=json.dumps({"hashes": hashes}).encode(),
            headers={"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"})
    missing = d["result"]
    print(f"{len(missing)} of {len(hashes)} assets missing")
    B = 20
    for i in range(0, len(missing), B):
        payload = []
        for h in missing[i:i+B]:
            m = st["meta"][h]
            payload.append({
                "key": h,
                "value": base64.b64encode(open(m["path"], "rb").read()).decode(),
                "metadata": {"contentType": m["contentType"]},
                "base64": True,
            })
        req(f"{API}/pages/assets/upload",
            data=json.dumps(payload).encode(),
            headers={"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"})
        print(f"uploaded {min(i+B, len(missing))}/{len(missing)}", flush=True)
    req(f"{API}/pages/assets/upsert-hashes",
        data=json.dumps({"hashes": hashes}).encode(),
        headers={"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"})
    print("upsert done")

def stage_deploy():
    st = json.load(open(STATE))
    boundary = uuid.uuid4().hex
    parts = []
    def field(name, value):
        parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"\r\n\r\n{value}\r\n".encode())
    def filefield(name, filename, content, ctype):
        parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"; filename=\"{filename}\"\r\nContent-Type: {ctype}\r\n\r\n".encode() + content + b"\r\n")
    field("manifest", json.dumps(st["manifest"]))
    field("branch", "main")
    for special, path in [("_headers", os.path.join(ROOT, "_headers")), ("_redirects", os.path.join(ROOT, "_redirects"))]:
        if os.path.exists(path):
            filefield(special, special, open(path, "rb").read(), "text/plain")
    filefield("_worker.js", "_worker.js", open(WORKER, "rb").read(), "application/javascript")
    if os.path.exists(ROUTES):
        filefield("_routes.json", "_routes.json", open(ROUTES, "rb").read(), "application/json")
    body = b"".join(parts) + f"--{boundary}--\r\n".encode()
    d = req(f"{API}/accounts/{ACCOUNT}/pages/projects/{PROJECT}/deployments",
            data=body,
            headers={"Authorization": f"Bearer {TOKEN}",
                     "Content-Type": f"multipart/form-data; boundary={boundary}"})
    r = d.get("result") or {}
    print("success:", d.get("success"), "| id:", r.get("id"), "| url:", r.get("url"), "| env:", r.get("environment"))
    if not d.get("success"): print(d.get("errors"))

stage = sys.argv[1] if len(sys.argv) > 1 else "all"
if stage in ("hash", "all"): stage_hash()
if stage in ("upload", "all"): stage_upload()
if stage in ("deploy", "all"): stage_deploy()
