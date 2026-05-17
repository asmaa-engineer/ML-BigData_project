# API Reference

## Base

Local development base URL:

`http://localhost:3000`

All AI routes are server-side. The browser never receives the Gemini API key.

---

## `GET /api/health`

Purpose:
quick service heartbeat

Response shape:

```json
{
  "status": "ok",
  "env": "development",
  "active": true,
  "dbConfigured": false,
  "aiConfigured": true,
  "timestamp": "2026-05-16T10:00:00.000Z"
}
```

---

## `GET /api/data`

Purpose:
load dashboard business data

Response fields:

- `products`
- `sales`
- `quality`
- `productMap`
- `source`

`source` is either:

- `postgres`
- `mock`

---

## `GET /api/readiness`

Purpose:
populate the Project Readiness section

Response shape:

```json
{
  "env": "development",
  "active": true,
  "dataSource": "mock",
  "dbConfigured": false,
  "dbStatus": "demo",
  "aiConfigured": false,
  "aiStatus": "fallback",
  "modelStatus": "Heuristic threshold model active (demo-ready)",
  "lastSync": "2026-05-16T10:00:00.000Z",
  "records": {
    "products": 20,
    "sales": 5200,
    "quality": 4200
  }
}
```

---

## `POST /api/ai/explain`

Purpose:
explain a defect prediction result

Request body:

```json
{
  "inputs": {
    "weight": 25.5,
    "length": 50,
    "thickness": 8.5,
    "temperature": 65
  },
  "prob": 0.41,
  "isDefect": true
}
```

Response:

```json
{
  "text": "Explanation text",
  "source": "gemini"
}
```

`source` may be `fallback` if Gemini is unavailable.

---

## `POST /api/ai/quadrant-insight`

Purpose:
generate a strategic plan for high-risk products

Request body:

```json
{
  "highRiskProducts": ["Product 3", "Product 7"]
}
```

Response:

```json
{
  "text": "Action plan text",
  "source": "fallback"
}
```

---

## `POST /api/ai/executive-summary`

Purpose:
generate a KPI-level executive summary

Request body:

```json
{
  "totalRev": 125000,
  "defectRate": 12.4,
  "modelAccuracy": 88.7
}
```

Response:

```json
{
  "text": "Executive summary text",
  "source": "gemini"
}
```

---

## `POST /api/ai/copilot-chat`

Purpose:
chat with the operational copilot in Arabic

Request body:

```json
{
  "userMessage": "أكثر المنتجات مبيعًا",
  "salesCount": 5200,
  "qualityCount": 4200
}
```

Response:

```json
{
  "text": "Arabic answer",
  "source": "fallback"
}
```

Behavior:

- if Gemini is configured and available, the response is AI-generated
- if Gemini is unavailable, the backend returns a deterministic fallback based on current data

---

## `GET /api/ml/status`

Purpose:
load model artifact readiness and evaluation metrics

Response:

```json
{
  "artifactReady": true,
  "metricsReady": true,
  "report": {
    "model_name": "RandomForestClassifier",
    "accuracy": 78.08,
    "precision": 49.39,
    "recall": 59.72,
    "f1": 54.07,
    "roc_auc": 78.05,
    "train_rows": 20000,
    "test_rows": 5000,
    "threshold": 0.5
  }
}
```

---

## `POST /api/ml/predict`

Purpose:
run backend-served ML inference using the exported Python artifact

Request body:

```json
{
  "weight": 25.5,
  "length": 50,
  "thickness": 8.5,
  "temperature": 65
}
```

Response:

```json
{
  "probability": 0.31,
  "isDefect": false,
  "threshold": 0.5,
  "modelSource": "random_forest_artifact"
}
```

Fallback:

- if the artifact or Python runtime path fails, the backend returns a heuristic fallback response instead of hard failing

---

## `GET /api/actions/log`

Purpose:
load action history for enterprise audit views

Response:

```json
{
  "items": [
    {
      "id": "ACT-1",
      "area": "yield",
      "action": "Pricing update",
      "target": "Product 4",
      "detail": "Pricing update requested from Yield Management for Product 4.",
      "createdAt": "2026-05-16T10:00:00.000Z"
    }
  ]
}
```

---

## `POST /api/actions/log`

Purpose:
record manual or recommended operational actions

Request body:

```json
{
  "area": "maintenance",
  "action": "Schedule preventive maintenance",
  "target": "Line Gamma",
  "detail": "Preventive maintenance requested from predictive maintenance panel."
}
```

Response:

```json
{
  "item": {
    "id": "ACT-2",
    "area": "maintenance",
    "action": "Schedule preventive maintenance",
    "target": "Line Gamma",
    "detail": "Preventive maintenance requested from predictive maintenance panel.",
    "createdAt": "2026-05-16T10:02:00.000Z"
  }
}
```
