# Cross-Site Scripting (XSS) - Runnable Lab

```bash
cd examples/web/xss && docker compose up --build
# vulnerable: http://localhost:8003   secure: http://localhost:8004
```

```bash
curl "http://localhost:8003/search?q=<script>alert(1)</script>"
curl "http://localhost:8004/search?q=<script>alert(1)</script>"
```

Compare the raw response bodies: the vulnerable app returns the `<script>` tag
intact (would execute in a real browser); the secure app returns
`&lt;script&gt;...&lt;/script&gt;` - inert, displayable text.
