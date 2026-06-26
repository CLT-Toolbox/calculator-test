const STATE = {
  method:       'shear',   
  layerCount:   5,
};


document.addEventListener('DOMContentLoaded', () => {
  updateLayerTable();
});


function selectMethod(method) {
  STATE.method = method;

  document.getElementById('btn-shear').classList.toggle('active', method === 'shear');
  document.getElementById('btn-gamma').classList.toggle('active', method === 'gamma');

  const hint = document.getElementById('method-hint');
  if (method === 'shear') {
    hint.textContent = 'Shear Analogy supports 3–9 layers (symmetric layup required).';
  } else {
    hint.textContent = 'Gamma Method supports 3 or 5 layers only.';
  }

  document.getElementById('lref-group').style.display = method === 'gamma' ? '' : 'none';

  const layerSel = document.getElementById('inp-layers');
  if (method === 'gamma') {

    Array.from(layerSel.options).forEach(opt => {
      opt.disabled = !['3', '5'].includes(opt.value);
      opt.style.color = opt.disabled ? '#bbb' : '';
    });
    if (!['3', '5'].includes(layerSel.value)) {
      layerSel.value = '5';
    }
  } else {
    Array.from(layerSel.options).forEach(opt => {
      opt.disabled = false;
      opt.style.color = '';
    });
  }

  updateLayerTable();

  document.getElementById('output-panel').style.display = 'none';
  document.getElementById('error-msg').style.display    = 'none';
}

function updateLayerTable() {
  const n = parseInt(document.getElementById('inp-layers').value, 10);
  STATE.layerCount = n;

  const prev = STATE.orientations;
  STATE.orientations = [];
  for (let i = 0; i < n; i++) {
    STATE.orientations[i] = (prev[i] !== undefined) ? prev[i] : (i % 2 === 0 ? 0 : 90);
  }

  const tbody = document.getElementById('layer-tbody');
  tbody.innerHTML = '';

  for (let i = 0; i < n; i++) {
    const ori = STATE.orientations[i];
    const swatchColor = ori === 0 ? '#c8a86b' : '#8b6b3d';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <span class="layer-badge">
          <span class="layer-swatch" style="background:${swatchColor}"></span>
          Layer ${i + 1}
        </span>
      </td>
      <td>
        <select onchange="onOrientationChange(${i}, this.value)">
          <option value="0"  ${ori === 0  ? 'selected' : ''}>0°  – Primary</option>
          <option value="90" ${ori === 90 ? 'selected' : ''}>90° – Cross</option>
        </select>
      </td>
      <td>
        <span class="dir-label">${ori === 0 ? '→ Parallel' : '↑ Perpendicular'}</span>
      </td>
    `;
    tbody.appendChild(tr);
  }

  drawLayupDiagram();
}

function onOrientationChange(layerIdx, value) {
  STATE.orientations[layerIdx] = parseInt(value, 10);
  drawLayupDiagram();
  const rows = document.getElementById('layer-tbody').querySelectorAll('tr');
  const row  = rows[layerIdx];
  if (row) {
    const dirSpan = row.querySelector('.dir-label');
    const swatchSpan = row.querySelector('.layer-swatch');
    if (dirSpan) dirSpan.textContent = value === '0' ? '→ Parallel' : '↑ Perpendicular';
    if (swatchSpan) swatchSpan.style.background = value === '0' ? '#c8a86b' : '#8b6b3d';
  }
}

function drawLayupDiagram() {
  const n          = STATE.layerCount;
  const orientations = STATE.orientations;
  const thickness  = parseFloat(document.getElementById('inp-thickness').value) || 35;

  const W   = 380;
  const PL  = 56;  
  const PT  = 14;
  const PB  = 28;
  const scaleH = Math.min(10, 180 / (n * thickness));  
  const layerH = thickness * scaleH;
  const panelH = n * layerH;
  const H   = panelH + PT + PB;
  const X0  = PL;
  const barW = W - PL - 18;

  const COLOR_0  = '#d4a853';
  const COLOR_90 = '#a07840';
  const COLOR_TXT_0  = '#5c3a0f';
  const COLOR_TXT_90 = '#3b2006';

  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="font-family:'IBM Plex Mono',monospace">`;

  for (let i = 0; i <= n; i++) {
    const y = PT + i * layerH;
    svg += `<line x1="${X0}" y1="${y}" x2="${X0 + barW}" y2="${y}" stroke="${i === 0 || i === n ? '#2a5c8f' : '#bbb'}" stroke-width="${i === 0 || i === n ? 1.5 : 0.5}" stroke-dasharray="${i > 0 && i < n ? '4,3' : 'none'}"/>`;
  }

  for (let i = 0; i < n; i++) {
    const ori = orientations[i];
    const y   = PT + i * layerH;
    const fill = ori === 0 ? COLOR_0 : COLOR_90;
    const txtColor = ori === 0 ? COLOR_TXT_0 : COLOR_TXT_90;

    svg += `<rect x="${X0}" y="${y}" width="${barW}" height="${layerH}" fill="${fill}" opacity="0.85"/>`;

    if (ori === 0) {

      const step = Math.max(3, layerH / 5);
      for (let gy = y + step; gy < y + layerH - 2; gy += step) {
        svg += `<line x1="${X0 + 4}" y1="${gy}" x2="${X0 + barW - 4}" y2="${gy}" stroke="${txtColor}" stroke-width="0.5" opacity="0.35"/>`;
      }

      const ay = y + layerH / 2;
      const ax1 = X0 + barW * 0.35, ax2 = X0 + barW * 0.65;
      svg += `<line x1="${ax1}" y1="${ay}" x2="${ax2}" y2="${ay}" stroke="${txtColor}" stroke-width="1.5"/>`;
      svg += `<polygon points="${ax2},${ay - 3} ${ax2 + 6},${ay} ${ax2},${ay + 3}" fill="${txtColor}"/>`;
    } else {

      const step = Math.max(5, barW / 16);
      for (let gx = X0 + step; gx < X0 + barW - 2; gx += step) {
        svg += `<line x1="${gx}" y1="${y + 3}" x2="${gx}" y2="${y + layerH - 3}" stroke="${txtColor}" stroke-width="0.5" opacity="0.35"/>`;
      }

      const ax = X0 + barW / 2;
      const ay1 = y + layerH * 0.65, ay2 = y + layerH * 0.2;
      svg += `<line x1="${ax}" y1="${ay1}" x2="${ax}" y2="${ay2}" stroke="${txtColor}" stroke-width="1.5"/>`;
      svg += `<polygon points="${ax - 3},${ay2} ${ax},${ay2 - 6} ${ax + 3},${ay2}" fill="${txtColor}"/>`;
    }

    svg += `<text x="${X0 + 8}" y="${y + layerH / 2 + 4}" font-size="9" font-weight="600" fill="${txtColor}" opacity="0.8">L${i + 1} ${ori}°</text>`;

    svg += `<text x="${X0 - 4}" y="${y + 3}" font-size="7.5" fill="#6b6b6b" text-anchor="end">${Math.round(i * thickness)}</text>`;
    svg += `<line x1="${X0 - 2}" y1="${y}" x2="${X0}" y2="${y}" stroke="#999" stroke-width="0.75"/>`;
  }

  svg += `<text x="${X0 - 4}" y="${PT + panelH + 3}" font-size="7.5" fill="#6b6b6b" text-anchor="end">${Math.round(n * thickness)}</text>`;
  svg += `<line x1="${X0 - 2}" y1="${PT + panelH}" x2="${X0}" y2="${PT + panelH}" stroke="#999" stroke-width="0.75"/>`;

  svg += `<text x="9" y="${PT + panelH / 2}" font-size="8" fill="#6b6b6b" text-anchor="middle" dominant-baseline="middle" transform="rotate(-90 9 ${PT + panelH / 2})">mm</text>`;

  svg += `<text x="${X0 + barW / 2}" y="${H - 5}" font-size="8.5" fill="#6b6b6b" text-anchor="middle">Cross-section</text>`;

  svg += `</svg>`;

  document.getElementById('layup-diagram').innerHTML = svg;
}

function buildLayup() {
  const gradeName  = document.getElementById('inp-grade').value;
  const thickness  = parseFloat(document.getElementById('inp-thickness').value);
  const grade      = MaterialGrade.fromName(gradeName);
  const n          = STATE.layerCount;

  if (isNaN(thickness) || thickness <= 0) throw new Error('Layer thickness must be a positive number.');

  const layup = new CLTLayupType(`${n}-ply CLT (${gradeName})`);
  for (let i = 0; i < n; i++) {
    const ori = STATE.orientations[i] ?? (i % 2 === 0 ? 0 : 90);
    layup.addLayer(new CLTLayerType(i + 1, thickness, ori, grade));
  }
  layup.computeGeometry();
  return layup;
}

function calculate() {
  const errEl = document.getElementById('error-msg');
  errEl.style.display = 'none';

  try {
    const layup = buildLayup();
    const beff  = parseFloat(document.getElementById('inp-beff').value) || 1000;

    let result;

    if (STATE.method === 'shear') {
      const calc = new ShearAnalogyMethod();
      result = calc.calculate(layup, beff);
    } else {
      const Lref = parseFloat(document.getElementById('inp-lref').value) || 5000;
      const calc = new GammaMethod();
      result = calc.calculate(layup, beff, { Lref });
    }

    renderOutput(result, layup);

  } catch (err) {
    errEl.textContent = '⚠ ' + err.message;
    errEl.style.display = 'block';
    document.getElementById('output-panel').style.display = 'none';
  }
}

function renderOutput(result, layup) {
  document.getElementById('output-panel').style.display = '';

  document.getElementById('sa-section').style.display = result.method === 'ShearAnalogy' ? '' : 'none';
  document.getElementById('gm-section').style.display = result.method === 'Gamma'        ? '' : 'none';

  renderCards(result);

  if (result.method === 'ShearAnalogy') {
    renderShearAnalogyTable(result);
  } else {
    renderGammaTable(result);
  }
}

function renderCards(result) {
  const EI_kNm2 = (result.EI_eff / 1e6).toFixed(2);   // N·mm²/m → kN·m²/m
  const EI_sci  = result.EI_eff.toExponential(4);

  const methodLabel = result.method === 'ShearAnalogy' ? 'Shear Analogy' : 'Gamma Method';

  document.getElementById('result-cards').innerHTML = `
    <div class="result-card">
      <div class="card-label">EI<sub>eff</sub></div>
      <div class="card-value">${EI_sci}</div>
      <div class="card-unit">N·mm²/m</div>
    </div>
    <div class="result-card">
      <div class="card-label">EI<sub>eff</sub></div>
      <div class="card-value">${EI_kNm2}</div>
      <div class="card-unit">kN·m²/m</div>
    </div>
    <div class="result-card">
      <div class="card-label">Total Thickness</div>
      <div class="card-value">${result.totalThickness}</div>
      <div class="card-unit">mm</div>
    </div>
    <div class="result-card">
      <div class="card-label">Method</div>
      <div class="card-value" style="font-size:.85rem">${methodLabel}</div>
      <div class="card-unit">${result.layerCount} layers · b<sub>eff</sub> = ${result.beff} mm${result.Lref ? ' · L<sub>ref</sub> = ' + result.Lref + ' mm' : ''}</div>
    </div>
  `;
}

function renderShearAnalogyTable(result) {
  const tbody = document.getElementById('sa-tbody');
  const tfoot = document.getElementById('sa-tfoot');
  tbody.innerHTML = '';
  tfoot.innerHTML = '';

  let totalEiIi = 0;

  result.layers.forEach(lp => {
    const isActive = lp.Ei_XX > 0;
    const rowClass = isActive ? `row-${lp.theta}` : 'row-zero';
    const tr = document.createElement('tr');
    tr.className = rowClass;
    tr.innerHTML = `
      <td>Layer ${lp.index} (${lp.theta}°)</td>
      <td>${fmt(lp.ti)}</td>
      <td>${fmt(lp.yi)}</td>
      <td>${lp.theta}</td>
      <td>${fmt(lp.Ei_XX)}</td>
      <td>${fmtE(lp.beff_ti3_12)}</td>
      <td>${fmtE(lp.beff_ti_ai2)}</td>
      <td>${isActive ? fmtE(lp.EiIi) : '—'}</td>
    `;
    tbody.appendChild(tr);
    totalEiIi += lp.EiIi;
  });

  tfoot.innerHTML = `
    <tr>
      <td colspan="7">ΣE<sub>i</sub>I<sub>i</sub> — Effective Bending Stiffness</td>
      <td>${fmtE(totalEiIi)}</td>
    </tr>
  `;
}

function renderGammaTable(result) {
  const tbody = document.getElementById('gm-tbody');
  const tfoot = document.getElementById('gm-tfoot');
  tbody.innerHTML = '';
  tfoot.innerHTML = '';

  let totalEIeff = 0;

  result.layers.forEach(lp => {
    const isActive = lp.Ei_XX > 0 && lp.gamma !== null;
    const tr = document.createElement('tr');
    tr.className = isActive ? 'row-0' : 'row-zero';
    tr.innerHTML = `
      <td>Layer ${lp.index} (${lp.theta}°)</td>
      <td>${fmt(lp.Ei_XX)}</td>
      <td>${fmt(lp.ti)}</td>
      <td>${isActive ? fmtE(lp.Ai) : '—'}</td>
      <td>${lp.GR_next !== null ? fmt(lp.GR_next) : '—'}</td>
      <td>${lp.gamma !== null ? lp.gamma.toFixed(6) : (lp.theta === 90 ? '—' : '—')}</td>
      <td>${lp.ai_eff !== null ? fmt(lp.ai_eff) : '—'}</td>
      <td>${isActive ? fmtE(lp.beff_ti3_12) : '—'}</td>
      <td>${isActive ? fmtE(lp.beff_ti_ai2) : '—'}</td>
      <td>${isActive ? fmtE(lp.EiIi_eff) : '—'}</td>
    `;
    tbody.appendChild(tr);
    totalEIeff += lp.EiIi_eff;
  });

  tfoot.innerHTML = `
    <tr>
      <td colspan="9">ΣEI<sub>eff,γ</sub> — Effective Bending Stiffness (Gamma Method)</td>
      <td>${fmtE(totalEIeff)}</td>
    </tr>
  `;
}


function fmt(v)  { return typeof v === 'number' ? v.toFixed(2) : '—'; }

function fmtE(v) {
  if (typeof v !== 'number' || v === 0) return '0';
  if (Math.abs(v) >= 1e9) return v.toExponential(4);
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(4) + ' ×10⁶';
  return v.toFixed(2);
}