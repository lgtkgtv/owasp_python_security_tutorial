# SQL Injection - Runnable Lab

Companion to the **SQL Injection (SQLi)** module in the interactive tutorial. Two
identical FastAPI apps, one vulnerable and one fixed, both seeded with the same
three in-memory users.

## Run it

```bash
cd examples/web/sqlinjection
docker compose up --build
# vulnerable: http://localhost:8001   secure: http://localhost:8002
```

## Try it

```bash
# Normal lookup - both behave the same
curl "http://localhost:8001/users/admin"
curl "http://localhost:8002/users/admin"

# The attack: an OR '1'='1' condition that's always true
curl "http://localhost:8001/users/admin%27%20OR%20%271%27%3D%271"
curl "http://localhost:8002/users/admin%27%20OR%20%271%27%3D%271"
```

**Vulnerable** returns all 3 users (`row_count: 3`) - the string concatenation
turned the attacker's input into part of the SQL syntax itself, so the WHERE
clause became always-true.

**Secure** returns 0 rows - the parameterized query treats the entire string,
quotes and all, as a single literal value to compare against `username`, so
there's no way to break out of the data context into the SQL syntax context.
