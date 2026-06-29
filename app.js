// ============================================================
// GLOBAL UTILITY & ECHARTS THEMING
// ============================================================
const fmt = {
  cur: v => v >= 1e6 ? '$' + (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? '$' + (v / 1e3).toFixed(1) + 'K' : '$' + v,
  num: v => v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? (v / 1e3).toFixed(1) + 'K' : v
};

const colors = {
  magenta: '#ff007f',
  purple: '#8b5cf6',
  red: '#ff3355',
  amber: '#f59e0b',
  green: '#10b981',
  textMain: '#f8fafc',
  textMuted: '#94a3b8',
  bgTooltip: 'rgba(13, 19, 37, 0.95)'
};

let currentAccent = '#00f0ff';

function getGradient(color1, color2) {
  return new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:color1},{offset:1,color:color2}]);
}

function getCommonOptions() {
  return {
    backgroundColor: 'transparent',
    textStyle: { fontFamily: 'Inter, sans-serif' },
    tooltip: {
      backgroundColor: colors.bgTooltip,
      borderColor: currentAccent,
      textStyle: { color: colors.textMain },
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      extraCssText: `box-shadow: 0 0 20px ${currentAccent}33; backdrop-filter: blur(8px);`
    }
  };
}

let charts = {};

// Register World Map
echarts.registerMap('world', worldGeoJSON);

// ============================================================
// MICRO-INTERACTIONS
// ============================================================
function animateValue(id, start, end, duration, formatStr = '') {
  const obj = document.getElementById(id);
  if(!obj) return;
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const currentVal = Math.floor(easeProgress * (end - start) + start);
    
    if(formatStr === 'cur') obj.textContent = fmt.cur(currentVal);
    else if(formatStr === 'num') obj.textContent = fmt.num(currentVal);
    else if(formatStr === 'pct') obj.textContent = currentVal + '%';
    else if(formatStr === 'hr') obj.textContent = currentVal + 'h';
    else obj.textContent = currentVal;
    
    if (progress < 1) window.requestAnimationFrame(step);
  };
  window.requestAnimationFrame(step);
}

function initTilt(element) {
  element.addEventListener('mousemove', (e) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  });
  element.addEventListener('mouseleave', () => {
    element.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  });
}

// ============================================================
// METRICS & INCIDENTS
// ============================================================
let activeMonth = null;
let incidentFilter = ''; 
let searchFilter = '';
let incidentExpanded = false;

function renderMetrics() {
  let mTotalAlerts = 0, mAvgImpact = 0, mTotalRecords = 0, mChainSurvival = 0, mAvgResponse = 0;
  
  if (activeMonth) {
    const mData = DataStore.socData.find(x => x.month === activeMonth);
    if(mData) mTotalAlerts = mData.alerts;
  } else {
    mTotalAlerts = DataStore.socData.reduce((s, d) => s + d.alerts, 0);
  }

  mAvgImpact = Math.round(DataStore.incidents.reduce((s, d) => s + d.financialImpact, 0) / (DataStore.incidents.length || 1));
  mTotalRecords = DataStore.incidents.reduce((s, d) => s + d.recordsAffected, 0);
  mChainSurvival = DataStore.mitreData.length ? DataStore.mitreData[DataStore.mitreData.length - 1].successRate : 0;
  mAvgResponse = Math.round(DataStore.incidents.reduce((s, d) => s + d.responseHours, 0) / (DataStore.incidents.length || 1));

  animateValue('mTotalAlerts', 0, mTotalAlerts, 1500, 'num');
  animateValue('mAvgImpact', 0, mAvgImpact, 1500, 'cur');
  animateValue('mTotalRecords', 0, mTotalRecords, 1500, 'num');
  animateValue('mChainSurvival', 0, mChainSurvival, 1500, 'pct');
  animateValue('mAvgResponse', 0, mAvgResponse, 1500, 'hr');
  animateValue('mRiskReduction', 0, 100 - mChainSurvival, 1500, 'pct');

  document.querySelectorAll('[data-tilt]').forEach(initTilt);
}

function renderIncidents() {
  const el = document.getElementById('incidentGrid');
  let filtered = DataStore.incidents;
  if(incidentFilter) filtered = filtered.filter(i => i.target.toLowerCase().includes(incidentFilter.toLowerCase()) || i.actor.toLowerCase().includes(incidentFilter.toLowerCase()));
  if(searchFilter) filtered = filtered.filter(i => i.incidentId.toLowerCase().includes(searchFilter) || i.actor.toLowerCase().includes(searchFilter) || i.vector.toLowerCase().includes(searchFilter));

  el.innerHTML = filtered.map(i => {
    return `<div class="incident-card inc-sev-${i.severity} ${incidentExpanded ? 'expanded' : ''}" data-id="${i.incidentId}">
      <div class="sev-bar"></div>
      <div class="inc-top">
        <span class="inc-id">${i.incidentId}</span>
        <span class="sev-badge">${i.severity}</span>
      </div>
      <div class="inc-desc">
        <div class="vector">${i.vector}</div>
        <div class="target">${i.actor} → <strong>${i.target}</strong></div>
      </div>
      <div class="inc-body">
        <div class="inc-stat"><div class="lbl">Impact</div><div class="val imp">${fmt.cur(i.financialImpact)}</div></div>
        <div class="inc-stat"><div class="lbl">Records</div><div class="val rec">${fmt.num(i.recordsAffected)}</div></div>
        <div class="inc-stat"><div class="lbl">Response</div><div class="val">${i.responseHours}h</div></div>
      </div>
      <div class="inc-detail">${i.details || 'No additional details.'}</div>
    </div>`;
  }).join('');

  el.querySelectorAll('.incident-card').forEach(card => {
    initTilt(card);
    card.onclick = function () {
      if(!incidentExpanded) this.classList.toggle('expanded');
    };
  });
}

document.getElementById('incidentExpandAll').onclick = function() {
  incidentExpanded = !incidentExpanded;
  this.textContent = incidentExpanded ? '⊟ Collapse All' : '⊞ Expand All';
  renderIncidents();
};
document.getElementById('globalSearch').addEventListener('input', (e) => { searchFilter = e.target.value.toLowerCase(); renderIncidents(); });
document.getElementById('searchClear').onclick = () => { document.getElementById('globalSearch').value = ''; searchFilter = ''; renderIncidents(); };


// ============================================================
// NEW: HERO MAP CHART (Live Streaming)
// ============================================================
let mapInterval;
let activeAttacks = [];

function renderMapChart() {
  const dom = document.getElementById('mapChart');
  if(!charts.map) charts.map = echarts.init(dom);

  const locs = DataStore.geoThreatData.locations;
  const cities = Object.keys(locs);
  
  // Base scatter points for all cities (pulsing radars)
  const scatterData = cities.map(k => ({ 
    name: k, 
    value: [...locs[k], 100],
    itemStyle: { color: currentAccent }
  }));

  const common = getCommonOptions();
  const option = {
    ...common,
    tooltip: {
      ...common.tooltip,
      formatter: function (params) {
        if (params.seriesType === 'lines') {
          return `<b style="color:var(--red)">LIVE THREAT DETECTED</b><br/>
                  Source: ${params.data.sourceName}<br/>
                  Target: ${params.data.targetName}<br/>
                  Severity: Critical<br/>
                  Payload: Unknown Signature`;
        } else {
          return `<b>${params.name} Datacenter</b><br/>Status: Active<br/>Monitoring in progress...`;
        }
      }
    },
    geo: {
      map: 'world',
      roam: true,
      zoom: 1.2,
      itemStyle: { areaColor: '#0a101f', borderColor: 'rgba(0,240,255,0.2)' },
      emphasis: { itemStyle: { areaColor: '#121a2f' }, label: { show: false } }
    },
    series: [
      {
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: scatterData,
        symbolSize: 8,
        showEffectOn: 'render',
        rippleEffect: { brushType: 'stroke', scale: 4, period: 3 },
        itemStyle: { shadowBlur: 10, shadowColor: currentAccent }
      },
      {
        type: 'lines',
        coordinateSystem: 'geo',
        zlevel: 2,
        effect: { show: true, period: 3, trailLength: 0.4, symbol: 'arrow', symbolSize: 6 },
        lineStyle: { color: colors.red, width: 1.5, opacity: 0.6, curveness: 0.2 },
        data: activeAttacks
      }
    ]
  };
  charts.map.setOption(option, true);

  // Start live streaming simulator
  if(!mapInterval) {
    mapInterval = setInterval(() => {
      // Pick random source and target
      const src = cities[Math.floor(Math.random() * cities.length)];
      let tgt = cities[Math.floor(Math.random() * cities.length)];
      while(tgt === src) tgt = cities[Math.floor(Math.random() * cities.length)];
      
      const newAttack = {
        sourceName: src,
        targetName: tgt,
        coords: [locs[src], locs[tgt]],
        value: Math.floor(Math.random() * 100)
      };

      activeAttacks.push(newAttack);
      
      // Keep only last 5 attacks to prevent clutter and simulate bursts
      if(activeAttacks.length > 5) {
        activeAttacks.shift();
      }

      charts.map.setOption({
        series: [
          { data: scatterData }, // keep scatter
          { data: activeAttacks } // update lines
        ]
      });
      
      // Also inject a log into the terminal!
      const box = document.getElementById('terminalBox');
      if (box) {
        const time = new Date().toISOString().split('T')[1].substring(0,8);
        const el = document.createElement('div');
        el.className = 'term-line crit';
        el.innerHTML = `[${time}] [GEO-ALERT] Intercepted payload from ${src} targeting ${tgt} infrastructure.`;
        box.appendChild(el);
        if (box.childElementCount > 30) box.removeChild(box.firstChild);
        box.scrollTop = box.scrollHeight;
      }
    }, 3000);
  }
}

// ============================================================
// NEW: LIVE TERMINAL
// ============================================================
let termInterval;
function startTerminalStream() {
  const box = document.getElementById('terminalBox');
  const messages = [
    { type: 'info', msg: 'Scanning external IPs for malicious signatures...' },
    { type: 'warn', msg: 'Detected anomalous burst on Port 443.' },
    { type: 'crit', msg: '[BLOCK] Dropped payload from 192.168.x.x - Signature Match: Cobalt Strike' },
    { type: 'info', msg: 'IAM Policy updated by sec-admin.' },
    { type: 'sys', msg: 'Re-routing SIEM ingestion queue to failover cluster.' },
    { type: 'warn', msg: 'Multiple failed logins for service account svc_db_admin.' }
  ];

  if(termInterval) clearInterval(termInterval);
  termInterval = setInterval(() => {
    const m = messages[Math.floor(Math.random() * messages.length)];
    const el = document.createElement('div');
    const time = new Date().toISOString().split('T')[1].substring(0,8);
    el.className = `term-line ${m.type}`;
    el.innerHTML = `[${time}] ${m.msg}`;
    box.appendChild(el);
    if (box.childElementCount > 30) box.removeChild(box.firstChild);
    box.scrollTop = box.scrollHeight;
  }, 2500);
}

// ============================================================
// NEW: GAUGE CHART (Enterprise Posture)
// ============================================================
function renderGaugeChart() {
  const dom = document.getElementById('gaugeChart');
  if(!charts.gauge) charts.gauge = echarts.init(dom);

  const val = 82; // Threat Level 82%
  const common = getCommonOptions();
  
  const option = {
    ...common,
    series: [{
      type: 'gauge',
      startAngle: 180, endAngle: 0,
      center: ['50%', '70%'], radius: '90%',
      min: 0, max: 100,
      splitNumber: 5,
      axisLine: { lineStyle: { width: 15, color: [ [0.3, colors.green], [0.7, colors.amber], [1, colors.red] ] } },
      pointer: { icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z', length: '12%', width: 10, offsetCenter: [0, '-60%'], itemStyle: { color: 'inherit' } },
      axisTick: { length: 12, lineStyle: { color: 'inherit', width: 2 } },
      splitLine: { length: 20, lineStyle: { color: 'inherit', width: 4 } },
      axisLabel: { color: '#999', fontSize: 14, distance: -50, formatter: '{value}%' },
      title: { offsetCenter: [0, '-20%'], fontSize: 20 },
      detail: { fontSize: 36, offsetCenter: [0, '0%'], valueAnimation: true, formatter: '{value}%', color: 'inherit' },
      data: [{ value: val, name: 'THREAT LEVEL' }]
    }]
  };
  charts.gauge.setOption(option, true);
}

// ============================================================
// NEW: NETWORK AREA CHART (Live Data)
// ============================================================
let netInterval;
let ingressData = [];
let egressData = [];
let netTime = [];

function initNetworkData() {
  let now = new Date();
  for(let i = 0; i < 20; i++) {
    netTime.push(now.toLocaleTimeString('en-US', { hour12: false }));
    ingressData.push(Math.round(Math.random() * 800 + 200)); // 200-1000 Mbps
    egressData.push(Math.round(Math.random() * 400 + 100)); // 100-500 Mbps
    now = new Date(now.getTime() + 2000);
  }
}

function renderNetworkChart() {
  const dom = document.getElementById('networkChart');
  if(!charts.network) charts.network = echarts.init(dom);
  if(ingressData.length === 0) initNetworkData();

  const common = getCommonOptions();
  const option = {
    ...common,
    tooltip: { ...common.tooltip, trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: netTime, axisLabel: { color: colors.textMuted }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } } },
    yAxis: { type: 'value', axisLabel: { color: colors.textMuted, formatter: '{value} Mb' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } } },
    series: [
      { name: 'Ingress', type: 'line', smooth: true, symbol: 'none', areaStyle: { opacity: 0.3 }, lineStyle: { width: 2 }, itemStyle: { color: currentAccent }, data: ingressData },
      { name: 'Egress', type: 'line', smooth: true, symbol: 'none', areaStyle: { opacity: 0.3 }, lineStyle: { width: 2 }, itemStyle: { color: colors.purple }, data: egressData }
    ]
  };
  charts.network.setOption(option);

  if(!netInterval) {
    netInterval = setInterval(() => {
      netTime.shift();
      netTime.push(new Date().toLocaleTimeString('en-US', { hour12: false }));
      
      ingressData.shift();
      ingressData.push(Math.round(Math.random() * 800 + 200));
      
      egressData.shift();
      egressData.push(Math.round(Math.random() * 400 + 100));
      
      charts.network.setOption({ xAxis: { data: netTime }, series: [{ data: ingressData }, { data: egressData }] });
    }, 2000);
  }
}

// ============================================================
// ORIGINAL CHARTS (Updated lightly for theme)
// ============================================================
let socMode = 'stacked';
function renderSOCChart() {
  const dom = document.getElementById('socChart');
  if(!charts.soc) {
    charts.soc = echarts.init(dom);
    charts.soc.on('click', (params) => { activeMonth = activeMonth === params.name ? null : params.name; renderMetrics(); });
  }
  const d = DataStore.socData;
  const xAxisData = d.map(x => x.month);
  
  const seriesData = [
    { name: 'Critical', type: socMode === 'line' ? 'line' : 'bar', stack: 'total', itemStyle: { color: getGradient('rgba(255, 51, 85, 1)', 'rgba(255, 51, 85, 0.2)'), borderRadius: [4,4,0,0] }, areaStyle: socMode==='line'?{opacity:0.2}:undefined, data: d.map(x => x.critical) },
    { name: 'High', type: socMode === 'line' ? 'line' : 'bar', stack: 'total', itemStyle: { color: getGradient('rgba(245, 158, 11, 1)', 'rgba(245, 158, 11, 0.2)'), borderRadius: [4,4,0,0] }, areaStyle: socMode==='line'?{opacity:0.2}:undefined, data: d.map(x => x.high) },
    { name: 'Medium', type: socMode === 'line' ? 'line' : 'bar', stack: 'total', itemStyle: { color: getGradient(currentAccent, currentAccent+'33'), borderRadius: [4,4,0,0] }, areaStyle: socMode==='line'?{opacity:0.2}:undefined, data: d.map(x => x.medium) },
    { name: 'Low', type: socMode === 'line' ? 'line' : 'bar', stack: 'total', itemStyle: { color: getGradient('rgba(16, 185, 129, 0.8)', 'rgba(16, 185, 129, 0.1)'), borderRadius: [4,4,0,0] }, areaStyle: socMode==='line'?{opacity:0.2}:undefined, data: d.map(x => x.low) }
  ];
  if(socMode === 'line') seriesData.forEach(s => { s.stack = null; s.smooth = true; s.symbolSize = 8; });
  const common = getCommonOptions();
  charts.soc.setOption({ ...common, tooltip: { ...common.tooltip, trigger: 'axis', axisPointer: { type: 'shadow' } }, legend: { textStyle: { color: colors.textMuted }, top: 0 }, grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true }, xAxis: { type: 'category', data: xAxisData, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } }, axisLabel: { color: colors.textMuted } }, yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: colors.textMuted, formatter: v => v >= 1000 ? (v/1000)+'k' : v } }, series: seriesData }, true);
}
document.querySelectorAll('[data-soc-mode]').forEach(el => { el.onclick = () => { document.querySelectorAll('[data-soc-mode]').forEach(e => e.classList.remove('active')); el.classList.add('active'); socMode = el.dataset.socMode; renderSOCChart(); }; });

function renderHeatmapChart() {
  const dom = document.getElementById('heatmapChart');
  if(!charts.heatmap) {
    charts.heatmap = echarts.init(dom);
    charts.heatmap.on('click', (params) => { const depts = DataStore.heatmapData.map(d => d.department); const clickedDept = depts[params.value[0]]; incidentFilter = incidentFilter === clickedDept ? '' : clickedDept; renderIncidents(); });
  }
  const threats = ['phishing', 'malware', 'credentialTheft', 'insiderRisk'];
  const yLabels = ['Phishing', 'Malware', 'Cred Theft', 'Insider'];
  const depts = DataStore.heatmapData.map(d => d.department);
  const data = []; DataStore.heatmapData.forEach((d, i) => { threats.forEach((t, j) => { data.push([i, j, d[t] || 0]); }); });
  const common = getCommonOptions();
  charts.heatmap.setOption({ ...common, tooltip: { ...common.tooltip, position: 'top', formatter: (p) => `${depts[p.value[0]]} - ${yLabels[p.value[1]]}: <b style="color:${currentAccent}">${p.value[2]}</b>` }, grid: { left: '15%', right: '5%', bottom: '10%', top: '5%' }, xAxis: { type: 'category', data: depts, splitArea: { show: true }, axisLabel: { color: colors.textMuted, interval: 0, rotate: 30 }, axisLine: { show: false } }, yAxis: { type: 'category', data: yLabels, splitArea: { show: true }, axisLabel: { color: colors.textMuted }, axisLine: { show: false } }, visualMap: { min: 0, max: 100, calculable: true, orient: 'horizontal', left: 'center', bottom: -10, show: false, inRange: { color: ['#0f172a', currentAccent, '#ff3355'] } }, series: [{ name: 'Threat Heatmap', type: 'heatmap', data: data, label: { show: true, color: '#fff', fontSize: 12, fontWeight: 'bold' }, emphasis: { itemStyle: { shadowBlur: 20, shadowColor: currentAccent, borderColor: '#fff', borderWidth: 2 } }, itemStyle: { borderColor: 'rgba(255,255,255,0.05)', borderWidth: 2, borderRadius: 4 } }] }, true);
}

let mitreMode = 'bar';
function renderMitreChart() {
  const dom = document.getElementById('mitreChart');
  if(!charts.mitre) charts.mitre = echarts.init(dom);
  const d = DataStore.mitreData; const reversed = [...d].reverse(); const common = getCommonOptions(); let option = { ...common };
  if(mitreMode === 'radar') {
    option = { ...option, radar: { indicator: d.map(x => ({ name: x.phase, max: 100 })), shape: 'polygon', splitArea: { areaStyle: { color: [`${currentAccent}11`, `${currentAccent}05`] } }, splitLine: { lineStyle: { color: `${currentAccent}33` } }, axisLine: { lineStyle: { color: `${currentAccent}33` } }, axisName: { color: colors.textMuted } }, series: [{ type: 'radar', data: [{ value: d.map(x => x.successRate), name: 'Success Rate', symbol: 'circle', symbolSize: 6, itemStyle: { color: currentAccent, shadowBlur: 10, shadowColor: currentAccent }, areaStyle: { color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [{offset:0,color:`${currentAccent}1a`},{offset:1,color:`${currentAccent}80`}]) }, lineStyle: { color: currentAccent, width: 2 } }] }] };
  } else {
    option = { ...option, tooltip: { ...common.tooltip, trigger: 'axis', axisPointer: { type: 'shadow' } }, grid: { left: '3%', right: '5%', bottom: '3%', top: '5%', containLabel: true }, xAxis: { type: 'value', max: 100, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: colors.textMuted } }, yAxis: { type: 'category', data: reversed.map(x => x.phase), axisLabel: { color: colors.textMuted } }, series: [{ type: 'bar', data: reversed.map(x => ({ value: x.successRate, itemStyle: { color: x.successRate >= 65 ? colors.red : x.successRate >= 50 ? colors.amber : currentAccent, borderRadius: 4 } })), label: { show: true, position: 'right', color: '#fff', formatter: '{c}%' } }] };
  }
  charts.mitre.setOption(option, true);
}
document.querySelectorAll('[data-mitre-mode]').forEach(el => { el.onclick = () => { document.querySelectorAll('[data-mitre-mode]').forEach(e => e.classList.remove('active')); el.classList.add('active'); mitreMode = el.dataset.mitreMode; renderMitreChart(); }; });

function renderSankeyChart() {
  const dom = document.getElementById('sankeyChart');
  if(!charts.sankey) charts.sankey = echarts.init(dom);
  const rawLinks = DataStore.sankeyData; const nodesSet = new Set(); rawLinks.forEach(l => { nodesSet.add(l.source); nodesSet.add(l.target); }); const nodes = Array.from(nodesSet).map(name => ({ name }));
  const common = getCommonOptions();
  charts.sankey.setOption({ ...common, tooltip: { ...common.tooltip, trigger: 'item', triggerOn: 'mousemove' }, series: [{ type: 'sankey', data: nodes, links: rawLinks, emphasis: { focus: 'adjacency', blurScope: 'global', itemStyle: { shadowBlur: 20, shadowColor: currentAccent } }, lineStyle: { color: 'gradient', curveness: 0.5, opacity: 0.2 }, itemStyle: { color: `${currentAccent}b3`, borderColor: currentAccent, borderWidth: 1 }, label: { color: '#fff', fontFamily: 'Inter', fontSize: 11, fontWeight: 500 } }] }, true);
}

function renderForceChart() {
  const dom = document.getElementById('forceChart');
  if(!charts.force) charts.force = echarts.init(dom);
  const net = DataStore.forceNetwork; const colorsMap = { Actor: colors.red, Vector: colors.amber, System: currentAccent, Control: colors.purple };
  const nodes = net.nodes.map(n => ({ id: n.id, name: n.id, category: n.group, symbolSize: n.group === 'Actor' ? 24 : n.group === 'Vector' ? 18 : 14, itemStyle: { color: colorsMap[n.group], borderColor: '#fff', borderWidth: 1, shadowBlur: 10, shadowColor: colorsMap[n.group] } }));
  const categories = Object.keys(colorsMap).map(k => ({ name: k }));
  const common = getCommonOptions();
  charts.force.setOption({ ...common, tooltip: { ...common.tooltip, formatter: '{b} ({c})' }, legend: { data: categories.map(c => c.name), textStyle: { color: colors.textMuted }, bottom: 0 }, series: [{ type: 'graph', layout: 'force', data: nodes, links: net.links, categories: categories, roam: true, label: { show: true, position: 'right', color: '#fff', fontSize: 10 }, force: { repulsion: 250, edgeLength: 80, gravity: 0.1 }, lineStyle: { color: 'source', curveness: 0.2, opacity: 0.4, width: 2 }, emphasis: { focus: 'adjacency', lineStyle: { width: 4, opacity: 1 } } }] }, true);
}

function renderHierarchyChart() {
  const dom = document.getElementById('hierarchyChart');
  if(!charts.hierarchy) charts.hierarchy = echarts.init(dom);
  const common = getCommonOptions();
  charts.hierarchy.setOption({ ...common, tooltip: { ...common.tooltip, trigger: 'item', triggerOn: 'mousemove' }, series: [{ type: 'tree', data: [DataStore.hierarchyData], top: '5%', left: '10%', bottom: '5%', right: '20%', symbolSize: 8, itemStyle: { color: currentAccent, borderColor: currentAccent, shadowBlur: 10, shadowColor: currentAccent }, lineStyle: { color: `${currentAccent}4d`, width: 1.5, curveness: 0.5 }, label: { position: 'left', verticalAlign: 'middle', align: 'right', fontSize: 12, color: colors.textMain, textBorderColor: 'rgba(0,0,0,0.8)', textBorderWidth: 2 }, leaves: { label: { position: 'right', verticalAlign: 'middle', align: 'left', color: colors.textMuted }, itemStyle: { color: colors.purple, borderColor: colors.purple } }, emphasis: { focus: 'descendant' }, expandAndCollapse: true, animationDuration: 550, animationDurationUpdate: 750 }] }, true);
}

// ============================================================
// GLOBAL THEME SWITCHER
// ============================================================
document.querySelectorAll('.accent-dot').forEach(dot => {
  dot.onclick = function() {
    document.querySelectorAll('.accent-dot').forEach(d => { d.classList.remove('active'); d.style.boxShadow = 'none'; });
    this.classList.add('active'); currentAccent = this.dataset.accent; this.style.boxShadow = `0 0 8px ${currentAccent}`;
    document.documentElement.style.setProperty('--cyan', currentAccent);
    
    renderMapChart();
    renderNetworkChart();
    renderSOCChart();
    renderHeatmapChart();
    renderMitreChart();
    renderSankeyChart();
    renderForceChart();
    renderHierarchyChart();
  };
});

// ============================================================
// FULLSCREEN HANDLER
// ============================================================
document.querySelectorAll('[data-fullscreen]').forEach(btn => {
  btn.onclick = function() {
    const card = this.closest('.card');
    if (card.classList.contains('fullscreen')) {
      card.classList.remove('fullscreen'); this.textContent = '⛶';
    } else {
      document.querySelectorAll('.card.fullscreen').forEach(c => c.classList.remove('fullscreen'));
      card.classList.add('fullscreen'); this.textContent = '✕';
    }
  };
});

// ============================================================
// INITIALIZE & OBSERVE
// ============================================================
function initApp() {
  renderMapChart();
  startTerminalStream();
  renderGaugeChart();
  renderNetworkChart();
  
  renderMetrics();
  renderIncidents();
  renderSOCChart();
  renderHeatmapChart();
  renderMitreChart();
  renderSankeyChart();
  renderForceChart();
  renderHierarchyChart();

  const ro = new ResizeObserver(() => {
    Object.values(charts).forEach(c => { if(c && typeof c.resize === 'function') c.resize(); });
  });
  document.querySelectorAll('.chart-box').forEach(box => { ro.observe(box); });

  // Update real-time clock
  setInterval(() => {
    document.getElementById('headerTime').textContent = new Date().toISOString().split('T')[1].substring(0,8) + ' UTC';
  }, 1000);
}

initApp();
