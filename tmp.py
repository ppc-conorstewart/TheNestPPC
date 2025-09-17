from pathlib import Path
path = Path(r"client/src/components/Master Assembly Components/Support Files/maKit.js")
text = path.read_text()
old = "await fetch(`${API}/api/assets/${encodeURIComponent(assetId)}`, {\n  await fetch(`${API}/api/assets/${encodeURIComponent(assetId)}`, {"
