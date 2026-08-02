# Unbounded Consumption - Runnable Lab

```bash
cd examples/llm/unboundedconsumption && docker compose up --build
# vulnerable: http://localhost:8047   secure: http://localhost:8048
```

```bash
curl "http://localhost:8047/generate?prompt=hi&repeat=1000000"   # happily does the work, no cap
curl "http://localhost:8048/generate?prompt=hi&repeat=1000000"   # 400: repeat exceeds max of 50

for i in 1 2 3 4 5 6; do curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:8048/generate?prompt=hi&repeat=2"; done
# first 5 succeed (200), the 6th is rate-limited (429)
```
