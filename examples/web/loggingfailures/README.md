# Security Logging & Monitoring Failures - Runnable Lab

```bash
cd examples/web/loggingfailures && docker compose up --build
# vulnerable: http://localhost:8027   secure: http://localhost:8028
```

```bash
curl -X POST http://localhost:8027/login -d "username=admin&password=wrong1"
curl -X POST http://localhost:8027/login -d "username=admin&password=hunter2"
curl http://localhost:8027/logs
# -> every plaintext password attempted is sitting right there in the log

curl -X POST http://localhost:8028/login -d "username=admin&password=wrong1"
curl -X POST http://localhost:8028/login -d "username=admin&password=hunter2"
curl http://localhost:8028/logs
# -> "login_failed username=admin reason=invalid_password" / "login_success username=admin"
#    no secret, but enough context to spot a brute-force pattern
```
