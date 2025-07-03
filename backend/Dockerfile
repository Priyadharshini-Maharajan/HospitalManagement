# backend/Dockerfile
FROM python:3.11-slim


RUN apt-get update && apt-get install -y \
    build-essential \
    g++ \
    libgl1-mesa-glx \
    libglib2.0-0 \ 
    git \
    && rm -rf /var/lib/apt/lists/

WORKDIR /app

COPY . /app

RUN pip install --upgrade pip

RUN pip install --default-timeout=100  --no-cache-dir -r requirements.txt

# Compile all .py files to .pyc and remove .py (optional)
RUN python -m compileall -b /app \
    && find /app -name "*.py" -type f -delete

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
