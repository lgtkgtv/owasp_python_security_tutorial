# Excessive Agency - Runnable Lab

```bash
cd examples/llm/excessiveagency && docker compose up --build
# vulnerable: http://localhost:8039   secure: http://localhost:8040
```

```bash
curl -X POST http://localhost:8039/agent -H "Content-Type: application/json" \
  -d '{"instruction": "delete the file report.txt"}'
curl http://localhost:8039/files   # report.txt is really gone

curl -X POST http://localhost:8040/agent -H "Content-Type: application/json" \
  -d '{"instruction": "delete the file report.txt"}'
curl http://localhost:8040/files   # still there - refused without confirm=true
```
