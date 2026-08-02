# LLM Supply Chain - Runnable Lab

```bash
cd examples/llm/llmsupplychain && docker compose up --build
# vulnerable: http://localhost:8033   secure: http://localhost:8034
```

```bash
curl http://localhost:8033/model-info   # tag: "latest", no digest - unpinned
curl http://localhost:8034/model-info   # exact version + sha256 digest - pinned
```
