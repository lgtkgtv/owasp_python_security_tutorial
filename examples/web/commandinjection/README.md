# Command Injection - Runnable Lab

```bash
cd examples/web/commandinjection && docker compose up --build
# vulnerable: http://localhost:8011   secure: http://localhost:8012
```

```bash
curl "http://localhost:8011/ping?host=127.0.0.1%3B%20echo%20PWNED"  # PWNED appears in stdout
curl "http://localhost:8012/ping?host=127.0.0.1%3B%20echo%20PWNED"  # rejected: invalid host
```
