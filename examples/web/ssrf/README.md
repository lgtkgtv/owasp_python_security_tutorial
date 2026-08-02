# SSRF - Runnable Lab

```bash
cd examples/web/ssrf && docker compose up --build
# vulnerable: http://localhost:8017   secure: http://localhost:8018
```

```bash
curl "http://localhost:8017/fetch?url=http://127.0.0.1:8017/internal-only"   # leaks internal data
curl "http://localhost:8018/fetch?url=http://127.0.0.1:8018/internal-only"   # rejected: private address
```
