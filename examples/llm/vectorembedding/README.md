# Vector and Embedding Weaknesses - Runnable Lab

```bash
cd examples/llm/vectorembedding && docker compose up --build
# vulnerable: http://localhost:8043   secure: http://localhost:8044
```

```bash
curl "http://localhost:8043/rag-search?q=roadmap&tenant=acme"   # also returns Globex's confidential doc
curl "http://localhost:8044/rag-search?q=roadmap&tenant=acme"   # only Acme's own document
```
