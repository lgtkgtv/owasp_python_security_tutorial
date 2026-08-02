"""
Excessive Agency - SECURE version.

Same idea, but the agent's tools are scoped down to read-only actions by
default, and any destructive action requires an explicit confirm=true flag
that stands in for a real human-in-the-loop confirmation step (a second UI
prompt, a Slack approval, etc.) - the model asking isn't enough on its own.

    curl -X POST http://localhost:8000/agent -H "Content-Type: application/json" \\
      -d '{"instruction": "delete the file report.txt"}'
    # -> refused: destructive action requires confirmation

    curl -X POST http://localhost:8000/agent -H "Content-Type: application/json" \\
      -d '{"instruction": "delete the file report.txt", "confirm": true}'
    # -> only now actually deletes it
"""
import os
import re
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Excessive Agency - SECURE")
DATA_DIR = "/tmp/agent_secure_files"
os.makedirs(DATA_DIR, exist_ok=True)


def reset_demo_file():
    with open(os.path.join(DATA_DIR, "report.txt"), "w") as f:
        f.write("Quarterly report contents.\n")


reset_demo_file()


class AgentRequest(BaseModel):
    instruction: str
    confirm: bool = False


@app.get("/")
def root():
    return {"lab": "excessive-agency", "variant": "secure"}


@app.get("/files")
def list_files():
    return {"files": os.listdir(DATA_DIR)}


@app.post("/agent")
def agent(req: AgentRequest):
    match = re.search(r"delete (?:the file )?([\w.\-]+)", req.instruction, re.IGNORECASE)
    if match:
        filename = match.group(1)
        # SAFE: destructive actions require an explicit, separate
        # confirmation - the model deciding to act isn't sufficient on its
        # own for anything irreversible.
        if not req.confirm:
            return {
                "action": "delete_file",
                "file": filename,
                "result": "refused - destructive action requires confirm=true",
            }
        path = os.path.join(DATA_DIR, filename)
        if os.path.isfile(path):
            os.remove(path)
            return {"action": "delete_file", "file": filename, "result": "deleted (confirmed)"}
        return {"action": "delete_file", "file": filename, "result": "not found"}
    return {"action": "none", "result": "instruction not understood"}
