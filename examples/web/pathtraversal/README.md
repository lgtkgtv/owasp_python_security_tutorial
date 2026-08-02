# Path Traversal - Runnable Lab

```bash
cd examples/web/pathtraversal && docker compose up --build
# vulnerable: http://localhost:8009   secure: http://localhost:8010
```

```bash
curl "http://localhost:8009/files/../secret.txt"   # leaks the top-secret file
curl "http://localhost:8010/files/../secret.txt"   # 403: rejected
```
