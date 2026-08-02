# CSRF - Runnable Lab

```bash
cd examples/web/csrf && docker compose up --build
# vulnerable: http://localhost:8007   secure: http://localhost:8008
```

```bash
# Vulnerable: cookie alone authorizes the transfer
curl -c /tmp/c.txt -X POST http://localhost:8007/login -d "username=alice"
curl -b /tmp/c.txt -X POST http://localhost:8007/transfer -d "to=attacker&amount=500"

# Secure: cookie alone is rejected; a matching CSRF token header is required
curl -c /tmp/c2.txt -X POST http://localhost:8008/login -d "username=alice"
curl -b /tmp/c2.txt -X POST http://localhost:8008/transfer -d "to=attacker&amount=500"
```
