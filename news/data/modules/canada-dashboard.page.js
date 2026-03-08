const SUPABASE_URL = 'https://mkpcliytqudclkwtewru.supabase.co';
const SUPABASE_KEY = 'sb_publishable_S2uWAddQEXhWJgGeIF_ZbQ_H_thz2hw';
const GOOGLE_CHARTS_LOADER = 'https://www.gstatic.com/charts/loader.js';
const CANADA_LOCAL_TIMEZONE = 'Asia/Shanghai';

const CANADA_CHART_SPECS = {
    gas_alberta_vs_regulated: {
        containerId: 'ggx-chart-gas-alberta-vs-regulated',
        seriesOrder: ['Gas Alberta', 'WTD AVG', 'DERS', 'AUI'],
        colors: ['#3dd6f5', '#5dd62c', '#ff6b6b', '#f7b84a'],
        lineIndexes: [2, 3],
    },
    retailer_rates: {
        containerId: 'ggx-chart-retailer-rates',
        seriesOrder: ['Monthly Index', 'Forecast', 'ATCO 5 Year', 'ENCOR 5 Year', 'ENMAX 5 Year'],
        colors: ['#ff6b6b', '#3dd6f5', '#f7b84a', '#5dd62c', '#a88bff'],
        lineIndexes: [2, 3, 4],
    },
    aeco_ng_current: {
        containerId: 'ggx-chart-aeco-ng-current',
        seriesOrder: ['Daily Index', 'Monthly Index'],
        colors: ['#3dd6f5', '#ff6b6b'],
        lineIndexes: [1],
    },
    aeco_ng_prior: {
        containerId: 'ggx-chart-aeco-ng-prior',
        seriesOrder: ['Daily Index', 'Monthly Index'],
        colors: ['#3dd6f5', '#ff6b6b'],
        lineIndexes: [1],
    },
    aeco_c_futures: {
        containerId: 'ggx-chart-aeco-c-futures',
        seriesOrder: ['Current', 'One Year Ago', 'One Month Ago'],
        colors: ['#3dd6f5', '#f7b84a', '#ff6b6b'],
        lineIndexes: [1, 2],
    },
};

const GASGX_UI_ICONS = {
    dashboard: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M7 9.5h10M7 13h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    chartBars: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19.5V12.5M12 19.5V8.5M19 19.5V5.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M4 19.5h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    rates: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 18.5h14M7.5 18.5v-5.5M12 18.5v-8.5M16.5 18.5v-3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M5.5 8.5l3-3 2.5 2.5 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    currentMonth: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="5.5" width="16" height="14" rx="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M4 9.5h16M9 3.8v3.4M15 3.8v3.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="14" r="2" fill="currentColor"/></svg>',
    priorMonth: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="5.5" width="16" height="14" rx="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M4 9.5h16M9 3.8v3.4M15 3.8v3.4M14.8 14h-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    futures: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.5 18.5h15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M6 15.5l3.8-3.8 3 2.9 5.2-5.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 9.5h2.5V12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    table: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M3.5 10h17M9 10v8.5M14.8 10v8.5" stroke="currentColor" stroke-width="1.4"/></svg>',
};

const state = {
    canadaRun: null,
    canadaPointRows: [],
    canadaTableRows: [],
    canadaStatus: {
        type: 'loading',
        message: 'Fetching Canada dashboard data...',
    },
    chartsResizeBound: false,
};

const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
let googleChartsReadyPromise = null;

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function mountIcons() {
    Object.entries(GASGX_UI_ICONS).forEach(([key, svg]) => {
        const node = document.getElementById(`ggx-icon-${key}`);
        if (node) node.innerHTML = svg;
    });
}

function ensureScriptLoaded(src, id) {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            if (existing.dataset.loaded === 'true') {
                resolve();
                return;
            }
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error(`Failed to load script: ${src}`)), { once: true });
            return;
        }

        const script = document.createElement('script');
        if (id) script.id = id;
        script.src = src;
        script.async = true;
        script.onload = () => {
            script.dataset.loaded = 'true';
            resolve();
        };
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
    });
}

async function ensureGoogleChartsLoaded() {
    if (window.google?.visualization?.ComboChart) return;
    if (googleChartsReadyPromise) {
        await googleChartsReadyPromise;
        return;
    }

    googleChartsReadyPromise = (async () => {
        await ensureScriptLoaded(GOOGLE_CHARTS_LOADER, 'ggx-google-charts-loader');
        await new Promise((resolve, reject) => {
            if (!window.google?.charts) {
                reject(new Error('Google Charts runtime unavailable.'));
                return;
            }
            window.google.charts.load('current', { packages: ['corechart'] });
            window.google.charts.setOnLoadCallback(() => {
                if (window.google?.visualization?.ComboChart) resolve();
                else reject(new Error('Google Charts corechart package failed to initialize.'));
            });
        });
    })();

    await googleChartsReadyPromise;
}

function formatDateTimeByTimezone(value, timezone) {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--';
    return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).format(date);
}

function formatUtcDateTime(value) {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--';
    const pad = (num) => String(num).padStart(2, '0');
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())} UTC`;
}

function setCanadaStatus(type, message) {
    const container = document.getElementById('ggx-canada-status');
    if (!container) return;
    const normalizedType = String(type || 'loading').toLowerCase();
    const color = normalizedType === 'error' ? 'text-red-400' : normalizedType === 'ok' ? 'text-gas-green' : 'text-yellow-300';
    container.innerHTML = `<span class="${color} font-semibold">${escapeHtml(normalizedType.toUpperCase())}</span> ${escapeHtml(message || '--')}`;
}

function renderRunSummary() {
    const runLocal = document.getElementById('ggx-canada-run-local');
    const runUtc = document.getElementById('ggx-canada-run-utc');
    const runId = document.getElementById('ggx-canada-run-id');
    if (!runLocal || !runUtc || !runId) return;

    const run = state.canadaRun;
    if (!run) {
        runLocal.textContent = '--';
        runUtc.textContent = '--';
        runId.textContent = 'run_id: --';
        return;
    }

    runLocal.textContent = `${formatDateTimeByTimezone(run.run_at_utc, CANADA_LOCAL_TIMEZONE)} (${CANADA_LOCAL_TIMEZONE})`;
    runUtc.textContent = formatUtcDateTime(run.run_at_utc);
    runId.textContent = `run_id: ${run.run_id || '--'}`;
}

async function loadCanadaLatestRun() {
    const { data, error } = await client
        .from('canada_scrape_runs')
        .select('run_id,run_at_utc,run_hour_utc,status,chart_success_count,point_count')
        .eq('status', 'success')
        .order('run_hour_utc', { ascending: false })
        .limit(1);

    if (error) throw error;
    if (!Array.isArray(data) || !data.length) throw new Error('No successful Canada scrape run found.');
    return data[0];
}

async function loadCanadaRows(runHourUtc) {
    const [pointsRes, tablesRes] = await Promise.all([
        client
            .from('canada_chart_points')
            .select('chart_id,chart_title,row_index,x_label,x_date,series_name,series_value,currency,unit')
            .eq('run_hour_utc', runHourUtc)
            .order('row_index', { ascending: true }),
        client
            .from('canada_chart_tables')
            .select('chart_id,chart_title,headers,table_rows,row_count,source_asset_url')
            .eq('run_hour_utc', runHourUtc),
    ]);

    if (pointsRes.error) throw pointsRes.error;
    if (tablesRes.error) throw tablesRes.error;

    return {
        pointRows: Array.isArray(pointsRes.data) ? pointsRes.data : [],
        tableRows: Array.isArray(tablesRes.data) ? tablesRes.data : [],
    };
}

async function loadCanadaDashboardData() {
    state.canadaStatus = {
        type: 'loading',
        message: 'Fetching latest successful run from Supabase...',
    };
    setCanadaStatus(state.canadaStatus.type, state.canadaStatus.message);

    try {
        const run = await loadCanadaLatestRun();
        state.canadaRun = run;

        const rows = await loadCanadaRows(run.run_hour_utc);
        state.canadaPointRows = rows.pointRows;
        state.canadaTableRows = rows.tableRows;

        if (!state.canadaPointRows.length) {
            state.canadaStatus = {
                type: 'error',
                message: `No point data found for run_hour ${run.run_hour_utc}.`,
            };
            return;
        }

        state.canadaStatus = {
            type: 'ok',
            message: `Loaded ${state.canadaPointRows.length} point rows and ${state.canadaTableRows.length} static tables.`,
        };
    } catch (error) {
        console.error('Canada dashboard load failed:', error);
        state.canadaRun = null;
        state.canadaPointRows = [];
        state.canadaTableRows = [];
        state.canadaStatus = {
            type: 'error',
            message: error?.message || 'Failed to load Canada dashboard data.',
        };
    }
}

function toCanadaChartMatrix(rows, seriesOrder) {
    const grouped = new Map();
    rows.forEach((row) => {
        const xLabel = String(row?.x_label || '').trim();
        if (!xLabel) return;

        if (!grouped.has(xLabel)) {
            grouped.set(xLabel, {
                x_label: xLabel,
                x_date: row?.x_date || '',
                row_index: Number(row?.row_index) || 0,
                values: {},
            });
        }

        grouped.get(xLabel).values[row.series_name] = Number(row.series_value);
    });

    return Array.from(grouped.values())
        .sort((a, b) => {
            if (a.x_date && b.x_date) return String(a.x_date).localeCompare(String(b.x_date));
            if (a.row_index !== b.row_index) return a.row_index - b.row_index;
            return a.x_label.localeCompare(b.x_label);
        })
        .map((item) => [item.x_label, ...seriesOrder.map((name) => item.values[name] ?? null)]);
}

function drawCanadaComboChart(spec, rows) {
    const container = document.getElementById(spec.containerId);
    if (!container) return;

    if (!Array.isArray(rows) || rows.length === 0) {
        container.innerHTML = '<div class="ggx-empty">No chart data.</div>';
        return;
    }

    const table = new window.google.visualization.DataTable();
    table.addColumn('string', 'Date');
    spec.seriesOrder.forEach((seriesName) => table.addColumn('number', seriesName));
    table.addRows(toCanadaChartMatrix(rows, spec.seriesOrder));

    const formatter = new window.google.visualization.NumberFormat({ prefix: '$' });
    for (let index = 1; index <= spec.seriesOrder.length; index += 1) {
        formatter.format(table, index);
    }

    const seriesConfig = {};
    spec.lineIndexes.forEach((index) => {
        seriesConfig[index] = {
            type: 'line',
            lineWidth: 2.3,
            pointSize: 4.2,
            pointShape: 'circle',
            visibleInLegend: true,
        };
    });

    const containerWidth = container.clientWidth || container.offsetWidth || 0;
    const isWide = containerWidth >= 1280;
    const isMedium = containerWidth >= 820;
    const chartAreaLeft = isWide ? 56 : isMedium ? 58 : 62;
    const chartAreaWidth = isWide ? '90%' : isMedium ? '88%' : '80%';
    const chartAreaHeight = isMedium ? '70%' : '66%';

    const options = {
        width: '100%',
        height: 420,
        backgroundColor: 'transparent',
        chartArea: {
            width: chartAreaWidth,
            height: chartAreaHeight,
            left: chartAreaLeft,
            top: 62,
            backgroundColor: { fill: 'rgba(255,255,255,0.02)', stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 },
        },
        legend: {
            position: 'top',
            alignment: 'start',
            maxLines: 2,
            textStyle: { color: '#d8dee9', fontSize: 11, bold: true },
        },
        bar: { groupWidth: '66%' },
        focusTarget: 'category',
        tooltip: {
            textStyle: { color: '#0e141c', fontSize: 11 },
            showColorCode: true,
        },
        crosshair: { trigger: 'focus', orientation: 'vertical', color: '#5dd62c' },
        vAxis: {
            title: 'CDN$ / GJ',
            titleTextStyle: { color: '#e6edf5', bold: true, fontSize: 12 },
            textStyle: { color: '#a8b3c2', fontSize: 11 },
            gridlines: { color: 'rgba(255,255,255,0.14)' },
            minorGridlines: { color: 'rgba(255,255,255,0.06)' },
            format: 'currency',
        },
        hAxis: {
            slantedText: true,
            slantedTextAngle: 65,
            textStyle: { color: '#a8b3c2', fontSize: 10 },
            baselineColor: 'rgba(255,255,255,0.14)',
        },
        colors: spec.colors,
        seriesType: 'bars',
        series: seriesConfig,
        animation: { startup: true, duration: 480, easing: 'out' },
    };

    const chart = new window.google.visualization.ComboChart(container);
    chart.draw(table, options);
}

function drawCanadaCharts() {
    Object.entries(CANADA_CHART_SPECS).forEach(([chartId, spec]) => {
        const rows = state.canadaPointRows.filter((row) => row.chart_id === chartId);
        drawCanadaComboChart(spec, rows);
    });
}

function parseMaybeArray(value) {
    if (Array.isArray(value)) return value;
    if (typeof value !== 'string') return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function getCanadaTableCellValue(row, header, index) {
    if (row && typeof row === 'object' && !Array.isArray(row)) return row[header] ?? '';
    if (Array.isArray(row)) return row[index] ?? '';
    return '';
}

function renderCanadaStaticTables() {
    const wrap = document.getElementById('ggx-canada-static-tables');
    if (!wrap) return;

    if (!state.canadaTableRows.length) {
        wrap.innerHTML = '<div class="ggx-empty">No parsed Canada static tables in this run.</div>';
        return;
    }

    const preferredOrder = ['intra_alberta_cost_image', 'current_utility_delivery_costs_image'];
    const sorted = [...state.canadaTableRows].sort((a, b) => {
        const ai = preferredOrder.indexOf(a.chart_id);
        const bi = preferredOrder.indexOf(b.chart_id);
        if (ai === -1 && bi === -1) return String(a.chart_title || '').localeCompare(String(b.chart_title || ''));
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
    });

    wrap.innerHTML = sorted.map((item) => {
        const headers = parseMaybeArray(item.headers);
        const rows = parseMaybeArray(item.table_rows);

        if (!headers.length) {
            return `<article class="ggx-channel-card p-4"><h3 class="ggx-event-title">${escapeHtml(item.chart_title || item.chart_id || 'Untitled')}</h3><div class="ggx-empty mt-3">No parsed table headers in this record.</div></article>`;
        }

        const headerHtml = headers.map((header) => `<th class="ggx-canada-head-cell">${escapeHtml(header)}</th>`).join('');
        const bodyHtml = rows.map((row, rowIndex) => {
            const isSection = row && typeof row === 'object' && !Array.isArray(row) && row._row_type === 'section';
            const cellHtml = headers.map((header, index) => {
                const raw = getCanadaTableCellValue(row, header, index);
                const value = isSection && header !== 'Component' ? '' : raw;
                const cellClass = isSection && header === 'Component' ? 'ggx-canada-cell ggx-canada-cell-section' : 'ggx-canada-cell';
                return `<td class="${cellClass}">${escapeHtml(value)}</td>`;
            }).join('');
            const rowClass = isSection ? 'ggx-canada-row is-section' : `ggx-canada-row ${rowIndex % 2 === 0 ? 'is-even' : 'is-odd'}`;
            return `<tr class="${rowClass}">${cellHtml}</tr>`;
        }).join('');

        return `
            <article class="ggx-channel-card p-4">
                <h3 class="ggx-event-title">${escapeHtml(item.chart_title || item.chart_id || 'Untitled')}</h3>
                <div class="ggx-table-wrap mt-3">
                    <table class="ggx-data-table ggx-canada-data-table">
                        <thead><tr>${headerHtml}</tr></thead>
                        <tbody>${bodyHtml}</tbody>
                    </table>
                </div>
                <p class="ggx-mini-caption mt-3">Parsed rows: ${escapeHtml(String(item.row_count || 0))}</p>
            </article>
        `;
    }).join('');
}

async function renderCanadaDashboard() {
    renderRunSummary();
    setCanadaStatus(state.canadaStatus.type, state.canadaStatus.message);
    renderCanadaStaticTables();

    if (!state.canadaPointRows.length) return;

    await ensureGoogleChartsLoaded();
    drawCanadaCharts();

    if (!state.chartsResizeBound) {
        state.chartsResizeBound = true;
        let resizeTimer = null;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => drawCanadaCharts(), 180);
        });
    }
}

function bindBackToTop() {
    const button = document.getElementById('ggx-to-top');
    if (!button) return;
    button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    const sync = () => button.classList.toggle('visible', window.scrollY > 280);
    window.addEventListener('scroll', sync, { passive: true });
    sync();
}

document.addEventListener('DOMContentLoaded', async () => {
    mountIcons();
    bindBackToTop();
    await loadCanadaDashboardData();
    await renderCanadaDashboard();
});
