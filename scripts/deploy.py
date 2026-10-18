# Trigger a Render deploy of the latest commit (auto-deploy has no webhook on this repo).
import json, sys, urllib.request
env = dict(l.split("=", 1) for l in open(".env").read().split("\n") if "=" in l)
key = env["RENDER_KEY"].strip(); sid = "srv-dba9hg7btjjs73eapub0"
req = urllib.request.Request(f"https://api.render.com/v1/services/{sid}/deploys", method="POST", data=json.dumps({"clearCache": "do_not_clear"}).encode(),
    headers={"Authorization": "Bearer " + key, "Accept": "application/json", "Content-Type": "application/json"})
d = json.load(urllib.request.urlopen(req)); print(d.get("id"), d.get("status"), d.get("commit", {}).get("message", "")[:60])
