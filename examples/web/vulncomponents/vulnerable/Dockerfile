FROM python:3.11-slim
WORKDIR /app
# pyyaml==5.3.1 (pinned deliberately below, to demonstrate a known-CVE
# dependency) predates Python 3.11 and ships no prebuilt wheel, so it must
# compile its C extension from source - hence gcc here, unlike the other
# labs' Dockerfiles.
RUN apt-get update && apt-get install -y --no-install-recommends gcc python3-dev \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .
EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
