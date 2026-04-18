# MapWork

MapWork is a workforce location intelligence app that lets users upload branch/workforce data (Excel/CSV), geocode locations, and visualize global branch distribution on an interactive map.

## Why This Project Exists

Teams often have people and branches distributed across cities, states, and countries, but their data is usually stored in spreadsheets. MapWork converts those records into map coordinates so operations, leadership, and planning teams can quickly understand geographic spread, branch health, and regional concentration.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Leaflet
- Backend: FastAPI, Pandas, Scikit-learn, Joblib
- Data: CSV/Excel inputs, model artifacts (`tfidf.pkl`, `nn.pkl`, `index.parquet`)
- Optional persistence: Supabase

## Color DFD (Level 0)

```mermaid
flowchart LR
  U[User] -->|Upload Excel/CSV| FE[Frontend App]
  FE -->|POST /upload-excel| API[FastAPI Backend]
  API -->|Predict coordinates| GEO[Geocoder Engine]
  GEO -->|Read model/index| ART[(Artifacts Store)]
  API -->|JSON with latitude/longitude| FE
  FE -->|Render markers| MAP[Interactive Map]

  classDef ext fill:#ffd166,stroke:#8a5a00,color:#1f1f1f,stroke-width:2px
  classDef app fill:#4cc9f0,stroke:#0b4f6c,color:#06202f,stroke-width:2px
  classDef svc fill:#90be6d,stroke:#2d6a4f,color:#102a12,stroke-width:2px
  classDef data fill:#f28482,stroke:#9d0208,color:#3a0b0b,stroke-width:2px

  class U ext
  class FE,MAP app
  class API,GEO svc
  class ART data
```

## Color DFD (Level 1 - Upload and Geocode Flow)

```mermaid
flowchart TD
  U1[User selects file] --> P1[UploadPanel sends file]
  P1 --> P2[Backend validates extension]
  P2 --> P3[Parse CSV/XLSX into DataFrame]
  P3 --> P4[Normalize City/State/Country]
  P4 --> P5[Geocoder.predict_one for each row]
  P5 --> D1[(Model Artifacts)]
  P5 --> P6[Build enriched rows]
  P6 --> P7[Return JSON response]
  P7 --> P8[MapView filters valid coords]
  P8 --> P9[Leaflet renders markers/popups]

  classDef user fill:#ffb703,stroke:#9a6700,color:#2d1b00,stroke-width:2px
  classDef process fill:#8ecae6,stroke:#005f73,color:#042c33,stroke-width:2px
  classDef datastore fill:#e5989b,stroke:#6d0019,color:#2b0a12,stroke-width:2px

  class U1 user
  class P1,P2,P3,P4,P5,P6,P7,P8,P9 process
  class D1 datastore
```

## UML Use Case Diagram

```mermaid
flowchart LR
  User((User))
  Admin((Admin))

  UC1([Sign In / Use Dev Auth])
  UC2([Upload Workforce File])
  UC3([Geocode Locations])
  UC4([View Interactive Map])
  UC5([Inspect Branch Popups])
  UC6([View Dashboard KPIs])

  User --- UC1
  User --- UC2
  User --- UC4
  User --- UC5

  Admin --- UC1
  Admin --- UC2
  Admin --- UC3
  Admin --- UC4
  Admin --- UC6

  UC2 --> UC3
  UC3 --> UC4

  classDef actor fill:#ffd166,stroke:#8a5a00,color:#1f1f1f,stroke-width:2px
  classDef usecase fill:#bde0fe,stroke:#1d3557,color:#0b1f33,stroke-width:2px

  class User,Admin actor
  class UC1,UC2,UC3,UC4,UC5,UC6 usecase
```

## UML Class Diagram (Core Backend + Frontend Data Model)

```mermaid
classDiagram
  class GeoCoder {
    +vec
    +nn
    +idx
    +predict_one(city, state, country, k)
    +_predict_fallback(city, state, country)
  }

  class RowIn {
    +city: str
    +state: str
    +country: str
    +employees: float
    +branches: float
    +meta: dict
  }

  class API {
    +predict_rows(rows)
    +upload_excel(file)
  }

  class UploadPanel {
    +handleUpload(file)
    +onDataLoaded(points)
  }

  class MapView {
    +points: Point[]
    +renderMarkers()
  }

  class Point {
    +lat: number
    +lng: number
    +city: string
    +state: string
    +country: string
    +confidence: number
  }

  API --> GeoCoder : uses
  API --> RowIn : validates
  UploadPanel --> API : calls
  UploadPanel --> Point : maps response
  MapView --> Point : renders

  classDef backend fill:#95d5b2,stroke:#1b4332,color:#081c15,stroke-width:2px
  classDef frontend fill:#a2d2ff,stroke:#1d3557,color:#0b1f33,stroke-width:2px
  classDef model fill:#ffafcc,stroke:#780000,color:#2d0000,stroke-width:2px

  class GeoCoder,RowIn,API backend
  class UploadPanel,MapView frontend
  class Point model
```

## UML Sequence Diagram (Upload to Plot)

```mermaid
sequenceDiagram
  autonumber
  actor User
  participant UI as UploadPanel
  participant API as FastAPI /upload-excel
  participant G as GeoCoder
  participant M as MapView

  User->>UI: Select and upload file
  UI->>API: multipart/form-data
  API->>API: Parse DataFrame rows
  loop For each row
    API->>G: predict_one(city, state, country)
    G-->>API: lat, lon, confidence, matches
  end
  API-->>UI: enriched rows JSON
  UI->>M: setPoints(parsed rows)
  M-->>User: Render markers and popups

  Note over API,G: Fallback matching is used if ML artifacts fail
```

## UML Component View

```mermaid
flowchart LR
  subgraph Frontend
    A[UploadPanel]
    B[MapView]
    C[Dashboard]
    D[Auth Hook]
  end

  subgraph Backend
    E[FastAPI Main]
    F[GeoCoder Service]
  end

  subgraph Data
    G[(Excel/CSV Input)]
    H[(Model Artifacts)]
    I[(Supabase Optional)]
  end

  G --> A
  A --> E
  E --> F
  F --> H
  E --> I
  E --> B
  B --> C
  D --> A

  classDef fe fill:#caffbf,stroke:#386641,color:#1b4332,stroke-width:2px
  classDef be fill:#9bf6ff,stroke:#005f73,color:#003049,stroke-width:2px
  classDef ds fill:#ffc6ff,stroke:#6a4c93,color:#2d1e4f,stroke-width:2px

  class A,B,C,D fe
  class E,F be
  class G,H,I ds
```

## Run Instructions

### Backend

```powershell
cd backend
python -m uvicorn main:app --reload --port 8000
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

- Frontend: http://localhost:5173
- Backend docs: http://127.0.0.1:8000/docs

## Notes

- If the geocoding model artifacts and scikit-learn versions differ, warnings may appear.
- The backend now includes fallback geocoding logic to avoid hard crashes on prediction.
