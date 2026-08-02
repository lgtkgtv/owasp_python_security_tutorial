# Improper Output Handling - Runnable Lab

```bash
cd examples/llm/outputhandling && docker compose up --build
# vulnerable: http://localhost:8037   secure: http://localhost:8038
```

```bash
curl "http://localhost:8037/chat-page?message=<script>alert(1)</script>"   # live <script> tag in the HTML
curl "http://localhost:8038/chat-page?message=<script>alert(1)</script>"   # &lt;script&gt; - inert text
```
