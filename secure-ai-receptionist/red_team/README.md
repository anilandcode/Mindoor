# Red-Team Battery

This directory holds the healthcare-specific adversarial prompt battery used to
measure Mindoor's security posture.

## Files

- `attacks.jsonl` — 10 malicious prompts targeting healthcare-specific attack
  vectors (PHI exfiltration, billing fraud, role escalation, etc.).
- `benign.jsonl` — 10 legitimate patient prompts used to measure false-positive
  rate.
- `run_battery.py` — Runner script. Iterates every prompt through the Lobster
  Trap proxy, records latency / action / risk score, and writes `report.md`.

## Requirements

```bash
pip install requests
```

## Run

```bash
cd /path/to/secure-ai-receptionist
python red_team/run_battery.py
```

The script auto-detects whether `v1/chat/completions` or `api/chat` is
available. You can override the base URL:

```bash
RED_TEAM_BASE_URL=http://localhost:8080 python red_team/run_battery.py
```

## Output

- `red_team/report.md` — Markdown summary with block rate, false-positive rate,
  median/p95 latency, and per-category breakdown.
