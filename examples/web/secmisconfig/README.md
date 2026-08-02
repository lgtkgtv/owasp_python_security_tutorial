# Security Misconfiguration - Runnable Lab

```bash
cd examples/web/secmisconfig && docker compose up --build
# vulnerable: http://localhost:8019   secure: http://localhost:8020
```

```bash
curl http://localhost:8019/crash        # full stack trace leaks
curl http://localhost:8020/crash        # generic 500, no details

curl http://localhost:8019/admin/env    # 200 - no auth needed
curl http://localhost:8020/admin/env    # 401 - requires a bearer token
```
