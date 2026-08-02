"""
SQL Injection - VULNERABLE version.

Mirrors the tutorial's own "Learn" tab code: a username is concatenated
directly into a SQL string instead of being passed as a bound parameter.
Run it and try:

    curl "http://localhost:8000/users/admin"
    curl "http://localhost:8000/users/admin' OR '1'='1"

The second call returns every row in the table, not just "admin" - because
the OR '1'='1' condition makes the WHERE clause always true.
"""
import sqlite3
from fastapi import FastAPI

app = FastAPI(title="SQL Injection - VULNERABLE")


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
    return {"lab": "sql-injection", "variant": "vulnerable", "try": "/users/admin' OR '1'='1"}


@app.get("/users/{username:path}")
def get_user(username: str):
    cursor = DB.cursor()
    # DANGEROUS: direct string interpolation into SQL.
    query = f"SELECT id, username, email FROM users WHERE username = '{username}'"
    cursor.execute(query)
    rows = cursor.fetchall()
    return {
        "query_executed": query,
        "row_count": len(rows),
        "rows": [{"id": r[0], "username": r[1], "email": r[2]} for r in rows],
    }
