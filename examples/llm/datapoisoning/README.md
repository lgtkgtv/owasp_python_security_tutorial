# Data and Model Poisoning - Runnable Lab

```bash
cd examples/llm/datapoisoning && docker compose up --build
# vulnerable: http://localhost:8035   secure: http://localhost:8036
```

```bash
curl -X POST http://localhost:8035/feedback -H "Content-Type: application/json" \
  -d '{"prompt":"p","response":"r","label":"good"}'
curl http://localhost:8035/dataset   # already in the training set - no review happened

curl -X POST http://localhost:8036/feedback -H "Content-Type: application/json" \
  -d '{"prompt":"p","response":"r","label":"good"}'
curl http://localhost:8036/dataset   # empty - it's sitting in /pending until approved
```
