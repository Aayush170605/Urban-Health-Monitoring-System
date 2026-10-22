# Urban Health Monitoring System (UHMS)

> **College Project Demonstration Prototype**  
> Interactive 4-location urban environmental monitoring dashboard with real-time commuter health navigation. Demonstrates how continuous air quality, acoustic noise, and traffic telemetry enable adaptive routing to avoid pollution and noise hotspots.

---

## 1. Quick Start

### Prerequisites
- **Node.js**: v20.19+ or v22.12+ LTS (verified with Node.js v22.23.3)
- **npm**: v10+

### Setup & Run
```bash
# Navigate to the application directory
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

## 2. Hotspot Vulnerability Ranking (Worst to Cleanest)

The four monitored locations are ranked in order of overall environmental stress:

| Rank | Station | Full Name | Station Type | Baseline AQI | Noise $L_{Aeq}$ | Stress Score | Alert Status |
|:---:|:---:|:---|:---|:---:|:---:|:---:|:---:|
| **#1 Worst** | `UHMS-01` | **Bagalur Cross** | Major Junction Corridor | **248** (Poor) | **82.5 dB(A)** | **83 / 100** | 🔴 **Active (3 Triggers)** |
| **#2 Elevated** | `UHMS-03` | **Near Galleria Mall** | Mall Surroundings & Arterial | **185** (Moderate) | **76.5 dB(A)** | **63 / 100** | 🟠 Elevated Stress |
| **#3 Moderate** | `UHMS-02` | **Phoenix Mall of Asia** | Mall Access / Service Road | **135** (Moderate) | **70.0 dB(A)** | **47 / 100** | 🟡 Moderate |
| **#4 Cleanest** | `UHMS-04` | **Hebbal Flyover entry** | Flyover Approach Corridor | **78** (Satisfactory) | **62.0 dB(A)** | **28 / 100** | 🟢 **Safe / Clean** |

---

## 3. Dynamic Commuter Rerouting Simulation

When the **Start / Play** button is pressed, the simulation triggers a moving **Person on Motorcycle / Scooter**:
1. **The Origin & Approach**: The commuter travels East on the North Arterial ($y=180$) toward East Terminal.
2. **Early Sensor Warning**: At $x=175$ (65 metres before the junction), the UHMS IoT network triggers a critical advisory:
   `"⚠️ SENSOR ADVISORY: Bagalur Cross AQI 248 (Severe), Noise 82.5 dB! Abandons direct route."`
3. **Route Abandonment**:
   - The direct path into Bagalur Cross is marked with an **abandoned red dashed line**, hazard barriers (🚫 / ✕), and warning badges.
4. **Adaptive Clean Detour**:
   - The commuter turns South onto the **Central Park Bypass Avenue** ($y=320$).
   - Traverses the clean green corridor past botanical reserves (AQI ~75, Noise ~64 dB(A)).
   - Connects to the East Destination safely.
5. **Continuous Loop**:
   - Loops smoothly via the South Parkway and back to the West Corridor, repeating continuously until paused.
   - **Data updates every 5 seconds** while the bike glides in real-time.
   - **Health Impact**: Avoids **65% of particulate exposure** and **18.5 dB(A) of hearing strain**, with zero idling delay.

---

## 4. Key Interactive Features

- **Interactive City Grid Map (SVG)**: Stylized road network with North Arterial, Central Park Bypass, and South Parkway.
- **Synchronized Map Layers**: Seamless switching across **AQI**, **Noise**, **PM2.5**, **PM10**, **Traffic (Queue)**, and **Urban Stress Index**.
- **Live Commuter Telemetry HUD**: Real-time ticker showing the rider's active phase, live hazard notifications, and accumulated health exposure savings.
- **Route Comparison Panel**: Side-by-side analysis of the *Direct Path (Abandoned)* vs. *Adaptive Green Detour (Chosen)*.
- **Hotspot Vulnerability Bar**: Clickable ranking pill-bar to immediately inspect any hotspot.
- **Transparent Stress Index**: Fully disclosed weights (45% Air, 35% Noise, 20% Traffic) with component score bars.
- **Comparison Table & CSV Export**: Download complete 4-station snapshots formatted for municipal reports.
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
