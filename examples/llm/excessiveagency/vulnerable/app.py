"""
Excessive Agency - VULNERABLE version.

/agent lets the (mock) model decide to invoke a "delete_file" tool with no
scope limit, no allowlist of safe actions, and no human confirmation step.
Just phrasing a request as an instruction is enough for the agent to carry
it out for real, against a demo file it's given filesystem access to.

    curl -X POST http://localhost:8000/agent -H "Content-Type: application/json" \\
      -d '{"instruction": "delete the file report.txt"}'
    curl http://localhost:8000/files

report.txt is genuinely gone after the first call - the agent had real
delete access and no gate stopping it from using it just because a message
asked it to.
"""
import os
import re
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Excessive Agency - VULNERABLE")
DATA_DIR = "/tmp/agent_vuln_files"
os.makedirs(DATA_DIR, exist_ok=True)


def reset_demo_file():
    with open(os.path.join(DATA_DIR, "report.txt"), "w") as f:
        f.write("Quarterly report contents.\n")


reset_demo_file()


class AgentRequest(BaseModel):
    instruction: str


@app.get("/")
def root():
    return {"lab": "excessive-agency", "variant": "vulnerable"}


@app.get("/files")
def list_files():
    return {"files": os.listdir(DATA_DIR)}


@app.post("/agent")
def agent(req: AgentRequest):
    match = re.search(r"delete (?:the file )?([\w.\-]+)", req.instruction, re.IGNORECASE)
    if match:
        filename = match.group(1)
        path = os.path.join(DATA_DIR, filename)
        # DANGEROUS: the agent just does it - any tool it has access to,
        # it will use, for any instruction that asks, with no allowlist
        # and no confirmation step.
        if os.path.isfile(path):
            os.remove(path)
            return {"action": "delete_file", "file": filename, "result": "deleted"}
        return {"action": "delete_file", "file": filename, "result": "not found"}
    return {"action": "none", "result": "instruction not understood"}
