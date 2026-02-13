FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    bash \
    build-essential \
    pkg-config \
    default-libmysqlclient-dev \
    curl \
    libpq-dev \
  && rm -rf /var/lib/apt/lists/*

# Non-root user
RUN useradd -m -u 10001 appuser \
 && mkdir -p /app/staticfiles \
 && chown -R appuser:appuser /app

USER appuser

COPY requirements.txt /app/requirements.txt
RUN pip install --upgrade pip && pip install -r /app/requirements.txt

COPY . /app/