# Smart Commerce & Production Analytics

## Project Plan and UML Pack

This file combines:

- delivery plan
- technical roadmap
- UML and architecture diagrams

The diagrams are written in `Mermaid` so they can be rendered directly in Markdown viewers that support Mermaid.

---

## 1. Delivery Plan

### Phase 1: Foundation

Goal:
Make the current system technically clean and presentation-ready.

Tasks:

- fix TypeScript issues in backend handlers
- remove hardcoded KPIs where possible
- improve loading, empty, and error states
- add `.env.example`
- add test coverage for analytics and API payload validation
- improve README and discussion docs

Expected output:

- stable demo
- cleaner code quality
- stronger graduation-project presentation

### Phase 2: Product Readiness

Goal:
Improve realism and traceability of the platform.

Tasks:

- add action log persistence
- add readiness/health dashboard
- persist user actions from yield management
- improve AI response metadata
- expose actual data-source badge across UI

Expected output:

- stronger operational credibility
- clearer distinction between simulation and real backend features

### Phase 3: Intelligent Operations

Goal:
Move from analytics-only to monitored decision support.

Tasks:

- real-time updates with WebSocket or SSE
- persistent anomaly events
- real maintenance records
- real rule engine for operational actions
- production-grade ML retraining on real datasets

Expected output:

- near-real industrial monitoring experience

### Phase 4: Enterprise Extension

Goal:
Evolve the prototype into a scalable platform concept.

Tasks:

- authentication and RBAC
- audit log system
- external integrations
- distributed Kafka/Spark/BigQuery architecture
- model registry and scheduled retraining

Expected output:

- enterprise-ready architecture path

---

## 2. Use Case Diagram

```mermaid
flowchart LR
    Executive[Executive / Director]
    Quality[Quality Manager]
    Supervisor[Production Supervisor]
    Analyst[Business Analyst]

    System((Smart Commerce & Production Analytics))

    Executive --> System
    Quality --> System
    Supervisor --> System
    Analyst --> System

    System --> UC1[View executive KPIs]
    System --> UC2[Analyze sales]
    System --> UC3[Analyze defect rates]
    System --> UC4[Correlate revenue and quality]
    System --> UC5[Run defect prediction]
    System --> UC6[Ask AI Copilot]
    System --> UC7[Monitor live operations]
    System --> UC8[Review maintenance risk]
    System --> UC9[Review enterprise automations]
```

---

## 3. High-Level Component Diagram

```mermaid
flowchart TB
    User[User Browser]

    subgraph Frontend[Frontend - React/Vite]
        App[App.tsx]
        Store[Zustand Store]
        Pages[Dashboard Pages]
        AIClient[AI Service Client]
    end

    subgraph Backend[Backend - Express]
        API[REST API]
        Validation[Zod Validation]
        Fallback[Fallback Logic]
        Repo[Analytics Repository]
        MLBridge[Python ML Bridge]
    end

    subgraph Data[Data Layer]
        DB[(PostgreSQL / Supabase)]
        Mock[Mock Data Generator]
    end

    subgraph ML[ML Runtime]
        Dataset[Training Dataset CSV]
        Trainer[Python Training Script]
        Artifact[RandomForest Artifact]
        Report[Evaluation Report]
    end

    subgraph AI[AI Layer]
        Gemini[Google Gemini API]
    end

    User --> App
    App --> Store
    App --> Pages
    Pages --> Store
    Pages --> AIClient
    Store --> API
    AIClient --> API
    API --> Validation
    API --> Repo
    API --> Fallback
    API --> MLBridge
    Repo --> DB
    API --> Mock
    MLBridge --> Artifact
    MLBridge --> Report
    Trainer --> Dataset
    Trainer --> Artifact
    Trainer --> Report
    API --> Gemini
```

---

## 4. Data Flow Diagram

```mermaid
flowchart LR
    F1[Frontend Load] --> S1[GET /api/data]
    S1 --> B1[Express Backend]
    B1 --> D1{DB Configured?}
    D1 -->|Yes| D2[Query PostgreSQL]
    D1 -->|No| D3[Use Mock Data]
    D2 --> R1[Build Analytics Payload]
    D3 --> R1
    R1 --> F2[Zustand Store Updated]
    F2 --> F3[Pages Render Charts and KPIs]
```

---

## 5. AI Interaction Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as Express Backend
    participant AI as Gemini API
    participant FB as Fallback Logic

    U->>FE: ask question / request explanation
    FE->>BE: POST /api/ai/*
    BE->>BE: validate payload with zod
    BE->>AI: generate content
    alt AI success
        AI-->>BE: text response
        BE-->>FE: AI text + source=gemini
    else AI quota or permission issue
        BE->>FB: generate fallback answer
        FB-->>BE: deterministic text
        BE-->>FE: fallback text + source=fallback
    end
    FE-->>U: render response
```

---

## 6. Entity Relationship Diagram

```mermaid
erDiagram
    PRODUCTS ||--o{ SALES : referenced_by
    PRODUCTS ||--o{ QUALITY_INSPECTIONS : referenced_by

    PRODUCTS {
        string id PK
        string name
        string category
        decimal base_price
    }

    SALES {
        string id PK
        datetime sale_ts
        string product_id FK
        int quantity
        decimal revenue
        string customer_segment
        int sale_hour
        string day_of_week
    }

    QUALITY_INSPECTIONS {
        string id PK
        datetime inspection_ts
        string product_id FK
        string line_id
        decimal weight
        decimal length
        decimal thickness
        decimal temperature
        boolean is_defect
    }
```

---

## 7. Page Navigation Map

```mermaid
flowchart TD
    App[App Shell]
    Sidebar[Sidebar Navigation]

    App --> Sidebar
    Sidebar --> Home[Home]
    Sidebar --> Sales[Sales Analytics]
    Sidebar --> Quality[Quality Analytics]
    Sidebar --> Bridge[Bridge and Quadrants]
    Sidebar --> RootCause[Root Cause Analysis]
    Sidebar --> Model[Defect Prediction]
    Sidebar --> Live[Live Operations]
    Sidebar --> Maintenance[Predictive Maintenance]
    Sidebar --> Yield[Yield Management]
    Sidebar --> Enterprise[Enterprise Hub]
    Sidebar --> Copilot[AI Copilot]
```

---

## 8. Deployment Diagram

```mermaid
flowchart TB
    Browser[Client Browser]
    Server[Node.js Server]
    Static[Built Frontend Assets]
    API[Express API Layer]
    Postgres[(PostgreSQL / Supabase)]
    Gemini[Gemini API]
    PythonML[Python ML Runtime]

    Browser --> Server
    Server --> Static
    Server --> API
    API --> Postgres
    API --> Gemini
    API --> PythonML
```

---

## 9. Distributed Next Phase Architecture

```mermaid
flowchart LR
    Orders[E-commerce Orders] --> Kafka[(Kafka)]
    Sensors[IoT Sensor Events] --> Kafka
    ERP[ERP / MES Events] --> Kafka

    Kafka --> SparkStream[Spark Structured Streaming]
    Kafka --> Lake[Object Storage / Data Lake]

    Lake --> SparkBatch[Spark Batch ETL]
    SparkBatch --> BigQuery[(BigQuery Warehouse)]

    BigQuery --> Dashboard[Serving Aggregates for Dashboard]
    BigQuery --> Retraining[ML Retraining Jobs]
    Retraining --> Registry[Model Registry]
    Registry --> Inference[Online Inference Service]
```

---

## 10. Current Technical Status

### Implemented

- multi-page analytics frontend
- backend API layer
- DB schema and seed scripts
- AI integration with fallback handling
- chart-driven analytics views
- trained RandomForest model artifact with backend inference endpoint
- evaluation report for ML metrics
- ETL expansion and batch aggregation demo scripts
- enterprise extension concept pages

### Partially Implemented or Simulated

- live IoT stream is simulated
- predictive maintenance is simulated
- enterprise automations are visual prototypes
- root-cause tree is a conceptual model

### Not Yet Implemented

- authentication
- persistent audit trail
- persistent action engine
- real streaming transport
- distributed warehouse deployment
- real factory data retraining pipeline

---

## 11. Recommended Discussion Language

When discussing the project, use this framing:

- `implemented`
  for features that are fully wired to the current stack

- `simulated to demonstrate architecture`
  for live streaming, predictive maintenance, and some advanced decision flows

- `prototype ML implementation`
  for the trained model built on synthetic labeled data

- `distributed next phase`
  for Kafka, Spark, BigQuery, and large-scale serving architecture

This prevents overclaiming while still presenting a strong technical vision.

---

## 12. Suggested Next Implementation Plan

The best next implementation order is:

1. fix backend TypeScript issues
2. add `.env.example`
3. add project readiness page
4. replace hardcoded KPI values with computed values
5. add tests for analytics and API validation
6. add persistent action log and action history UI
7. add deployment and demo notes

This order improves both code quality and discussion quality quickly.
