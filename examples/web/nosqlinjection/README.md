# NoSQL / LDAP Injection (OWASP A03:2021, CWE-943)

Passing a user-controlled JSON value straight into a MongoDB-style query
filter, with no check that it's the plain string the code expects, lets an
attacker send a query *operator* instead of a value -- turning a value into
logic.

No real MongoDB server is used here (this lab runs standalone with no
external services) -- `app.py` implements a small, faithful subset of
MongoDB's filter-matching semantics (`$ne`, `$gt`, `$gte`, `$regex`,
`$exists`) in plain Python, enough to demonstrate the real vulnerability
mechanism without needing a database container.

## Run it

```bash
cd examples/web/nosqlinjection
docker compose up --build
```

- Vulnerable: http://localhost:8049
- Secure: http://localhost:8050

## Try it

Normal login (works on both variants):

```bash
curl -X POST http://localhost:8049/login -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"secret123"}'
# {"authenticated":true,"user":"admin"}
```

Operator injection -- authentication bypass:

```bash
curl -X POST http://localhost:8049/login -H "Content-Type: application/json" \
  -d '{"username":"admin","password":{"$ne":null}}'
# vulnerable: {"authenticated":true,"user":"admin"}  <- bypassed, no password needed!

curl -X POST http://localhost:8050/login -H "Content-Type: application/json" \
  -d '{"username":"admin","password":{"$ne":null}}'
# secure: 400 Bad Request - Invalid credentials format
```

Other operators to try: `{"$gt": ""}`, `{"$regex": ".*"}`, `{"$exists": true}`.

## Related: LDAP injection

LDAP (used by Active Directory and other directory services) has the same
root cause via different syntax. A filter like
`(&(uid={username})(userPassword={password}))` uses special characters
(`* ( ) | &`) to build search logic -- unescaped user input can inject extra
filter clauses the same way a Mongo operator does here. The fix is the same
in spirit: never let user input be interpreted as query structure.
