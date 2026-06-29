# Apex Global Enterprises — SOC Command Center

A cybersecurity data visualization dashboard simulating a fictional multinational enterprise's Security Operations Center (SOC). Built with **Apache ECharts**, the dashboard provides real-time threat monitoring, attack path analysis, and enterprise-wide security posture visualization.

## Tech Stack

- **HTML / CSS** — Dark-themed glassmorphism UI with dynamic accent colors and micro-interactions
- **JavaScript (Vanilla)** — Data store, live streaming simulators, chart orchestration
- **Apache ECharts 5.5** — All charts and map visualizations


## Visualizations

| Component | Chart Type | Description |
|-----------|-----------|-------------|
| Global Threat Telemetry | Geo Map + EffectScatter + Lines | World map with animated attack paths between datacenter locations |
| Live Threat Feed | Terminal UI | Scrolling log with simulated real-time security alerts |
| Enterprise Threat Posture | Gauge | Threat level meter (0–100%) with color-coded zones |
| Real-time Network Bandwidth | Area Chart | Live-updating ingress/egress traffic (Mbps) |
| SOC Alert Volume | Stacked Bar / Line | Monthly alert breakdown by severity (Critical, High, Medium, Low) |
| Threat Heatmap by Dept | Heatmap | Threat type density across departments |
| MITRE ATT&CK Chain | Horizontal Bar / Radar | Attack lifecycle phase success rates |
| Cyber Incident Summary | Cards (expandable) | Incident listings with search, filter, and detail expansion |
| Attack Path Sankey | Sankey Diagram | Flow from threat actors → vectors → systems → controls → response |
| Force Directed Attack Network | Force Graph | Relational network of actors, vectors, systems, and controls |
| Enterprise Cybersecurity Hierarchy | Tree Diagram | Full organizational cybersecurity structure |

## Features

- **Accent color picker** — Switch between cyan, purple, amber, and green themes
- **Fullscreen mode** — Expand any chart card to full viewport
- **Live data simulation** — Map attacks, terminal logs, and network traffic stream in real-time
- **Chart mode toggles** — SOC chart (stacked bar / line), MITRE chart (bar / radar)
- **Incident search** — Global search bar with match count
- **Interactive filtering** — Click SOC chart months or heatmap departments to filter metrics/incidents
- **3D tilt effect** — Metric cards respond to mouse movement
- **Animated metrics** — Counter animations on page load and filter changes
- **Responsive layout** — Adapts from 3-column grid down to single-column on mobile

## Dataset Structure

All data is defined in `data.js` under the `DataStore` object, inspired by realistic enterprise attack-chain modeling (MITRE ATT&CK framework):

- **Threat Actors** — Nation State, Cyber Criminals, Insiders, Hacktivists
- **Attack Vectors** — Phishing, Ransomware, Zero Day Exploit, API Exploitation, etc.
- **Target Systems** — Active Directory, ERP, CRM, Cloud Infrastructure, AI Platform, etc.
- **Security Controls** — IAM, MFA, EDR, SIEM, Zero Trust, etc.
- **Incident Response** — Detection, Containment, Eradication, Recovery, Lessons Learned


```

## Getting Started

Open `index.html` in any modern browser. No build step or server required.

```bash
# Serve locally with any HTTP server (optional, for best performance)
npx serve .
```

## Dataset Narrative

The fictional **Apex Global Enterprises** is a multinational with cloud infrastructure, ERP, CRM, customer portals, data lakes, AI systems, and remote workforce access. The attack storyline follows:

```
Threat Actors → Attack Vectors → Initial Compromise → Lateral Movement
→ Critical Assets → Security Controls → SOC Detection → Incident Response
→ Recovery → Risk Reduction
```
