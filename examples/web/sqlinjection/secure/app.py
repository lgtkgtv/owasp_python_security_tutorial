"""
SQL Injection - SECURE version.

Same feature as the vulnerable app, but the username is passed as a bound
parameter, never concatenated into the query string. Try the exact same
requests as the vulnerable app:

    curl "http://localhost:8000/users/admin"
    curl "http://localhost:8000/users/admin' OR '1'='1"

The second call now returns zero rows - the whole string, quotes included,
is treated as a single literal value to compare against, not as SQL syntax.
"""
import sqlite3
from fastapi import FastAPI

app = FastAPI(title="SQL Injection - SECURE")


def seed_db():
    conn = sqlite3.connect(":memory:", check_same_thread=False)
    conn.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, email TEXT)")
    conn.executemany(
        "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
        [
            ("admin", "secret123", "admin@example.com"),
            ("user1", "pass456", "user1@example.com"),
            ("user2", "mypass789", "user2@example.com"),
        ],
    )
    conn.commit()
    return conn


DB = seed_db()


@app.get("/")
def root():
    return {"lab": "sql-injection", "variant": "secure", "try": "/users/admin' OR '1'='1"}


@app.get("/users/{username:path}")
def get_user(username: str):
    cursor = DB.cursor()
    # SAFE: parameterized query - the placeholder "?" is bound to a literal
    # value by the sqlite3 driver, never parsed as part of the SQL syntax.
    query = "SELECT id, username, email FROM users WHERE username = ?"
    cursor.execute(query, (username,))
    rows = cursor.fetchall()
    return {
        "query_executed": f"{query}  -- bound param: {username!r}",
        "row_count": len(rows),
        "rows": [{"id": r[0], "username": r[1], "email": r[2]} for r in rows],
    }
