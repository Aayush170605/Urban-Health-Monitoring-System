# Urban Health Monitoring System (UHMS)

> **College Project Demonstration Prototype**  
> Interactive 4-location urban environmental monitoring dashboard with real-time commuter health navigation. Demonstrates how continuous air quality, acoustic noise, and traffic telemetry enable adaptive routing through an interconnected street network to avoid shifting pollution and noise hotspots.

---

## 1. Quick Start

### Prerequisites
- **Node.js**: v20.19+ or v22.12+ LTS (verified with Node.js v22.23.3)
- **npm**: v10+

### Setup & Run
```bash
# Navigate to application directory
cd urban-health-monitor

# Start local development server
export PATH="/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:$PATH"
npm run dev
```

Open your browser to `http://localhost:5173`.

### Production Build & Preview
```bash
npm run build
npm run preview
```

---

## 2. Interconnected City Grid & Multi-Path Network

The city map features an interconnected road grid with multiple parallel avenues and corridors:
- **Horizontal Corridors**:
  - `North Arterial (y=180)`: Connects Bagalur Cross (`UHMS-01`) to Phoenix Mall (`UHMS-02`).
  - `Central Park Bypass (y=320)`: Low-emission eco-corridor running past botanical parks.
  - `South Parkway (y=460)`: Connects Galleria Mall (`UHMS-03`) to Hebbal Flyover (`UHMS-04`).
- **Vertical Corridors**:
  - `Outer West Lane (x=100)` & `West Connector Link (x=175)`.
  - `West Link Corridor (x=240)`: Main commercial connector.
  - `Mid-West Eco Avenue (x=360)`.
  - `Central Avenue Arterial (x=480)`: Primary high-capacity median corridor.
  - `Mid-East Botanical Link (x=600)`.
  - `East Corridor (x=720)`: Transit connector.
  - `Outer East Expressway (x=880)`: High-speed peripheral bypass.

Because every junction is linked by multiple parallel streets, commuters have viable alternative routes for any travel origin and destination.

---

## 3. Dynamic Real-Time Decision Making (Shifting Hotspots)

Rather than static congestion at one single point, the simulation showcases how **traffic and pollution bottlenecks shift dynamically across cycles**, driving real-time rerouting:

| Round | Active Jammed Hotspot | Observed Conditions | Abandoned Path | Chosen Adaptive Detour | Commuter Health Benefit |
|:---:|:---|:---|:---|:---|:---|
| **Round 1** | **Bagalur Cross** | AQI 248, Noise 82.5 dB, 220m Queue | Direct North Arterial into Bagalur | **Central Park Bypass (y=320)** | **-65% AQI**, -18.5 dB(A) noise |
| **Round 2** | **Near Galleria Mall** | AQI 252, Noise 83.5 dB, 230m Queue | West Link into Galleria Mall | **Central Avenue Arterial (x=480)** | **-68% toxic smoke**, 0m idle queue |
| **Round 3** | **Phoenix Mall of Asia** | AQI 246, Noise 82.0 dB, 215m Queue | North Arterial past service gate | **Central Bypass & Outer Expressway** | **-60% AQI**, 8 min delay saved |
| **Round 4** | **Hebbal Flyover** | AQI 242, Noise 81.5 dB, 210m Queue | South Parkway into ramp backup | **Central Ave to Outer Expressway** | **-62% AQI**, smooth flow @ 34 km/h |

### Interactive Control Modes
- **Auto-Shift Mode (`ON` by default)**: When the commuter on the motorcycle finishes one complete loop cycle, the network automatically advances to the next hotspot jam, updating all sensor readings, alerts, and map barriers!
- **Manual Hotspot Selector Buttons**: Click `1. Bagalur Jam`, `2. Galleria Jam`, `3. Phoenix Jam`, or `4. Hebbal Jam` above the map to demonstrate any specific scenario on demand for your teacher!

---

## 4. Key Interactive Features

- **Interactive City Grid Map (SVG)**: Stylized road grid with street names, animated motorcycle rider with turning angle and headlamp, dynamic radar pulse, roadblock barriers (✕), and glowing green clean detours.
- **Synchronized Map Layers**: Instant switching across **AQI**, **Noise**, **PM2.5**, **PM10**, **Traffic (Queue)**, and **Urban Stress Index**.
- **Live Commuter Telemetry HUD**: Real-time ticker showing active hazard warnings, detour route names, and accumulated health exposure savings.
- **Dynamic Hotspot Stress Ranking Bar**: Live sorted cards from `#1 Peak Stress` to `#4 Clean` with an animated `⚠️ JAMMED` indicator on the active bottleneck.
- **Route Comparison Panel**: Side-by-side analysis of the *Direct Path (Abandoned)* vs. *Adaptive Green Detour (Chosen)* updated in real-time for whichever hotspot is currently jammed.
- **Transparent Stress Index**: Disclosed weights (45% Air, 35% Noise, 20% Traffic) with component score progress bars.
- **Comparison Table & CSV Export**: Download current 4-station snapshots formatted for municipal reports.
- **3-Minute Presentation Guide**: Built-in cue card modal (`Presentation Script` button in header) with timed talking points for college reviews.

---

## 5. Urban Stress Index Formula

$$\text{clamp}_{0,1}(x) = \min(1, \max(0, x))$$

$$\text{airScore} = 100 \times \text{clamp}_{0,1}\left(\frac{\text{AQI}}{300}\right)$$

$$\text{noiseScore} = 100 \times \text{clamp}_{0,1}\left(\frac{L_{Aeq} - 45}{90 - 45}\right)$$

$$\text{waitScore} = 100 \times \text{clamp}_{0,1}\left(\frac{\text{waitingTimeSeconds}}{180}\right)$$

$$\text{queueScore} = 100 \times \text{clamp}_{0,1}\left(\frac{\text{queueLengthMetres}}{300}\right)$$

$$\text{trafficScore} = 0.60 \times \text{waitScore} + 0.40 \times \text{queueScore}$$

$$\text{Urban Stress Index} = \text{round}(0.45 \times \text{airScore} + 0.35 \times \text{noiseScore} + 0.20 \times \text{trafficScore})$$

---

## 6. Known Prototype Limitations

- **Simulated Environmental Data**: All telemetry readings and time series are synthetic and generated for demonstration.
- **Fictional Road Geometry**: The grid layout ($1000 \times 640$) represents stylized urban road archetypes rather than real geographic GIS coordinates.
- **Academic Scope**: Water quality, pathogen surveillance, and automated video analytics represent conceptual extensions from Phase 1.
