# PhantomX — `SENTRIX`

Next-gen **XDR / SOC command platform**. React + shadcn/ui SPA over a FastAPI
**Backend-For-Frontend (BFF)**. Mock data today, real upstreams (n8n / pentest
tool) tomorrow — same REST contract, zero frontend change.

> Working product name is `SENTRIX` (single constant `APP_NAME`, easy to rename).

## Modules

1. **Overview** — telemetry dashboard with a 3D telemetry core, KPIs, data
   sources, and a prominent *"False Positives Auto-Closed by n8n"* counter.
2. **AI Court** — displays n8n's verdicts for **true positives only**, with a
   3D tribunal (Prosecutor / Defender / Judge), a case feed, and structured
   remediation recommendations. False positives are counted, never listed.
3. **Recommended Rules** — KQL detection rules proposed by n8n; **approve / edit
   / reject-with-reason** by hand (admin only). Approved rules are stored only.
4. **AGI Pentest** — control panel for the external Atomic Red Team tool: MITRE
   ATT&CK tactics sidebar → techniques (TTPs) with test/blocked/AD badges →
   scope (with **Run as** Administrator/Domain User) → execute → AI analysis.

## Hackathon requirement coverage

The minimal pipeline — **Atomic Red Team → Wazuh/SIEM → Sigma → ATT&CK Navigator** —
is wired end to end across the app:

| Requirement | Where in the app | Endpoint |
|---|---|---|
| **1. Execute 2–3 TTPs (Atomic Red Team)** | AGI Pentest → TTP Selection → **Execute** (select TTPs, run, step timeline) | `POST /pentest/runs`, `GET /pentest/runs/{id}` |
| **2. Ingest telemetry → Wazuh/SIEM** | AGI Pentest → AI Analysis → **SIEM Ingestion — Wazuh** (events, Wazuh rule id, alert level, detected/gap per technique); Wazuh + Sysmon in Overview sources | `GET /pentest/runs/{id}` (`siemIngestion[]`) |
| **3. Manually write Sigma rules** | Recommended Rules → **Sigma (YAML)** view + edit, and **New Sigma Rule** authoring dialog (admin) | `POST /rules`, `GET/PUT /rules/{id}` (`sigma`) |
| **4. Single ATT&CK Navigator layer** | AGI Pentest → **ATT&CK Navigator** tab: coverage matrix + **Export Navigator Layer** (official `layer.json`) | `GET /attack/coverage`, `GET /attack/navigator-layer` |

The exported layer is a valid MITRE ATT&CK Navigator v4.5 layer (`enterprise-attack`,
scored techniques with `tested`/`detected`/`sigmaRule` metadata, gradient + legend) —
import it directly into [ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/).

## Auth & Roles

| User | Password | Role | Capabilities |
|------|----------|------|--------------|
| `admin` | `admin123` | admin | Full access — approve/reject/edit rules, launch pentest runs |
| `analyst` | `analyst123` | analyst | View-only dashboards, AI Court, rules; cannot mutate or launch |

RBAC is enforced both in the UI (hidden/disabled actions) and on the backend
(`require_role("admin")` → 403 on mutating endpoints).

## Architecture

```
[ React + shadcn UI ] --HTTP--> [ FastAPI BFF ] --> [ Mock JSON ]        (TODAY)
                                              \--> [ n8n / Pentest REST ] (LATER, same endpoints)
```

- Frontend talks **only** to `http://localhost:8000/api/v1/...`. No secrets in
  the frontend bundle.
- Backend flag `DATA_SOURCE=mock|live` selects mock JSON vs real upstream.
  Switching to real data = implement `app/services/live_provider.py` and set
  `DATA_SOURCE=live`. No frontend change required.

## Tech stack

- **Frontend:** Vite + React 18 + TypeScript, Tailwind + shadcn/ui,
  framer-motion, lucide-react, React Three Fiber (+ drei + postprocessing),
  recharts, zustand, @tanstack/react-query, react-router-dom.
- **Backend:** FastAPI + Uvicorn, Pydantic models (the data contract), JWT auth,
  mock data in `backend/app/mock/*.json`.

## Run with Docker (recommended)

```bash
docker compose up --build
```

- Frontend → http://localhost:3000
- Backend  → http://localhost:8000 (docs at `/docs`)

## Run locally (dev)

### Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate   |   *nix: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Health check: `GET http://localhost:8000/api/v1/health` → `{"status":"ok"}`.

### Frontend

```bash
cd frontend
npm install      # (pnpm also works if available)
npm run dev      # http://localhost:5173
```

The dev frontend expects the backend at `http://localhost:8000`
(`frontend/.env` → `VITE_API_BASE`).

## Data contract

All endpoints live under `/api/v1`. The Pydantic models in
`backend/app/models.py` and the TypeScript types in `frontend/src/lib/types.ts`
mirror each other — this is the integration boundary with the external n8n and
pentest-tool teams. **Keep the shapes stable.**

| Endpoint | Method | Role | Purpose |
|----------|--------|------|---------|
| `/auth/login` | POST | — | Issue JWT `{token, role, username}` |
| `/health` | GET | — | Liveness |
| `/overview` | GET | any | Telemetry dashboard data |
| `/ai-court/stats` | GET | any | FP auto-closed + TP shown |
| `/ai-court/cases` | GET | any | True-positive case feed |
| `/ai-court/cases/{id}` | GET | any | Case detail + tribunal + recommendation |
| `/rules` | GET | any | Proposed KQL rules |
| `/rules/{id}` | GET | any | Rule detail + KQL |
| `/rules/{id}` | PUT | admin | Edit rule |
| `/rules/{id}/approve` | POST | admin | Approve (stored only) |
| `/rules/{id}/reject` | POST | admin | Reject — `reason` required |
| `/pentest/tactics` | GET | any | MITRE tactics |
| `/pentest/techniques?tactic=` | GET | any | Techniques for a tactic |
| `/pentest/runs` | POST | admin | Launch run |
| `/pentest/runs/{id}` | GET | any | Run progress + findings + AI analysis |

## Notes

- Mock responses add 100–400 ms latency jitter so loading states feel real.
- `prefers-reduced-motion` is respected — shaders, particles, and camera motion
  are reduced/disabled.
- The n8n workflows and the AGI pentest engine are **out of scope** — this repo
  is the web platform + mock-then-real BFF only.

### Deviation from the original brief

- The brief specifies `pnpm`; this build uses **npm** (pnpm was not installed on
  the build machine). `npm install` / `npm run dev` work identically. Swap to
  pnpm freely if preferred.
