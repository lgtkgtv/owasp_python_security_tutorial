# Broken Access Control (IDOR) - Runnable Lab

```bash
cd examples/web/brokenaccess && docker compose up --build
# vulnerable: http://localhost:8023   secure: http://localhost:8024
```

```bash
curl -H "X-User-Id: 101" http://localhost:8023/invoices/2001   # leaks someone else's invoice
curl -H "X-User-Id: 101" http://localhost:8024/invoices/2001   # 403 forbidden
```
