# ── Stage 1: build dependencies ─────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /build

# Install uv for fast dependency resolution
RUN pip install --no-cache-dir uv==0.4.18

# Copy project manifest first (layer cache)
COPY pyproject.toml .
COPY app/ app/

# Install production deps into /build/.venv
RUN uv venv /build/.venv && \
    uv pip install --python /build/.venv/bin/python -e "." --no-cache

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM python:3.11-slim AS runtime

# Security: non-root user
RUN groupadd --gid 1001 appgroup && \
    useradd  --uid 1001 --gid 1001 --no-create-home appuser

WORKDIR /app

# Copy only the venv and app source
COPY --from=builder /build/.venv /app/.venv
COPY --from=builder /build/app    /app/app

# Activate venv via PATH
ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080

# Read-only filesystem except /tmp
VOLUME ["/tmp"]

# Drop to non-root
USER appuser

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import httpx; httpx.get('http://localhost:8080/health').raise_for_status()"

CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080} --workers 1 --log-level warning
