// pages.js — one render function per page of the site. Each function writes
// its HTML into the page root and then mounts its controls and draws its
// charts, so every control on the page works: sortable tables, search boxes,
// chart-type toggles, the data explorer, CSV download and copy buttons, and
// the province detail panel.

import {
  HEADLINE, YEARS, SERIES, TRADE_BALANCE, SECTORS, EMPLOYMENT_SECTORS, WAGES,
  CPI_CATEGORIES, PROVINCES, PYRAMID, AGE_GROUPS, HEALTH_TREND, HEALTH,
  CAUSES_OF_DEATH, EDUCATION, TERTIARY_TREND, LITERACY_BY_AGE, SCHOOLS,
  ENVIRONMENT, TRADE_PARTNERS, RELEASES, ECONOMY_INDICATORS,
} from './data.js';
import { lineChart, barChart, groupedBarChart, donutChart, pyramidChart } from './charts.js';

const TEAL = '#0e6b5c';
const AMBER = '#e8a317';
const SLATE_BLUE = '#4a6b8a';
const RED = '#b3543f';

function pct(v, d = 1) { return v.toFixed(d) + '%'; }
function signed(v, d = 1) { return (v > 0 ? '+' : '') + v.toFixed(d) + '%'; }
function num(v, d = 2) { return v.toFixed(d); }
function money(v) { return 'M$' + v.toLocaleString('en-US'); }
function sourceNote(text) { return `<p class="source">Source: ${text}</p>`; }

function kpi(label, value, sub) {
  return `<div class="kpi"><div class="kpi-label">${label}</div>` +
    `<div class="kpi-value">${value}</div><div class="kpi-sub">${sub}</div></div>`;
}

function card(title, inner, extra = '') {
  return `<section class="card ${extra}"><h2>${title}</h2>${inner}</section>`;
}

// Sortable table: click a header to sort that column; click again to reverse.
function makeSortable(table) {
  const ths = table.querySelectorAll('thead th[data-type]');
  ths.forEach((th) => {
    th.classList.add('sortable');
    th.addEventListener('click', () => {
      const idx = [...th.parentElement.children].indexOf(th);
      const type = th.getAttribute('data-type');
      const tbody = table.querySelector('tbody');
      const rows = [...tbody.querySelectorAll('tr')];
      const totals = rows.filter((r) => r.classList.contains('total'));
      const sortable = rows.filter((r) => !r.classList.contains('total'));
      const dir = th.getAttribute('data-dir') === 'asc' ? -1 : 1;
      ths.forEach((o) => o.removeAttribute('data-dir'));
      th.setAttribute('data-dir', dir === 1 ? 'asc' : 'desc');
      sortable.sort((a, b) => {
        const av = a.children[idx].textContent.trim();
        const bv = b.children[idx].textContent.trim();
        if (type === 'num') {
          return (parseFloat(av.replace(/[^0-9.\-]/g, '')) - parseFloat(bv.replace(/[^0-9.\-]/g, ''))) * dir;
        }
        return av.localeCompare(bv) * dir;
      });
      sortable.forEach((r) => tbody.appendChild(r));
      totals.forEach((r) => tbody.appendChild(r));
    });
  });
}

// Search box filters the rows of one table by their text.
function attachSearch(input, table) {
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    table.querySelectorAll('tbody tr').forEach((tr) => {
      tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}

function tableToCSV(table) {
  const rows = [...table.querySelectorAll('tr')].map((tr) =>
    [...tr.children].map((c) => {
      const t = c.textContent.trim().replace(/"/g, '""');
      return /[",\n]/.test(t) ? '"' + t + '"' : t;
    }).join(','),
  );
  return rows.join('\n');
}

function downloadCSV(table, filename, btn) {
  const blob = new Blob([tableToCSV(table)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  if (btn) flash(btn, 'Downloaded');
}

function copyTable(table, btn) {
  const tsv = [...table.querySelectorAll('tr')].map((tr) =>
    [...tr.children].map((c) => c.textContent.trim()).join('\t'),
  ).join('\n');
  const done = () => flash(btn, 'Copied');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(tsv).then(done).catch(() => fallbackCopy(tsv, done));
  } else {
    fallbackCopy(tsv, done);
  }
}

function fallbackCopy(text, done) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch (e) { /* clipboard unavailable */ }
  ta.remove();
  done();
}

function flash(btn, label) {
  const old = btn.textContent;
  btn.textContent = label;
  setTimeout(() => { btn.textContent = old; }, 1600);
}

// Line/bar toggle for a chart canvas: redraws the same data in the new form.
function bindToggle(scope, drawFn) {
  scope.querySelectorAll('[data-chart-type]').forEach((btn) => {
    btn.addEventListener('click', () => {
      scope.querySelectorAll('[data-chart-type]').forEach((b) => b.classList.remove('on'));
      btn.classList.add('on');
      drawFn(btn.getAttribute('data-chart-type'));
    });
  });
}

function yearRows(seriesKey, from, to) {
  const s = SERIES[seriesKey];
  return YEARS.map((y, i) => ({ year: y, value: s.values[i] }))
    .filter((r) => r.year >= from && r.year <= to);
}

// ---------------------------------------------------------------- dashboard
function renderDashboard(root) {
  const topProvinces = [...PROVINCES].sort((a, b) => b.population - a.population).slice(0, 5);
  const nextReleases = RELEASES.slice(0, 4);
  root.innerHTML = `
    <h1>Meridia at a glance</h1>
    <p class="lede">The Republic of Meridia in numbers — population, economy, work, prices
    and trade, published by Statistics Meridia, the national statistical office.
    All figures are for 2024 unless stated.</p>
    <div class="kpi-grid">
      ${kpi('Population', '18.42m', '+0.9% on 2023 · 41.2 people per km²')}
      ${kpi('GDP', 'M$412.6bn', 'M$22,400 per person · real growth +3.1%')}
      ${kpi('Unemployment', '5.2%', 'Employment 12.41m · participation 66.8%')}
      ${kpi('CPI inflation', '2.6%', 'Food 3.4% · housing 2.1% · energy −0.8%')}
    </div>
    <div class="grid-2">
      ${card('Real GDP growth, 2015–2024', `<canvas id="ch-gdp" class="chart"></canvas>
        ${sourceNote('National Accounts 2024, Statistics Meridia')}`)}
      ${card('Inflation and unemployment, 2015–2024', `<canvas id="ch-cpi-unemp" class="chart"></canvas>
        ${sourceNote('Consumer Price Index 2024; Labour Force Survey 2024')}`)}
    </div>
    <div class="grid-2">
      ${card('Latest releases', `<ul class="release-list">${nextReleases.map((r) =>
        `<li><span class="rel-status ${r.status.toLowerCase()}">${r.status}</span>
        <strong>${r.title}</strong><span class="rel-date">${r.date}</span></li>`).join('')}
        </ul><p><a href="#/releases">Full release calendar →</a></p>`)}
      ${card('Largest provinces by population, 2024', `<table class="data">
        <thead><tr><th>Province</th><th class="r">Population (m)</th><th class="r">GDP per capita</th></tr></thead>
        <tbody>${topProvinces.map((p) => `<tr><td>${p.name}</td><td class="r">${num(p.population)}</td>
        <td class="r">${money(p.gdpPerCapita)}</td></tr>`).join('')}</tbody></table>
        <p><a href="#/regions">All nine provinces →</a></p>`)}
    </div>
    <div class="grid-2">
      ${card('Trade, 2024', `<p class="big-stat">Exports M$168.3bn · imports M$154.7bn ·
        surplus M$13.6bn</p><p>Meridia sold M$13.6bn more abroad than it bought in 2024,
        the largest surplus of the decade.</p>`)}
      ${card('Environment, 2024', `<p class="big-stat">CO₂ 6.1 t per person · renewables 38.2% of
        electricity · forest 44.1% of land</p><p>Renewable electricity keeps climbing as
        wind and hydro replace coal in the generation mix.</p>`)}
    </div>`;
  lineChart(document.getElementById('ch-gdp'), {
    labels: YEARS, height: 250,
    series: [{ label: 'Real GDP growth (%)', colour: TEAL, values: SERIES.gdpGrowth.values }],
    format: (v) => v.toFixed(1) + '%',
  });
  lineChart(document.getElementById('ch-cpi-unemp'), {
    labels: YEARS, height: 250,
    series: [
      { label: 'CPI inflation (%)', colour: AMBER, values: SERIES.cpi.values },
      { label: 'Unemployment (%)', colour: SLATE_BLUE, values: SERIES.unemployment.values },
    ],
    format: (v) => v.toFixed(1) + '%',
  });
}

// --------------------------------------------------------------- population
function renderPopulation(root) {
  const total = PROVINCES.reduce((a, p) => a + p.population, 0);
  const pyramidTotal = AGE_GROUPS.reduce((a, g) => a + g.women + g.men, 0);
  root.innerHTML = `
    <h1>Population</h1>
    <p class="lede">18.42 million people in 2024, up 0.9% on 2023. Meridia is 68.4% urban,
    with a median age of 34.1 years and life expectancy of 78.9 years.</p>
    <div class="kpi-grid">
      ${kpi('Population', '18.42m', '+0.9% y/y · 2024')}
      ${kpi('Density', '41.2 / km²', 'Land area about 447,000 km²')}
      ${kpi('Urban share', '68.4%', 'Of the population')}
      ${kpi('Median age', '34.1 years', 'Life expectancy 78.9 years')}
    </div>
    <div class="grid-2">
      ${card('Population pyramid, 2024', `<canvas id="ch-pyramid" class="chart"></canvas>
        ${sourceNote('Population Estimates 2024, Statistics Meridia')}`)}
      ${card('Age structure, 2024', `<table class="data">
        <thead><tr><th>Age group</th><th class="r">Women (000s)</th><th class="r">Men (000s)</th>
        <th class="r">Total (000s)</th><th class="r">Share</th></tr></thead>
        <tbody>${AGE_GROUPS.map((g) => `<tr><td>${g.group}</td><td class="r">${g.women.toLocaleString('en-US')}</td>
        <td class="r">${g.men.toLocaleString('en-US')}</td><td class="r">${(g.women + g.men).toLocaleString('en-US')}</td>
        <td class="r">${pct(((g.women + g.men) / pyramidTotal) * 100)}</td></tr>`).join('')}</tbody></table>
        <p>Women live longer: life expectancy is 81.2 years for women and 76.6 for men.
        Fertility is 1.82 children per woman.</p>
        ${sourceNote('Population Estimates 2024, Statistics Meridia')}`)}
    </div>
    ${card('Population by province, 2024', `<table class="data" id="tbl-prov-pop">
      <thead><tr><th data-type="text">Province</th><th class="r" data-type="num">Population (m)</th>
      <th class="r" data-type="num">Share of Meridia</th><th class="r" data-type="num">Density note</th></tr></thead>
      <tbody>${PROVINCES.map((p) => `<tr><td>${p.name}</td><td class="r">${num(p.population)}</td>
      <td class="r">${pct((p.population / total) * 100)}</td>
      <td class="r">${p.name === 'Alderport' ? 'Capital, densest' : '—'}</td></tr>`).join('')}</tbody></table>
      <p>Click a column heading to sort. The nine provinces sum to ${num(total)} million.
      Alderport, the capital, holds more than one in five Meridians.</p>
      ${sourceNote('Population Estimates 2024, Statistics Meridia')}`)}
    <p class="note">Density: at 41.2 people per km² Meridia is sparsely settled outside its
    cities — two-thirds of the population lives in urban areas, and the northern
    highlands hold fewer than 15 people per km².</p>`;
  pyramidChart(document.getElementById('ch-pyramid'), PYRAMID);
  makeSortable(document.getElementById('tbl-prov-pop'));
}

// ----------------------------------------------------------------- economy
function renderEconomy(root) {
  root.innerHTML = `
    <h1>Economy</h1>
    <p class="lede">GDP of M$412.6bn in 2024, M$22,400 per person. Real growth was +3.1%,
    after +2.4% in 2023. Services produce 61.2% of GDP, industry 27.8% and
    agriculture 11.0%.</p>
    <div class="kpi-grid">
      ${kpi('GDP', 'M$412.6bn', '2024, current prices')}
      ${kpi('GDP per capita', 'M$22,400', '2024')}
      ${kpi('Real growth', '+3.1%', '2023: +2.4%')}
      ${kpi('Trade surplus', 'M$13.6bn', 'Exports M$168.3bn, imports M$154.7bn')}
    </div>
    <div class="grid-2">
      ${card('Real GDP growth, 2015–2024', `<div class="toggle" data-toggle>
        <button data-chart-type="line" class="on">Line</button>
        <button data-chart-type="bar">Bar</button></div>
        <canvas id="ch-gdp-trend" class="chart"></canvas>
        ${sourceNote('National Accounts 2024, Statistics Meridia')}`, 'chart-card')}
      ${card('GDP by sector, 2024', `<canvas id="ch-sectors" class="chart"></canvas>
        <ul class="legend-list">${SECTORS.map((s) => `<li><span class="swatch" style="background:${s.colour}"></span>
        ${s.name} — ${pct(s.share)}</li>`).join('')}</ul>
        ${sourceNote('National Accounts 2024, Statistics Meridia')}`)}
    </div>
    <div class="grid-2">
      ${card('Exports and imports, 2015–2024 (M$bn)', `<canvas id="ch-trade" class="chart"></canvas>
        ${sourceNote('International Trade 2024, Statistics Meridia')}`)}
      ${card('Key indicators, 2024', `<table class="data" id="tbl-econ">
        <thead><tr><th data-type="text">Indicator</th><th data-type="text">Value</th><th data-type="text">Note</th></tr></thead>
        <tbody>${ECONOMY_INDICATORS.map((r) => `<tr><td>${r.indicator}</td><td>${r.value}</td><td>${r.note}</td></tr>`).join('')}</tbody></table>
        ${sourceNote('National Accounts 2024, Statistics Meridia')}`)}
    </div>`;
  const trendCard = root.querySelector('.chart-card');
  const drawTrend = (type) => {
    const cv = document.getElementById('ch-gdp-trend');
    if (type === 'bar') {
      barChart(cv, { labels: YEARS, values: SERIES.gdpGrowth.values, colour: TEAL, height: 250, format: (v) => v.toFixed(1) + '%' });
    } else {
      lineChart(cv, { labels: YEARS, height: 250, series: [{ label: 'Real GDP growth (%)', colour: TEAL, values: SERIES.gdpGrowth.values }], format: (v) => v.toFixed(1) + '%' });
    }
  };
  drawTrend('line');
  bindToggle(trendCard, drawTrend);
  donutChart(document.getElementById('ch-sectors'), SECTORS);
  groupedBarChart(document.getElementById('ch-trade'), {
    labels: YEARS, height: 250,
    series: [
      { label: 'Exports', colour: TEAL, values: SERIES.exports.values },
      { label: 'Imports', colour: AMBER, values: SERIES.imports.values },
    ],
    format: (v) => v.toFixed(0),
  });
  makeSortable(document.getElementById('tbl-econ'));
}

// ------------------------------------------------------------------ labour
function renderLabour(root) {
  root.innerHTML = `
    <h1>Labour market</h1>
    <p class="lede">Unemployment fell to 5.2% in 2024, the lowest in a decade. 12.41 million
    people are employed and 66.8% of working-age Meridians take part in the
    labour force. The median monthly wage is M$2,940.</p>
    <div class="kpi-grid">
      ${kpi('Unemployment', '5.2%', '2024 · 2015: 6.8%')}
      ${kpi('Employment', '12.41m', 'People in work')}
      ${kpi('Participation', '66.8%', 'Of working-age population')}
      ${kpi('Median wage', 'M$2,940', 'Per month, 2024')}
    </div>
    <div class="grid-2">
      ${card('Unemployment rate, 2015–2024', `<canvas id="ch-unemp" class="chart"></canvas>
        ${sourceNote('Labour Force Survey 2024, Statistics Meridia')}`)}
      ${card('Employment by sector, 2024 (millions)', `<canvas id="ch-emp" class="chart"></canvas>
        <p>Services employ 8.42m people, industry 2.96m and agriculture 1.03m —
        together 12.41m.</p>${sourceNote('Labour Force Survey 2024, Statistics Meridia')}`)}
    </div>
    ${card('Median monthly wage by sector, 2024', `<table class="data" id="tbl-wages">
      <thead><tr><th data-type="text">Sector</th><th class="r" data-type="num">Median wage (M$/month)</th>
      <th class="r" data-type="num">Change on 2023</th></tr></thead>
      <tbody>${WAGES.map((w) => `<tr><td>${w.sector}</td><td class="r">${money(w.wage)}</td>
      <td class="r">${w.change}</td></tr>`).join('')}</tbody></table>
      <p>Wages rose fastest in services, where pay is highest. Farm wages remain
      well below the national median of M$2,940.</p>
      ${sourceNote('Labour Force Survey 2024, Statistics Meridia')}`)}`;
  lineChart(document.getElementById('ch-unemp'), {
    labels: YEARS, height: 250,
    series: [{ label: 'Unemployment (%)', colour: SLATE_BLUE, values: SERIES.unemployment.values }],
    format: (v) => v.toFixed(1) + '%',
  });
  barChart(document.getElementById('ch-emp'), {
    labels: EMPLOYMENT_SECTORS.map((s) => s.name),
    values: EMPLOYMENT_SECTORS.map((s) => s.value),
    colour: TEAL, height: 250, format: (v) => v.toFixed(2) + 'm',
  });
  makeSortable(document.getElementById('tbl-wages'));
}

// ------------------------------------------------------------------ prices
function renderPrices(root) {
  root.innerHTML = `
    <h1>Prices</h1>
    <p class="lede">Consumer prices rose 2.6% in 2024, down from 3.6% in 2023 and 4.9% in
    2022. Food prices rose fastest at 3.4%; energy prices fell 0.8%.</p>
    <div class="kpi-grid">
      ${kpi('CPI inflation', '2.6%', '2024 · 2023: 3.6%')}
      ${kpi('Food', '+3.4%', 'Fastest-rising category')}
      ${kpi('Housing', '+2.1%', 'Largest basket weight, 27.8%')}
      ${kpi('Energy', '−0.8%', 'Prices fell in 2024')}
    </div>
    <div class="grid-2">
      ${card('CPI inflation, 2015–2024', `<canvas id="ch-cpi" class="chart"></canvas>
        ${sourceNote('Consumer Price Index 2024, Statistics Meridia')}`)}
      ${card('Price change by category, 2024', `<canvas id="ch-cat" class="chart"></canvas>
        ${sourceNote('Consumer Price Index 2024, Statistics Meridia')}`)}
    </div>
    ${card('Consumer basket, 2024', `<table class="data" id="tbl-basket">
      <thead><tr><th data-type="text">Category</th><th class="r" data-type="num">Annual change</th>
      <th class="r" data-type="num">Basket weight</th></tr></thead>
      <tbody>${CPI_CATEGORIES.map((c) => `<tr><td>${c.name}</td><td class="r">${signed(c.change)}</td>
      <td class="r">${pct(c.weight)}</td></tr>`).join('')}</tbody></table>
      <p>The basket weights sum to 100%. Housing is the largest single cost for
      Meridian households, followed by food at 24.1%.</p>
      ${sourceNote('Consumer Price Index 2024, Statistics Meridia')}`)}`;
  lineChart(document.getElementById('ch-cpi'), {
    labels: YEARS, height: 250,
    series: [{ label: 'CPI inflation (%)', colour: AMBER, values: SERIES.cpi.values }],
    format: (v) => v.toFixed(1) + '%',
  });
  barChart(document.getElementById('ch-cat'), {
    labels: CPI_CATEGORIES.map((c) => c.name.replace(' and non-alcoholic drinks', '').replace(', water and energy', '').replace('Other goods and services', 'Other')),
    values: CPI_CATEGORIES.map((c) => c.change),
    colour: TEAL, height: 250, format: (v) => signed(v),
  });
  makeSortable(document.getElementById('tbl-basket'));
}

// ------------------------------------------------------------------- trade
function renderTrade(root) {
  root.innerHTML = `
    <h1>Trade</h1>
    <p class="lede">Meridia exported M$168.3bn and imported M$154.7bn in 2024 — a surplus of
    M$13.6bn, the largest of the decade. Alderland takes 18.2% of exports.</p>
    <div class="kpi-grid">
      ${kpi('Exports', 'M$168.3bn', '2024 · +5.6% on 2023')}
      ${kpi('Imports', 'M$154.7bn', '2024 · +3.3% on 2023')}
      ${kpi('Trade balance', '+M$13.6bn', 'Largest surplus since 2015')}
      ${kpi('Top partner', 'Alderland', '18.2% of exports')}
    </div>
    <div class="grid-2">
      ${card('Exports and imports, 2015–2024 (M$bn)', `<div class="toggle" data-toggle>
        <button data-chart-type="bar" class="on">Bar</button>
        <button data-chart-type="line">Line</button></div>
        <canvas id="ch-trade2" class="chart"></canvas>
        ${sourceNote('International Trade 2024, Statistics Meridia')}`, 'chart-card')}
      ${card('Trade balance, 2015–2024 (M$bn)', `<canvas id="ch-bal" class="chart"></canvas>
        <p>Meridia has run a surplus every year since 2015. The surplus dipped to
        M$2.8bn in 2020, then widened every year after.</p>
        ${sourceNote('International Trade 2024, Statistics Meridia')}`)}
    </div>
    ${card('Export partners, share of exports, 2024', `<table class="data" id="tbl-partners">
      <thead><tr><th data-type="text">Partner</th><th class="r" data-type="num">Share of exports</th>
      <th class="r" data-type="num">Value (M$bn)</th></tr></thead>
      <tbody>${TRADE_PARTNERS.map((p) => `<tr><td>${p.partner}</td><td class="r">${pct(p.share)}</td>
      <td class="r">${num((168.3 * p.share) / 100, 1)}</td></tr>`).join('')}</tbody></table>
      <p>The seven rows sum to 100% of exports. Alderland alone buys M$30.6bn of
      Meridian goods and services.</p>
      ${sourceNote('International Trade 2024, Statistics Meridia')}`)}`;
  const tradeCard = root.querySelector('.chart-card');
  const drawTrade = (type) => {
    const cv = document.getElementById('ch-trade2');
    const series = [
      { label: 'Exports', colour: TEAL, values: SERIES.exports.values },
      { label: 'Imports', colour: AMBER, values: SERIES.imports.values },
    ];
    if (type === 'line') {
      lineChart(cv, { labels: YEARS, height: 250, series, format: (v) => v.toFixed(0) });
    } else {
      groupedBarChart(cv, { labels: YEARS, height: 250, series, format: (v) => v.toFixed(0) });
    }
  };
  drawTrade('bar');
  bindToggle(tradeCard, drawTrade);
  lineChart(document.getElementById('ch-bal'), {
    labels: YEARS, height: 250,
    series: [{ label: 'Trade balance (M$bn)', colour: TEAL, values: TRADE_BALANCE }],
    format: (v) => v.toFixed(1),
  });
  makeSortable(document.getElementById('tbl-partners'));
}

// ------------------------------------------------------------------ health
function renderHealth(root) {
  root.innerHTML = `
    <h1>Health</h1>
    <p class="lede">Meridia has 4.2 hospital beds and 3.1 doctors per 1,000 people in 2024.
    Infant mortality is 4.8 per 1,000 live births. Life expectancy is 78.9 years.</p>
    <div class="kpi-grid">
      ${kpi('Hospital beds', '4.2 / 1,000', '2015: 4.6 per 1,000')}
      ${kpi('Doctors', '3.1 / 1,000', '2015: 2.4 per 1,000')}
      ${kpi('Infant mortality', '4.8 / 1,000', 'Live births, 2024')}
      ${kpi('Life expectancy', '78.9 years', 'Women 81.2 · men 76.6')}
    </div>
    <div class="grid-2">
      ${card('Beds and doctors per 1,000 people, 2015–2024', `<canvas id="ch-health" class="chart"></canvas>
        ${sourceNote('Health Statistics 2024, Statistics Meridia')}`)}
      ${card('Leading causes of death, 2024', `<table class="data" id="tbl-causes">
        <thead><tr><th data-type="text">Cause</th><th class="r" data-type="num">Share of deaths</th></tr></thead>
        <tbody>${CAUSES_OF_DEATH.map((c) => `<tr><td>${c.cause}</td><td class="r">${pct(c.share)}</td></tr>`).join('')}</tbody></table>
        <p>Cardiovascular disease and cancer together account for 56.0% of deaths.</p>
        ${sourceNote('Health Statistics 2024, Statistics Meridia')}`)}
    </div>
    <p class="note">Beds per 1,000 people have eased as care moved out of hospitals, while
    doctors per 1,000 have risen every year since 2015 — from 2.4 to 3.1.</p>`;
  lineChart(document.getElementById('ch-health'), {
    labels: YEARS, height: 250,
    series: [
      { label: 'Hospital beds / 1,000', colour: TEAL, values: HEALTH_TREND.beds },
      { label: 'Doctors / 1,000', colour: AMBER, values: HEALTH_TREND.doctors },
    ],
    format: (v) => v.toFixed(1),
  });
  makeSortable(document.getElementById('tbl-causes'));
}

// -------------------------------------------------------------- education
function renderEducation(root) {
  root.innerHTML = `
    <h1>Education</h1>
    <p class="lede">Literacy is 98.7% and 54.3% of young Meridians enrol in tertiary
    education. The country has 6,214 schools teaching 2.86 million pupils.</p>
    <div class="kpi-grid">
      ${kpi('Literacy', '98.7%', 'Aged 15 and over, 2024')}
      ${kpi('Tertiary enrolment', '54.3%', 'Of the age group, 2024')}
      ${kpi('Schools', '6,214', 'Primary, secondary and tertiary')}
      ${kpi('Pupils', '2.86m', 'Enrolled in 2024')}
    </div>
    <div class="grid-2">
      ${card('Tertiary enrolment, 2015–2024 (%)', `<canvas id="ch-tert" class="chart"></canvas>
        ${sourceNote('Education Statistics 2024, Statistics Meridia')}`)}
      ${card('Literacy by age, 2024', `<table class="data" id="tbl-lit">
        <thead><tr><th data-type="text">Age group</th><th class="r" data-type="num">Literacy rate</th></tr></thead>
        <tbody>${LITERACY_BY_AGE.map((r) => `<tr><td>${r.age}</td><td class="r">${pct(r.rate)}</td></tr>`).join('')}</tbody></table>
        <p>Literacy is near-universal below 45 and lowest, 96.9%, among those 65 and over.</p>
        ${sourceNote('Education Statistics 2024, Statistics Meridia')}`)}
    </div>
    ${card('Schools and pupils by level, 2024', `<table class="data" id="tbl-schools">
      <thead><tr><th data-type="text">Level</th><th class="r" data-type="num">Schools</th>
      <th class="r" data-type="num">Pupils (millions)</th></tr></thead>
      <tbody>${SCHOOLS.map((s) => `<tr><td>${s.level}</td><td class="r">${s.schools.toLocaleString('en-US')}</td>
      <td class="r">${num(s.pupils)}</td></tr>`).join('')}
      <tr class="total"><td>Total</td><td class="r">6,214</td><td class="r">2.86</td></tr></tbody></table>
      ${sourceNote('Education Statistics 2024, Statistics Meridia')}`)}`;
  lineChart(document.getElementById('ch-tert'), {
    labels: YEARS, height: 250,
    series: [{ label: 'Tertiary enrolment (%)', colour: TEAL, values: TERTIARY_TREND }],
    format: (v) => v.toFixed(1) + '%',
  });
  makeSortable(document.getElementById('tbl-lit'));
  makeSortable(document.getElementById('tbl-schools'));
}

// ----------------------------------------------------------------- regions
function renderRegions(root) {
  const total = PROVINCES.reduce((a, p) => a + p.population, 0);
  root.innerHTML = `
    <h1>Regions</h1>
    <p class="lede">Nine provinces, from Alderport's 3.86 million people to Fenwick's 1.45
    million. Click any row to see a province in detail. Click a column heading
    to sort; use the search box to filter.</p>
    <div class="controls">
      <label>Search provinces <input type="search" id="q-prov" placeholder="Type a province name…" aria-label="Search provinces"></label>
    </div>
    ${card('All provinces, 2024', `<table class="data" id="tbl-regions">
      <thead><tr><th data-type="text">Province</th><th class="r" data-type="num">Population (m)</th>
      <th class="r" data-type="num">GDP per capita (M$)</th><th class="r" data-type="num">Unemployment</th>
      <th class="r" data-type="num">Share of Meridia</th></tr></thead>
      <tbody>${PROVINCES.map((p) => `<tr data-prov="${p.name}"><td>${p.name}</td><td class="r">${num(p.population)}</td>
      <td class="r">${p.gdpPerCapita.toLocaleString('en-US')}</td><td class="r">${pct(p.unemployment)}</td>
      <td class="r">${pct((p.population / total) * 100)}</td></tr>`).join('')}
      <tr class="total"><td>Meridia</td><td class="r">${num(total)}</td><td class="r">22,400</td>
      <td class="r">5.2%</td><td class="r">100.0%</td></tr></tbody></table>
      <p>Alderport has the highest GDP per capita (M$31,200) and the second-lowest
      unemployment (4.6%). Fenwick has the lowest GDP per capita (M$15,400) and
      the highest unemployment (7.4%).</p>
      ${sourceNote('Regional Statistics 2024, Statistics Meridia')}`)}
    <div id="province-detail" class="detail" aria-live="polite">
      <p>Select a province in the table above to see its detail here.</p>
    </div>
    ${card('GDP per capita by province, 2024 (M$)', `<canvas id="ch-gdppc" class="chart"></canvas>
      ${sourceNote('Regional Statistics 2024, Statistics Meridia')}`)}`;
  const table = document.getElementById('tbl-regions');
  makeSortable(table);
  attachSearch(document.getElementById('q-prov'), table);
  const detail = document.getElementById('province-detail');
  table.querySelectorAll('tbody tr[data-prov]').forEach((tr) => {
    tr.addEventListener('click', () => {
      const p = PROVINCES.find((x) => x.name === tr.getAttribute('data-prov'));
      const share = (p.population / total) * 100;
      const impliedGdp = (p.population * p.gdpPerCapita) / 1000;
      table.querySelectorAll('tr').forEach((r) => r.classList.remove('selected'));
      tr.classList.add('selected');
      detail.innerHTML = `<h2>${p.name}</h2>
        <div class="kpi-grid">
          ${kpi('Population', num(p.population) + 'm', pct(share) + ' of Meridia')}
          ${kpi('GDP per capita', money(p.gdpPerCapita), 'National: M$22,400')}
          ${kpi('Unemployment', pct(p.unemployment), 'National: 5.2%')}
          ${kpi('Implied GDP', 'M$' + num(impliedGdp, 1) + 'bn', 'Population × GDP per capita')}
        </div>
        <p>${p.name === 'Alderport' ? 'The capital and largest province — home to more than one in five Meridians, with the highest GDP per capita in the country.' : ''}</p>`;
    });
  });
  barChart(document.getElementById('ch-gdppc'), {
    labels: PROVINCES.map((p) => p.name),
    values: PROVINCES.map((p) => p.gdpPerCapita),
    colour: TEAL, height: 250, format: (v) => 'M$' + v.toLocaleString('en-US'),
  });
}

// --------------------------------------------------------------- releases
function renderReleases(root) {
  root.innerHTML = `
    <h1>Release calendar</h1>
    <p class="lede">When Statistics Meridia publishes. Dates marked Scheduled are planned
    releases — they have not been published yet. Use the search box to find a
    release by name.</p>
    <div class="controls">
      <label>Search releases <input type="search" id="q-rel" placeholder="Type a release name…" aria-label="Search releases"></label>
    </div>
    ${card('Release calendar', `<table class="data" id="tbl-releases">
      <thead><tr><th data-type="text">Release</th><th data-type="text">Date</th><th data-type="text">Status</th></tr></thead>
      <tbody>${RELEASES.map((r) => `<tr><td>${r.title}</td><td>${r.date}</td>
      <td><span class="rel-status ${r.status.toLowerCase()}">${r.status}</span></td></tr>`).join('')}</tbody></table>
      <p>Next release: GDP, third quarter 2026, on 28 Nov 2026. Releases appear here
      at 09:00 Alderport time on the day.</p>`)}
    <p class="note">Releases are announced at least four weeks ahead. If a date moves, the
    change is published here and the old date stays visible with a note.</p>`;
  attachSearch(document.getElementById('q-rel'), document.getElementById('tbl-releases'));
  makeSortable(document.getElementById('tbl-releases'));
}

// ----------------------------------------------------------------- methods
function renderMethods(root) {
  root.innerHTML = `
    <h1>Methods and sources</h1>
    <p class="lede">How Statistics Meridia produces its figures, what each indicator means,
    and where every number on this site comes from.</p>
    ${card('Methodology', `<p>Statistics Meridia is the national statistical office of the
    Republic of Meridia. Population figures come from the civil register and the
    annual population estimates. GDP is compiled from the national accounts
    following the System of National Accounts. Prices come from a monthly survey
    of 12,400 outlets and 48,000 price quotes. Labour figures come from the
    quarterly Labour Force Survey of 22,000 households. Trade figures come from
    customs declarations and the services trade survey.</p>`)}
    ${card('Definitions', `<dl class="defs">
      <dt>Real GDP growth</dt><dd>Change in GDP at constant prices, year on year.</dd>
      <dt>CPI inflation</dt><dd>Change in the consumer price index over 12 months.</dd>
      <dt>Unemployment rate</dt><dd>Unemployed people as a share of the labour force (employed plus unemployed).</dd>
      <dt>Labour force participation</dt><dd>Labour force as a share of the working-age population (15–64).</dd>
      <dt>Median monthly wage</dt><dd>The wage earned by the middle worker when all full-time wages are ranked.</dd>
      <dt>Trade balance</dt><dd>Exports of goods and services minus imports.</dd>
      <dt>GDP per capita</dt><dd>GDP divided by the mid-year population.</dd>
      </dl>`)}
    ${card('Revision policy', `<p>National accounts are revised twice: a first revision with
    the following quarter's release and a final revision in the annual
    benchmark, published each March. CPI figures are never revised. Population
    estimates are revised after each census; the next census is in 2027.
    Every revision is published here with a note explaining what changed and why.</p>`)}
    ${card('Sources', `<p>National Accounts 2024 · Population Estimates 2024 ·
    Labour Force Survey 2024 · Consumer Price Index 2024 · International Trade
    2024 · Health Statistics 2024 · Education Statistics 2024 · Regional
    Statistics 2024 — all published by Statistics Meridia. Figures on this site
    are for 2024 unless a chart or table says otherwise.</p>`)}
    ${card('Contact', `<p>Statistics Meridia, 1 Charter Square, Alderport, Republic of
    Meridia.<br>Email: contact@statistics.meridia<br>
    Media enquiries: press@statistics.meridia<br>
    Data requests are answered within five working days.</p>`)}`;
}

// --------------------------------------------------------------- explorer
function renderExplorer(root) {
  const options = Object.entries(SERIES).map(([key, s]) =>
    `<option value="${key}">${s.label} (${s.unit})</option>`).join('');
  const yearOptions = YEARS.map((y) => `<option value="${y}">${y}</option>`).join('');
  root.innerHTML = `
    <h1>Data explorer</h1>
    <p class="lede">Pick an indicator and a year range, then chart it, read the table,
    download it as a CSV file or copy it. Everything here works offline — the
    data lives in this site's own files.</p>
    <div class="controls explorer-controls">
      <label>Indicator
        <select id="ex-indicator">${options}</select></label>
      <label>From year
        <select id="ex-from">${yearOptions}</select></label>
      <label>To year
        <select id="ex-to">${yearOptions}</select></label>
      <span class="toggle" data-toggle>
        <button data-chart-type="line" class="on">Line</button>
        <button data-chart-type="bar">Bar</button></span>
    </div>
    ${card('Chart', `<canvas id="ch-explorer" class="chart"></canvas>
      <p class="source" id="ex-source"></p>`, 'chart-card')}
    ${card('Data table', `<div class="controls">
        <button id="ex-csv" type="button">Download CSV</button>
        <button id="ex-copy" type="button">Copy table</button></div>
      <table class="data" id="tbl-explorer">
        <thead><tr><th data-type="num">Year</th><th class="r" data-type="num">Value</th></tr></thead>
        <tbody></tbody></table>`)}`;
  const indicator = document.getElementById('ex-indicator');
  const fromSel = document.getElementById('ex-from');
  const toSel = document.getElementById('ex-to');
  const table = document.getElementById('tbl-explorer');
  fromSel.value = '2015';
  toSel.value = '2024';
  let chartType = 'line';
  const draw = () => {
    const key = indicator.value;
    const from = Number(fromSel.value);
    const to = Number(toSel.value);
    const lo = Math.min(from, to);
    const hi = Math.max(from, to);
    const rows = yearRows(key, lo, hi);
    const s = SERIES[key];
    const cv = document.getElementById('ch-explorer');
    const fmt = (v) => s.unit === 'million' ? v.toFixed(2) : (s.unit === 'M$ billion' ? v.toFixed(1) : v.toFixed(1));
    if (chartType === 'bar') {
      barChart(cv, { labels: rows.map((r) => r.year), values: rows.map((r) => r.value), colour: TEAL, height: 260, format: fmt });
    } else {
      lineChart(cv, { labels: rows.map((r) => r.year), height: 260, series: [{ label: s.label, colour: TEAL, values: rows.map((r) => r.value) }], format: fmt });
    }
    table.querySelector('tbody').innerHTML = rows.map((r) =>
      `<tr><td>${r.year}</td><td class="r">${fmt(r.value)} ${s.unit}</td></tr>`).join('');
    document.getElementById('ex-source').textContent = 'Source: ' + s.source;
  };
  [indicator, fromSel, toSel].forEach((el) => el.addEventListener('change', draw));
  bindToggle(root.querySelector('.explorer-controls'), (type) => { chartType = type; draw(); });
  document.getElementById('ex-csv').addEventListener('click', (e) =>
    downloadCSV(table, 'meridia-' + indicator.value + '.csv', e.currentTarget));
  document.getElementById('ex-copy').addEventListener('click', (e) =>
    copyTable(table, e.currentTarget));
  makeSortable(table);
  draw();
}

// ------------------------------------------------------------------ router
const RENDERERS = {
  '/': renderDashboard,
  '/population': renderPopulation,
  '/economy': renderEconomy,
  '/labour': renderLabour,
  '/prices': renderPrices,
  '/trade': renderTrade,
  '/health': renderHealth,
  '/education': renderEducation,
  '/regions': renderRegions,
  '/releases': renderReleases,
  '/methods': renderMethods,
  '/explorer': renderExplorer,
};

export function renderPage(path, root) {
  (RENDERERS[path] || renderDashboard)(root);
}
