# Sensitive Data Exposure - Runnable Lab

```bash
cd examples/web/sensitivedata && docker compose up --build
# vulnerable: http://localhost:8021   secure: http://localhost:8022
```

```bash
curl -X POST http://localhost:8021/register -d "username=alice&password=hunter2"
# -> {"username":"alice","password_hash":"<md5, no salt>"} - hash leaked in the response

curl -X POST http://localhost:8022/register -d "username=alice&password=hunter2"
# -> {"username":"alice","status":"registered"} - hash never leaves the server
```
