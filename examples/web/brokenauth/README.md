# Broken Authentication - Runnable Lab

```bash
cd examples/web/brokenauth && docker compose up --build
# vulnerable: http://localhost:8005   secure: http://localhost:8006
```

```bash
curl -X POST http://localhost:8005/login -d "username=alice"
curl -X POST http://localhost:8005/login -d "username=bob"
# tokens come back as 1001, 1002, ... - guess "1003" and you're in someone's session

curl -X POST http://localhost:8006/login -d "username=alice"
# token is a long random string - nothing to guess
```
