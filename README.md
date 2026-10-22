# Urban Health Monitoring System (UHMS)

**An interactive demonstration prototype for local air, noise, and traffic monitoring with adaptive commuter routing**

| | |
| --- | --- |
| Project title | Urban Health Monitoring System |
| Nature of work | College project demonstration prototype (Phase 2) |
| Author | Aayush Sharda |
| Docker Hub account | [aayushdevelops](https://hub.docker.com/u/aayushdevelops) |
| Published image | [aayushdevelops/urban_health_monitoring_system](https://hub.docker.com/r/aayushdevelops/urban_health_monitoring_system) |
| How to open the running demo | `docker pull aayushdevelops/urban_health_monitoring_system:latest` then `docker run -d -p 8080:80 --name urban_health_monitoring_system aayushdevelops/urban_health_monitoring_system:latest` then visit **http://localhost:8080** |
| Runtime | Browser single-page application; production image served by Nginx |
| Data | Entirely simulated (no live sensors, no external APIs) |
| License | MIT License, Copyright (c) 2026 Aayush170605 |

This README is written so a reader who has never seen the source code can understand the problem, the design, the mathematics, how to run the software, and what the demonstration is allowed to claim. Nothing in this document is left for the student to complete later.

---

## 1. Abstract

Urban travellers at busy junctions experience air pollution, acoustic noise, and traffic delay together, yet these quantities are usually published in separate systems and at city-wide rather than street-level resolution. The Urban Health Monitoring System is a browser-based prototype that places four named North Bengaluru hotspots on one dashboard, computes a disclosed composite called the **Urban Stress Index**, and animates a commuter who abandons a jammed corridor in favour of a cleaner parallel street.

The four stations are Bagalur Cross (UHMS-01), Phoenix Mall of Asia entry/exit gate and service road (UHMS-02), Near Galleria Mall (UHMS-03), and Hebbal Flyover entry (UHMS-04). The map is a schematic grid, not a geographic information system. All readings are synthetic fixtures with a deterministic time variation, so the demonstration is repeatable in a classroom without network access.

The finished artefact is also packaged as a Docker image, `aayushdevelops/urban_health_monitoring_system:latest`, so the same build can be started on any machine that has Docker installed.

---

## 2. Problem statement

Rapid urbanisation concentrates vehicles, freight, and pedestrians at a small number of junctions and mall access roads. Three practical failures follow.

**Fragmented sensing.** Air quality indexes, noise studies, and traffic counts are collected by different agencies, on different clocks, and displayed in different applications. A person standing at a junction cannot see the combination of hazards that actually define that minute of exposure.

**Wrong spatial scale.** A single city AQI number averages over a large area. It does not describe the spike caused by a 200-metre idle queue at one intersection, nor the quieter parallel road two blocks away.

**Static advice while the bottleneck moves.** Congestion and pollution are not fixed at one “worst junction” all morning. When the jam relocates, a route that was healthy a few minutes earlier can become the worst path. Without a local, updating view, commuters continue along the direct but polluted street.

The prototype therefore answers a concrete question:

> If four traffic hotspots were monitored together for air, noise, and congestion, and if the street network offered more than one path between them, could a dashboard show a commuter *which corridor to avoid right now* and *which cleaner corridor to take instead*, including after the hotspot itself has moved?

The software does not claim to be an operational city platform. It is a teaching prototype that makes that question visible.

---

## 3. Project background and scope

Work is organised in two phases, matching the project presentations.

**Phase 1 (context, not implemented as live data).** Urbanisation, delayed response, disconnected environmental data, and a broad monitoring ambition covering air, water, noise, and disease surveillance. Stakeholders named in that phase include city government, hospitals and clinics, environmental agencies, and residents. Risks noted there include privacy, sensor cost, system integration, and public trust.

**Phase 2 (what this repository actually builds).** A four-location demonstration focused on **air quality, acoustic noise, and traffic** at named North Bengaluru sites, plus a location-and-time-specific composite index. The intended immediate users are commuters, nearby residents, and roadside workers. Water quality readings, patient records, and outbreak counts are **not** invented to fill the screen; they are described only as future extensions.

**In scope**

- Four named stations with full labels preserved in the UI, table, and CSV.
- Simulated air (AQI, PM2.5, PM10, CO), noise (LAeq and supporting statistics, honks), traffic (count, speed, queue, wait), and weather context (temperature, humidity).
- A disclosed Urban Stress Index with inspectable component scores.
- An interconnected fictional street grid and a live commuter animation that reroutes when a station is jammed.
- Three scenario presets (Baseline, Rush hour, Improved conditions).
- Playback controls, map layers, alerts, comparison table, and CSV export.
- A production Docker image that serves the built static application.

**Out of scope**

- Live hardware, government APIs, or paid map tiles.
- Real geographic coordinates or OpenStreetMap/Google Maps.
- User accounts, databases, or a backend server.
- Machine-learning prediction of the next jam.
- Clinical diagnosis, personal health scoring, or epidemiological validation of the index.
- Water quality, pathogen surveillance, or hospital occupancy.

---

## 4. Contribution

Individual air-quality sensors, noise meters, and traffic cameras already exist. The contribution of this prototype is **integration and explanation at the scale of a junction**, not a new physical sensor:

1. One screen that keeps air, noise, and traffic consistent for the same station at the same simulated time.
2. A composite index whose weights are shown in the interface (45% air, 35% noise, 20% traffic), so a reviewer can audit the score instead of treating it as a black box.
3. A street network with parallel corridors, so “avoid this hotspot” is paired with a concrete alternate path.
4. A demonstration that the hotspot **moves**, and that the recommended detour therefore also changes.

The Urban Stress Index characterises **environmental conditions at a place and time**. It is not a diagnosis of any person’s physical or psychological state.

---

## 5. Intended users and how they use the demo

| User | What they should see in a viva |
| --- | --- |
| Commuter | The jammed station, the red abandoned path, and the green detour with lower AQI, noise, and queue |
| Nearby resident | Which of the four sites is currently ranked `#1 Peak Stress` |
| Roadside worker | High noise, long queues, and alert text at the jammed junction |
| Environmental officer | Side-by-side table of four stations and a CSV snapshot |
| Examiner | Repeatable Start / Pause / Step / Reset, layer switching, scenario change, and the formula disclosure panel |

There is no login. Opening the application shows a populated dashboard immediately. The header permanently labels the data as **Demo data**.

---

## 6. How an examiner should run the project

The recommended path for a professor is Docker. It does not require Node.js, npm, or knowledge of the source tree.

### 6.1 Fastest path: image already published on Docker Hub

Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows, macOS, or Linux). In a terminal:

```bash
docker pull aayushdevelops/urban_health_monitoring_system:latest
docker run -d -p 8080:80 --name urban_health_monitoring_system aayushdevelops/urban_health_monitoring_system:latest
```

Open a browser at **http://localhost:8080**.

If port 8080 is already in use, map another host port, for example `9090:80`, and open http://localhost:9090.

**Stop the running demonstration**

```bash
docker stop urban_health_monitoring_system
```

**Start the same container again**

```bash
docker start urban_health_monitoring_system
```

**Remove the stopped container** (the image remains on disk)

```bash
docker rm urban_health_monitoring_system
```

In Docker Desktop the same actions are **Containers → Stop**. Deleting the row on the **Images** page deletes the software itself and is not required merely to end a demo.

If the Hub repository is private, sign in with an account that has been granted pull access. For unrestricted classroom sharing the Hub repository should be set to **Public**.

### 6.2 Run from this repository with Docker Compose

```bash
docker compose up -d --build
```

The compose file builds from the root `Dockerfile`, names the container `urban_health_monitoring_system`, and publishes port **8080**. Stop with `docker compose down`.

### 6.3 Load a saved archive (no Docker Hub)

On a machine that already has the image:

```bash
docker save -o urban_health_monitoring_system.tar aayushdevelops/urban_health_monitoring_system:latest
```

On the examiner’s machine:

```bash
docker load -i urban_health_monitoring_system.tar
docker run -d -p 8080:80 --name urban_health_monitoring_system aayushdevelops/urban_health_monitoring_system:latest
```

The helper script `docker-build.sh` at the repository root rebuilds the image and writes this `.tar` file. `docker-run.sh` starts the container on port 8080.

### 6.4 Local development (optional; for reading the code)

Requires **Node.js 20.19+ or 22.12+ LTS** and **npm 10+**.

```bash
cd urban-health-monitor
npm install
npm run dev
```

The Vite development server is **http://localhost:5173**.

| Script | Purpose |
| --- | --- |
| `npm run dev` | Hot-reload development server |
| `npm run build` | TypeScript check (`tsc --noEmit`) and production bundle |
| `npm run preview` | Serve the production `dist/` folder locally |
| `npm run lint` | ESLint |

The production Docker image does not run Node.js at request time. Stage 1 compiles the React application; stage 2 copies the static files into Nginx and listens on container port 80.

---

## 7. Suggested 3-minute examination path

The application contains a **3-Minute Presentation Guide** in the header. An examiner who prefers to operate the demo personally can follow this sequence.

**Minute 0:00–0:45 — context.** Identify the four labelled stations. Point out that the grid has several east–west and north–south corridors, so a blocked junction still leaves an alternate street. Note the Demo data badge.

**Minute 0:45–1:30 — index and layers.** Click **Bagalur Cross**. In the detail panel open **How is this score calculated?** The bars show air 45%, noise 35%, traffic 20%. Switch map tabs through Air Quality Index, Noise Level, PM2.5, PM10, Queue / Traffic, and Stress Index. Every marker updates from the same underlying reading; the views are not separate random numbers.

**Minute 1:30–2:30 — live rerouting.** Press **Start**. The motorcycle leaves the red direct path at the jammed station and follows the green detour. With **Auto-Shift: ON** (the default), completing a loop moves the jam to the next hotspot. The ranking bar, alerts, barriers, and route-comparison card all change together. The four buttons **1. Bagalur Jam**, **2. Galleria Jam**, **3. Phoenix Jam**, **4. Hebbal Jam** jump to a chosen bottleneck immediately if a specific round is requested.

**Minute 2:30–3:00 — evidence and reset.** Scroll to **Adaptive Commuter Health Navigation**. The left column is the abandoned direct path; the right column is the chosen detour. Click **Export current readings** to download a CSV of the four stations. Press **Reset** before questions so the clock returns to the 09:00 IST baseline.

Additional controls: **Pause**, **Step** (advance five simulated minutes), and the scenario menu **Baseline / Rush hour / Improved conditions**.

---

## 8. Monitoring stations

Names are taken from the project brief. Coordinates are presentation geometry on a 1000 × 640 canvas. They are **not** surveyed positions of the real roads.

| Station label | Full name (as shown in the UI) | Internal id | Type | Canvas position | Intended character |
| --- | --- | --- | --- | --- | --- |
| UHMS-01 | Bagalur Cross | `bagalur-cross` | Major junction corridor | x=240, y=180 | Freight, transit and commuter mix; default Round 1 jam |
| UHMS-02 | Phoenix Mall of Asia entry/exit gate, service road | `phoenix-mall` | Mall access / service road | x=720, y=180 | Ride-share and visitor queues; Round 3 jam |
| UHMS-03 | Near Galleria Mall | `galleria-mall` | Mall surroundings and arterial | x=240, y=460 | Stop-and-go commercial idling; Round 2 jam |
| UHMS-04 | Hebbal Flyover entry | `hebbal-flyover` | Flyover approach corridor | x=720, y=460 | Faster flow and usually the cleanest site; Round 4 jam |

### 8.1 Baseline snapshot (scenario = Baseline, jam = Bagalur Cross)

These are the fixture values at simulated 09:00 IST on 21 October 2026. During playback they oscillate smoothly around the fixture; they are not redrawn at random in each widget.

| Parameter | Bagalur Cross | Near Galleria Mall | Phoenix Mall of Asia | Hebbal Flyover entry |
| --- | ---: | ---: | ---: | ---: |
| AQI | 248 | 185 | 135 | 78 |
| PM2.5 (µg/m³) | 104 | 78 | 68 | 35 |
| PM10 (µg/m³) | 215 | 145 | 120 | 60 |
| CO (mg/m³) | 1.8 | 1.2 | 0.9 | 0.5 |
| Noise LAeq (dB(A)) | 82.5 | 76.5 | 70.0 | 62.0 |
| Honks per minute | 18 | 12 | 9 | 4 |
| Vehicles in one minute | 68 | 52 | 40 | 26 |
| Mean speed (km/h) | 12 | 18 | 22 | 32 |
| Queue length (m) | 220 | 140 | 95 | 45 |
| Waiting time (s) | 160 | 110 | 75 | 35 |
| Temperature (°C) | 32 | 31 | 30 | 28 |
| Humidity (%) | 55 | 58 | 60 | 65 |

When another station is selected as the jam, a different fixture table is loaded so that station becomes the worst on every metric that the ranking uses. That is how “the hotspot moves” without requiring a physics simulation of the whole city.

---

## 9. Street network (why detours exist)

The map is an orthogonal grid of named corridors. Because junctions are connected by more than one street, abandoning a jammed arm is always possible in the demonstration.

**East–west corridors**

| Name | Approximate y | Role |
| --- | --- | --- |
| North Arterial | 180 | Direct link Bagalur Cross ↔ Phoenix Mall |
| Central Park Bypass | 320 | Lower-emission corridor beside parks; primary Round 1 detour |
| South Parkway | 460 | Direct link Galleria Mall ↔ Hebbal Flyover |

**North–south corridors**

| Name | Approximate x | Role |
| --- | --- | --- |
| Outer West Lane | 100 | Western relief |
| West Connector Link | 175 | Secondary western link |
| West Link Corridor | 240 | Commercial street through Bagalur and Galleria |
| Mid-West Eco Avenue | 360 | Park-side alternative |
| Central Avenue Arterial | 480 | High-capacity median; primary Round 2 detour |
| Mid-East Botanical Link | 600 | Eastern eco link |
| East Corridor | 720 | Phoenix / Hebbal connector |
| Outer East Expressway | 880 | Peripheral bypass; used in Rounds 3 and 4 |

The motorcycle follows a loop on this grid. Roadblock markers appear on the jammed approach. The chosen detour is drawn as a highlighted clean path.

---

## 10. Dynamic rerouting across four rounds

The pedagogical point is that a single “avoid Bagalur forever” rule is insufficient. Each completed rider loop (when Auto-Shift is on) advances the jam.

| Round | Jammed station | Direct path that is abandoned | Detour that is chosen | What the comparison card emphasises |
| :---: | --- | --- | --- | --- |
| 1 | Bagalur Cross | North Arterial into the multi-arm junction | Central Park Bypass Avenue (y=320) | Avoids the industrial/traffic convergence and idling |
| 2 | Near Galleria Mall | West Link into the mall parking gridlock | Central Avenue Arterial (x=480) | Avoids parking spillover and pedestrian conflict |
| 3 | Phoenix Mall of Asia | North Arterial through the service-road drop-off | Central Avenue then Outer East Expressway (x=880) | Avoids ride-share and delivery queues |
| 4 | Hebbal Flyover entry | South Parkway into the ramp merge | Central Avenue and Outer Expressway | Avoids the elevated-highway approach bottleneck |

On the comparison card, detour AQI is shown as 35% of the jammed station’s AQI, detour noise as the jammed LAeq minus 18.5 dB(A), and detour queue as 0 m. Those three numbers are **illustrative teaching contrasts** derived from the jammed reading. They are not measurements from a second set of physical sensors on the bypass.

Headline benefit figures used in the viva (approximately 60–68% lower AQI on the detour, about 18 dB quieter, idle queue removed) follow from those same display rules. They must be described as demonstration outcomes, not as results of a field campaign.

---

## 11. Urban Stress Index (complete formula)

The index is implemented in `urban-health-monitor/src/utils/analytics.ts` as `computeUrbanStressIndex`. Every term is defined below so the formula can be checked with a calculator.

Let `clamp01(x) = min(1, max(0, x))`.

**Air score** (AQI of 300 maps to 100; higher AQI is capped):

```
airScore = 100 × clamp01(AQI / 300)
```

**Noise score** (45 dB(A) maps to 0; 90 dB(A) maps to 100):

```
noiseScore = 100 × clamp01((LAeq − 45) / (90 − 45))
```

**Traffic score** (wait of 180 s maps to 100; queue of 300 m maps to 100):

```
waitScore    = 100 × clamp01(waitingTimeSeconds / 180)
queueScore   = 100 × clamp01(queueLengthMetres / 300)
trafficScore = 0.60 × waitScore + 0.40 × queueScore
```

**Composite** (weights 0.45 / 0.35 / 0.20):

```
USI = round(0.45 × airScore + 0.35 × noiseScore + 0.20 × trafficScore)
```

Worked example for Bagalur Cross baseline (AQI 248, LAeq 82.5, wait 160 s, queue 220 m):

```
airScore      = 100 × (248 / 300)                 = 82.67
noiseScore    = 100 × ((82.5 − 45) / 45)          = 83.33
waitScore     = 100 × (160 / 180)                 = 88.89
queueScore    = 100 × (220 / 300)                 = 73.33
trafficScore  = 0.60 × 88.89 + 0.40 × 73.33       = 82.67
USI           = round(0.45×82.67 + 0.35×83.33 + 0.20×82.67) = 83
```

The dashboard reports this as Urban Stress Index **83 / 100**, band **High**.

### 11.1 Display bands

**Indian National AQI categories** (used for colour and labels; values above 500 are treated as Severe):

| AQI | Category |
| ---: | --- |
| 0–50 | Good |
| 51–100 | Satisfactory |
| 101–200 | Moderate |
| 201–300 | Poor |
| 301–400 | Very Poor |
| 401–500 | Severe |

**Three-level bands** for other metrics:

| Metric | Low | Elevated | High |
| --- | --- | --- | --- |
| Noise LAeq | < 65 dB(A) | 65–80 dB(A) | ≥ 80 dB(A) |
| PM2.5 | < 30.01 µg/m³ | 30.01–90.01 | ≥ 90.01 |
| PM10 | < 50.01 µg/m³ | 50.01–150.01 | ≥ 150.01 |
| Queue | < 75.01 m | 75.01–150.01 m | ≥ 150.01 m |
| Urban Stress Index | 0–39 | 40–69 | ≥ 70 |

### 11.2 Alert rules

An alert is raised for a station when any of the following holds:

- AQI ≥ 201 (Poor or worse)
- Noise LAeq ≥ 80 dB(A)
- Urban Stress Index ≥ 70

The alert panel lists the triggered conditions in sentences, for example: “AQI 248 is in the Poor/Severe range (≥201)”.

These breakpoints are **demonstration thresholds** chosen so the viva has a clear Poor / High state at the jammed site. They are not a regulatory standard issued by this project.

---

## 12. Scenario presets

The scenario menu multiplies or shifts the current jam’s fixture. Weather (temperature, humidity) is left unchanged so a rush-hour story is not confused with a heat-wave story.

| Quantity | Rush hour | Improved conditions |
| --- | --- | --- |
| AQI | × 1.30, capped at 500 | × 0.65 |
| PM2.5, PM10 | × 1.30 | × 0.65 |
| CO | × 1.20 | × 0.70 |
| All noise statistics | + 5 dB | − 8 dB |
| Honks per minute | × 1.50 | × 0.50 |
| Vehicle count | × 1.20 | × 0.85 |
| Mean speed | × 0.65 | + 10 km/h |
| Queue length and waiting time | × 1.35 | × 0.55 |

After the transform, the same Urban Stress Index and alert rules are applied. Rush hour therefore typically increases the number of High-stress stations; Improved conditions typically clears some alerts.

---

## 13. Simulation engine (why numbers move but stay consistent)

Implemented in `urban-health-monitor/src/services/demoDataProvider.ts`.

- Each **Step** advances **five simulated minutes**.
- The clock starts at **2026-10-21T09:00:00+05:30**.
- History is pre-filled with 13 points covering the previous 60 simulated minutes so the trend chart is never empty.
- Variation around each fixture is **deterministic**: overlaid sine waves with a fixed seed per station and per parameter. Air and traffic fields move by about ±4% of the fixture; noise by ±1.5 dB; temperature by ±0.5 °C; humidity by ±2 percentage points.
- Map markers, ranking cards, the detail panel, the chart, alerts, and the CSV all read from **one** snapshot in shared state. A station that shows AQI 248 on the map cannot show a different current AQI in the table.

This design is deliberate: a classroom demo must be repeatable, and a reviewer must not catch widgets disagreeing with each other.

---

## 14. User interface (what each region is for)

The layout is a single scrolling page.

1. **Header** — title, Demo data badge, 3-minute guide, About this prototype.
2. **Overview cards** — four stations, mean demo AQI (arithmetic mean of the four current AQI values, explicitly *not* an official city AQI), highest AQI and its station, count of stations with alerts.
3. **Dynamic stress ranking** — stations sorted worst to best, with a jammed badge on the active bottleneck. Clicking a card selects that station.
4. **Demo controls** — scenario select, Start / Pause / Step / Reset, simulated clock.
5. **Map** — layer tabs, commuter HUD (active jam, detour name), Auto-Shift, jam buttons, SVG grid, rider, barriers, detour highlight.
6. **Detail panel** — selected station metadata, alert list, AQI and pollutants, noise (with optional Lmax/L10/L90/honks), Urban Stress Index bars, traffic context.
7. **Trend chart** — last 60 simulated minutes for the selected station and metric.
8. **Alerts panel** — current trigger sentences.
9. **Route comparison** — abandoned versus chosen path for the *currently jammed* station.
10. **Comparison table** — all four stations; sortable; **Export current readings** downloads CSV.
11. **Footer** — prototype disclaimer.

**About this prototype** states the problem, the audience, what the software does, the data disclaimer, and Phase 1 future scope (water and disease surveillance).

---

## 15. Software architecture

The system is a **client-only** React application. No application server, database, or cloud function is required at runtime.

```
User interaction (click, Start, scenario, layer)
        │
        ▼
DemoProvider  (React context)
        │
        ▼
demoReducer   (selected station, layer, scenario, jam, playback, clock)
        │
        ▼
demoDataProvider  (fixtures + scenario + deterministic oscillation)
        │
        ▼
analytics.ts  (AQI category, USI, bands, alert sentences)
        │
        ▼
Presentational components (map, cards, chart, table, CSV)
```

| Concern | Location in source |
| --- | --- |
| Station catalogue | `urban-health-monitor/src/data/locations.ts` |
| Baseline and per-jam fixtures | `urban-health-monitor/src/data/baseline.ts` |
| Rush hour / improved transforms | `urban-health-monitor/src/data/scenarios.ts` |
| Clock and readings | `urban-health-monitor/src/services/demoDataProvider.ts` |
| Urban Stress Index and alerts | `urban-health-monitor/src/utils/analytics.ts` |
| AQI and band tables | `urban-health-monitor/src/config/thresholds.ts` |
| Layer and chart labels | `urban-health-monitor/src/config/metrics.ts` |
| Shared state | `urban-health-monitor/src/state/DemoProvider.tsx`, `demoReducer.ts` |
| CSV download | `urban-health-monitor/src/utils/exportCsv.ts` |
| Page composition | `urban-health-monitor/src/App.tsx` |

**Technology choices and why they were used**

| Technology | Role |
| --- | --- |
| React 18 | Component tree and interactive state for a single dashboard |
| TypeScript | Explicit types for readings, locations, scenarios, and metrics |
| Vite 5 | Development server and static production build |
| Ordinary CSS | Visual system without an extra styling framework |
| Inline SVG | Fictional grid that does not depend on map providers |
| Recharts | 60-minute trend display |
| lucide-react | Consistent icons |
| React context and a reducer | One store so every panel sees the same snapshot |
| Browser download API | CSV export without a backend |
| Nginx (Alpine) | Serves the built files in production; SPA fallback to `index.html` |
| Docker multi-stage build | Node 22 compiles the app; the final image contains only Nginx and static assets |

There are no runtime calls to fonts CDNs, tile servers, or telemetry APIs, so a classroom without internet can still run a machine that already holds the Docker image.

### 15.1 Repository layout

```
Urban Health Monitoring System/
├── README.md                          This document
├── LICENSE                            MIT
├── Dockerfile                         Production image (build context = repository root)
├── docker-compose.yml                 Port 8080, image name below
├── docker-build.sh                    Build + save .tar
├── docker-run.sh                      Run container on port 8080
├── .dockerignore
├── .gitignore
└── urban-health-monitor/              Application
    ├── package.json
    ├── package-lock.json
    ├── index.html
    ├── vite.config.ts
    ├── nginx.conf                     Gzip, /assets/ cache, SPA routing
    ├── Dockerfile                     Equivalent image if built from this folder
    └── src/                           UI, data, analytics, state
```

The canonical image name, including the Docker Hub namespace of the author, is:

```text
aayushdevelops/urban_health_monitoring_system:latest
```

Docker Hub requires lowercase names. A mixed-case title such as `Urban_Health_monitoring_system` is therefore published as `urban_health_monitoring_system`.

The root Dockerfile copies `urban-health-monitor/package.json` and `package-lock.json`, runs `npm ci` and `npm run build`, then copies `dist/` into Nginx. A health check requests `http://localhost:80/` inside the container.

---

## 16. What the demonstration shows, and what it does not

**It shows**

- That four hotspots can be compared on air, noise, and traffic at the same simulated instant.
- That a disclosed weighted index can rank those hotspots.
- That an interconnected grid makes an alternative to a jammed arm available.
- That when the jam relocates, ranking, alerts, barriers, and the recommended detour update together.
- That a municipal-style CSV can be produced from the current snapshot.
- That the same build can be started from Docker Hub without installing Node.js.

**It does not show**

- Measured concentrations from instruments at Bagalur Cross, Phoenix Mall, Galleria Mall, or Hebbal Flyover.
- That the Urban Stress Index predicts hospital visits, stress symptoms, or mortality.
- That the green corridor is geographically shortest or legally a recommended official diversion.
- That Auto-Shift is a forecast model; it is a scripted cycle for teaching.
- That Docker packaging replaces a production operations platform (monitoring, HTTPS, authentication, high availability).

An honest one-sentence summary for a viva:

> This is a repeatable, fully client-side prototype that integrates simulated local air, noise, and traffic for four named sites, explains a composite stress score, and demonstrates adaptive rerouting on a fictional street grid, packaged so it can be run anywhere with Docker.

---

## 17. Limitations and risks (for viva questions)

1. **Synthetic data.** All time series are generated from fixtures and sine-wave variation. They must not be quoted as observations of Bengaluru.
2. **Fictional geometry.** Distances, travel times, and “8 minutes saved” are schematic. The real Hebbal and Bagalur road network is not encoded.
3. **Unvalidated index.** Weights 45/35/20 and the 300 / 45–90 / 180 / 300 normalisers were chosen for a clear classroom formula. They are not the output of a calibration study.
4. **Detour metrics are derived.** The comparison card scales the jammed reading; it does not simulate dispersion along the bypass.
5. **Phase 1 topics omitted.** Water quality and disease surveillance remain future work, as required so the dashboard is not filled with invented clinical data.
6. **Operational risks of a real deployment** (privacy of mobility traces, sensor cost, data integration, and public trust) are acknowledged from Phase 1 and are not solved here.
7. **Accessibility and mobile layout** are adequate for a desktop viva; the project is not presented as a production citizen app.

---

## 18. Future work

If the project continued beyond this prototype, the natural next steps would be:

1. Replace fixtures with live or logged station feeds while keeping the same dashboard and index functions.
2. Validate or revise Urban Stress Index weights against field measurements and, separately, against stated human comfort — never treating the index as a medical score.
3. Add water-quality and carefully authorised public-health layers from Phase 1 without mixing them into the current four-station air/noise/traffic story until the data exist.
4. Investigate a predictive module that estimates *which* station will jam next; that module is not required for the monitoring prototype and is not present in this repository.
5. If used beyond a classroom, add HTTPS, a reverse proxy, and an operations health dashboard around the existing Nginx image.

---

## 19. Rebuilding and republishing the image

From the repository root, with Docker running:

```bash
docker build -t aayushdevelops/urban_health_monitoring_system:latest -f Dockerfile .
docker login
docker push aayushdevelops/urban_health_monitoring_system:latest
```

`docker-compose.yml` already references that image name and will rebuild it when `docker compose up -d --build` is used.

---

## 20. License

MIT License.

Copyright (c) 2026 Aayush170605.

Permission is granted to use, copy, modify, merge, publish, and distribute the software subject to inclusion of the copyright notice and permission notice. The software is provided without warranty, as stated in the `LICENSE` file in this repository.

---

## 21. Document control

This README describes the software as built in this repository: React 18 application `urban-health-monitor` version 1.0.0, production image `aayushdevelops/urban_health_monitoring_system:latest`, served on host port 8080 mapped to container port 80. Station names, formulas, thresholds, scenario multipliers, and Docker commands are those implemented in source, not unfinished plans.
