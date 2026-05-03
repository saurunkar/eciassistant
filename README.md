# ElectGuide India 🗳️

> AI-powered election assistant for first-time Indian voters — grounded in official ECI documents.

[![CI](https://github.com/YOUR_ORG/electguide-india/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_ORG/electguide-india/actions/workflows/ci.yml)

---

## What is this?

ElectGuide India helps first-time voters understand the Indian election process through an interactive AI chat interface, visual election timeline, searchable glossary, and step-by-step voter guide — all bilingual (English + Hindi).

**Key features:**
- 🤖 AI chat powered by Vertex AI Gemini 1.5 Pro (with ECI-knowledge fallback mode)
- 📅 Interactive 7-phase election timeline
- 📖 15-term searchable glossary with category filters
- 🗳️ 5-step first-time voter guide
- 🌐 Full English ↔ Hindi toggle
- 🔒 DPDP Act 2023 compliant — zero PII, no login required

---

## PHASE 1 — Local Development

### Prerequisites

```bash
# Required versions
python 3.11+
node 20+
pnpm 9+          # npm install -g pnpm@9
docker           # for local image testing
gcloud CLI       # https://cloud.google.com/sdk/docs/install
```

### Backend (FastAPI)

```bash
cd electguide-india/backend

# Install uv (fast Python package manager)
pip install uv

# Create venv and install dependencies
uv venv
# Windows:
.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

uv pip install -e ".[dev]"

# Copy and edit environment file
cp .env.example .env
# Edit .env — for local demo, leave GCP_PROJECT_ID blank (uses fallback KB)

# Start dev server
uvicorn app.main:app --reload --port 8000
```

The API will be available at **http://localhost:8000**
- Swagger docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

### Frontend (React + Vite)

```bash
cd electguide-india/frontend

pnpm install

cp .env.example .env.local
# .env.local already has VITE_API_BASE_URL=http://localhost:8000

pnpm dev
# Opens at http://localhost:5173
```

### Run Tests

```bash
cd electguide-india/backend

# Unit tests (no GCP required)
pytest tests/unit/ -v

# Security tests
pytest tests/security/ -v

# All tests with coverage (must be ≥ 80%)
pytest tests/ --cov=app --cov-fail-under=80 --cov-report=term-missing
```

---

## PHASE 2 — GCP Setup

Run these commands with your GCP Project ID. The app works in demo mode without GCP, but for production you need these steps.

### Step 1 — Set your project

```bash
export PROJECT_ID="your-gcp-project-id"    # ← replace this
export REGION="asia-south1"

gcloud config set project $PROJECT_ID
```

### Step 2 — Enable APIs

```bash
gcloud services enable \
  run.googleapis.com \
  firestore.googleapis.com \
  aiplatform.googleapis.com \
  storage.googleapis.com \
  translate.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com
```

### Step 3 — Create Artifact Registry

```bash
gcloud artifacts repositories create electguide \
  --repository-format=docker \
  --location=$REGION \
  --description="ElectGuide India Docker images"
```

### Step 4 — Create Firestore database

```bash
gcloud firestore databases create \
  --location=$REGION \
  --type=firestore-native
```

### Step 5 — Create Cloud Storage bucket

```bash
gsutil mb -p $PROJECT_ID -l $REGION gs://${PROJECT_ID}-electguide-eci-docs
```

### Step 6 — Create service account

```bash
gcloud iam service-accounts create electguide-cloudrun-sa \
  --display-name="ElectGuide Cloud Run SA"

SA_EMAIL="electguide-cloudrun-sa@${PROJECT_ID}.iam.gserviceaccount.com"

for ROLE in roles/aiplatform.user roles/datastore.user roles/storage.objectViewer; do
  gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="$ROLE"
done
```

### Step 7 — Install Firebase CLI and initialise hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting --project $PROJECT_ID
# When prompted:
#   Public directory: dist
#   Single-page app: Yes
#   GitHub auto-deploys: No (we handle via GitHub Actions)
```

### Step 8 (Optional) — Set up Vertex AI Search (RAG)

1. Go to [Vertex AI Search Console](https://console.cloud.google.com/vertex-ai/search)
2. Create a new **Search App** (type: Generic, Unstructured)
3. Create a **Data Store** linked to your GCS bucket (`gs://${PROJECT_ID}-electguide-eci-docs/eci-docs/`)
4. Upload ECI PDFs to the bucket:
   ```bash
   gsutil cp *.pdf gs://${PROJECT_ID}-electguide-eci-docs/eci-docs/
   ```
5. Note the **Engine ID** — set it as `VERTEX_AI_SEARCH_ENGINE_ID` on Cloud Run

---

## PHASE 3 — Deployment

### Deploy Backend to Cloud Run

```bash
cd electguide-india/backend

# Option A: Direct source deploy (simplest — no Docker required locally)
gcloud run deploy electguide-api \
  --source . \
  --region=$REGION \
  --allow-unauthenticated \
  --service-account="electguide-cloudrun-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --set-env-vars="GCP_PROJECT_ID=${PROJECT_ID},GCP_REGION=${REGION},VERTEX_AI_LOCATION=${REGION},ENVIRONMENT=production,LOG_LEVEL=INFO,SESSION_TTL_HOURS=24,MAX_MESSAGES_PER_SESSION=20" \
  --memory=1Gi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10 \
  --timeout=60

# Get the deployed URL
CLOUD_RUN_URL=$(gcloud run services describe electguide-api \
  --region=$REGION \
  --format='value(status.url)')
echo "Backend URL: $CLOUD_RUN_URL"
```

### Update CORS on Cloud Run

```bash
# Replace with your actual Firebase Hosting URL
FIREBASE_URL="https://YOUR-PROJECT-ID.web.app"

gcloud run services update electguide-api \
  --region=$REGION \
  --update-env-vars="CORS_ORIGINS=${FIREBASE_URL},http://localhost:5173"
```

### Deploy Frontend to Firebase Hosting

```bash
cd electguide-india/frontend

# Set the Cloud Run URL so the frontend can reach the API
echo "VITE_API_BASE_URL=${CLOUD_RUN_URL}" > .env.production

pnpm build
firebase deploy --only hosting --project $PROJECT_ID
```

### Smoke Test

```bash
# Health check
curl ${CLOUD_RUN_URL}/health

# Test chat endpoint
curl -X POST ${CLOUD_RUN_URL}/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id":"12345678-1234-4234-8234-123456789abc","message":"How do I register to vote?","language":"en"}' \
  --no-buffer

# Test timeline
curl ${CLOUD_RUN_URL}/api/v1/timeline | python -m json.tool

# Test glossary
curl ${CLOUD_RUN_URL}/api/v1/glossary | python -m json.tool
```

---

## Architecture

```
Browser (Firebase Hosting CDN)
    │
    ▼ HTTPS
Cloud Armor WAF (rate limit 100 req/min, OWASP rules)
    │
    ▼
Cloud Run (FastAPI — stateless, 0→10 instances)
    ├── Vertex AI Gemini 1.5 Pro (server-side only)
    ├── Vertex AI Search (RAG over ECI PDFs)
    ├── Firestore (sessions, feedback — 24h TTL)
    └── Cloud Storage (ECI docs, system prompt)
```

**Security layers:**
1. Cloud Armor WAF (edge)
2. HTTPS-only (Cloud Run enforced)
3. CORS enforcement (allowlist)
4. Content Security Policy headers
5. Input sanitisation (bleach + regex)
6. Session rate limiting (20 msg/session)
7. Read-only Cloud Run filesystem

---

## Project Structure

```
electguide-india/
├── frontend/          React 18 + TypeScript + Tailwind SPA
├── backend/           FastAPI Python 3.11 on Cloud Run
├── infra/             Terraform — GCP resources
├── .github/workflows/ CI/CD (GitHub Actions)
└── cloudbuild.yaml    GCP Cloud Build pipeline
```

---

## Voter Helpline
📞 **1950** (toll-free, all states)
🌐 **eci.gov.in** | **voters.eci.gov.in**
