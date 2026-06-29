const DataStore = {
  sankeyData: [
    { source:"Nation State", target:"Phishing", value:420 },
    { source:"Nation State", target:"Zero Day Exploit", value:350 },
    { source:"Cyber Criminals", target:"Ransomware", value:510 },
    { source:"Cyber Criminals", target:"Credential Theft", value:430 },
    { source:"Insiders", target:"Insider Abuse", value:220 },
    { source:"Hacktivists", target:"API Exploitation", value:180 },
    { source:"Phishing", target:"Active Directory", value:300 },
    { source:"Credential Theft", target:"CRM", value:220 },
    { source:"Ransomware", target:"ERP", value:350 },
    { source:"Zero Day Exploit", target:"Cloud Infrastructure", value:280 },
    { source:"API Exploitation", target:"Customer Portal", value:190 },
    { source:"Active Directory", target:"MFA", value:180 },
    { source:"CRM", target:"IAM", value:170 },
    { source:"ERP", target:"EDR", value:240 },
    { source:"Cloud Infrastructure", target:"Zero Trust", value:260 },
    { source:"MFA", target:"Detection", value:160 },
    { source:"IAM", target:"Containment", value:140 },
    { source:"EDR", target:"Eradication", value:220 },
    { source:"Zero Trust", target:"Recovery", value:200 }
  ],
  incidents: [
    { incidentId:"INC-2026-001", actor:"Nation State", vector:"Zero Day Exploit", target:"Cloud Infrastructure", severity:"Critical", financialImpact:4200000, recordsAffected:850000, responseHours:96 },
    { incidentId:"INC-2026-002", actor:"Cyber Criminals", vector:"Ransomware", target:"ERP", severity:"High", financialImpact:1800000, recordsAffected:120000, responseHours:48 },
    { incidentId:"INC-2026-003", actor:"Insider", vector:"Insider Abuse", target:"Financial Systems", severity:"Medium", financialImpact:650000, recordsAffected:25000, responseHours:12 }
  ],
  hierarchyData: {
    "name": "Apex Global Enterprise",
    "children": [
      {
        "name": "Threat Actors",
        "children": [
          { "name": "Nation State", "children": [ {"name": "APT ShadowFox"}, {"name": "APT CrimsonWolf"}, {"name": "APT SilentDragon"} ] },
          { "name": "Cyber Criminals", "children": [ {"name": "DarkCipher"}, {"name": "BlackPhoenix"}, {"name": "ZeroStorm"} ] },
          { "name": "Insiders", "children": [ {"name": "Privileged Employee"}, {"name": "Contractor"}, {"name": "Third Party Vendor"} ] },
          { "name": "Hacktivists", "children": [ {"name": "Digital Freedom"}, {"name": "Open Resistance"} ] }
        ]
      },
      {
        "name": "Attack Vectors",
        "children": [
          {"name": "Phishing"}, {"name": "Business Email Compromise"}, {"name": "Credential Theft"}, {"name": "Malware"},
          {"name": "Ransomware"}, {"name": "API Exploitation"}, {"name": "Supply Chain Attack"}, {"name": "Zero Day Exploit"},
          {"name": "Insider Abuse"}, {"name": "Cloud Misconfiguration"}
        ]
      },
      {
        "name": "Target Systems",
        "children": [
          {"name": "Active Directory"}, {"name": "CRM"}, {"name": "ERP"}, {"name": "Customer Portal"}, {"name": "Data Lake"},
          {"name": "Cloud Infrastructure"}, {"name": "Kubernetes Cluster"}, {"name": "AI Platform"}, {"name": "Financial Systems"}, {"name": "HR Systems"}
        ]
      },
      {
        "name": "Security Controls",
        "children": [
          {"name": "IAM"}, {"name": "MFA"}, {"name": "EDR"}, {"name": "SIEM"}, {"name": "SOAR"}, {"name": "WAF"}, {"name": "Zero Trust"}, {"name": "DLP"}, {"name": "CASB"}
        ]
      },
      {
        "name": "Incident Response",
        "children": [
          {"name": "Detection"}, {"name": "Containment"}, {"name": "Eradication"}, {"name": "Recovery"}, {"name": "Lessons Learned"}
        ]
      }
    ]
  },
  forceNetwork: {
    "nodes":[
      {"id":"Nation State","group":"Actor"}, {"id":"Cyber Criminals","group":"Actor"}, {"id":"Insiders","group":"Actor"},
      {"id":"Phishing","group":"Vector"}, {"id":"Ransomware","group":"Vector"}, {"id":"Credential Theft","group":"Vector"},
      {"id":"Active Directory","group":"System"}, {"id":"ERP","group":"System"}, {"id":"CRM","group":"System"}, {"id":"Cloud Infrastructure","group":"System"},
      {"id":"EDR","group":"Control"}, {"id":"SIEM","group":"Control"}, {"id":"MFA","group":"Control"}, {"id":"Zero Trust","group":"Control"}
    ],
    "links":[
      {"source":"Nation State","target":"Phishing"}, {"source":"Cyber Criminals","target":"Ransomware"}, {"source":"Insiders","target":"Credential Theft"},
      {"source":"Phishing","target":"Active Directory"}, {"source":"Credential Theft","target":"CRM"}, {"source":"Ransomware","target":"ERP"},
      {"source":"Active Directory","target":"MFA"}, {"source":"ERP","target":"EDR"}, {"source":"CRM","target":"SIEM"}, {"source":"Cloud Infrastructure","target":"Zero Trust"}
    ]
  },
  mitreData: [
    { phase:"Initial Access", technique:"Phishing", successRate:78 },
    { phase:"Execution", technique:"Malware Deployment", successRate:65 },
    { phase:"Persistence", technique:"Credential Dumping", successRate:58 },
    { phase:"Privilege Escalation", technique:"Token Manipulation", successRate:44 },
    { phase:"Lateral Movement", technique:"Remote Services", successRate:39 },
    { phase:"Data Exfiltration", technique:"Cloud Sync Abuse", successRate:32 }
  ],
  socData: [
    { month:"Jan", alerts:12450, critical:120, high:340, medium:1800, low:10190 },
    { month:"Feb", alerts:13880, critical:145, high:410, medium:2100, low:11225 },
    { month:"Mar", alerts:15120, critical:170, high:490, medium:2400, low:12060 },
    { month:"Apr", alerts:16890, critical:220, high:610, medium:2800, low:13260 }
  ],
  heatmapData: [
    { department:"Finance", phishing:92, malware:76, credentialTheft:88, insiderRisk:45 },
    { department:"HR", phishing:85, malware:60, credentialTheft:74, insiderRisk:58 },
    { department:"Sales", phishing:90, malware:55, credentialTheft:81, insiderRisk:30 },
    { department:"Engineering", phishing:62, malware:78, credentialTheft:67, insiderRisk:40 },
    { department:"Operations", phishing:70, malware:84, credentialTheft:60, insiderRisk:42 }
  ],
  geoThreatData: {
    // City coords: [longitude, latitude]
    locations: {
      "New York": [-74.006, 40.7128],
      "London": [-0.1276, 51.5072],
      "Tokyo": [139.6503, 35.6762],
      "Moscow": [37.6173, 55.7558],
      "Beijing": [116.4074, 39.9042],
      "São Paulo": [-46.6333, -23.5505],
      "Lagos": [3.3792, 6.5244]
    },
    // Attacks format: [{ source, target, value }]
    attacks: [
      { source: "Moscow", target: "New York", value: 95 },
      { source: "Beijing", target: "London", value: 80 },
      { source: "São Paulo", target: "New York", value: 60 },
      { source: "Lagos", target: "London", value: 45 },
      { source: "Moscow", target: "Tokyo", value: 70 },
      { source: "Beijing", target: "New York", value: 85 }
    ]
  },
  networkData: [] // Will be populated dynamically in app.js
};
