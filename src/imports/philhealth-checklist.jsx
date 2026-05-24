import { useState, useMemo, useEffect } from "react";

/* ─────────────────────────────────────────────
   DATA  (sourced exactly from the Excel sheets)
───────────────────────────────────────────── */

// ICD 10 sheet col-0: full form names + ICD codes
// ICD 10 sheet col-2: characteristics list
// ICD 10 sheet col-3: forms list
// Sheet1 col-0: case rate names | col-3: reports

const ALL_FORMS = ["CSF", "CF2", "SOA", "CF4", "CF5", "SURGICAL MEMO"];

const ALL_CHARACTERISTICS = [
  "AGE",
  "PNEUMONIA MODERATE",
  "PNEUMONIA HIGH RISK",
  "DENGUE SEVERE",
  "URINARY TRACT INFECTION",
  "SEPSIS IN ADULT",
  "DEBRIDEMENT",
  "DIALYSIS",
];

const ALL_REPORTS = ["RTH MONITORING", "AGEING"];

// Mapping case rate → ICD-10 (from ICD 10 sheet col 0+1)
const ICD_MAP = {
  "ACUTE GASTROENTERITIS": "A09.6",
  "PNEUMONIA MODERATE RISK": "J18.92",
  "PNEUMONIA HIGH RISK": "J18.93",
};

// Full name overrides (ICD 10 sheet col-0)
const FULL_NAME_MAP = {
  "ACUTE GASTROENTERITIS": "ACUTE GASTROENTERITIS WITH MODERATE DEHYDRATION",
  "PNEUMONIA MODERATE RISK": "PNEUMONIA MODERATE",
  "PNEUMONIA HIGH RISK": "PNEUMONIA SEVERE",
  "DENGUE": "DENGUE / DENGUE SEVERE",
};

// Required forms per case rate (from ICD 10 sheet — rows match forms col-0 to col-3)
const FORMS_MAP = {
  "ACUTE GASTROENTERITIS": ["CSF"],
  "PNEUMONIA MODERATE RISK": ["CF2"],
  "PNEUMONIA HIGH RISK": ["SOA"],
  "DENGUE": ["CF4"],
  "DENGUE SEVERE": ["CF4"],
  "URINARY TRACT INFECTION": ["CF5"],
  "SEPSIS IN ADULT": ["CF5"],
  "DEBRIDEMENT": ["SURGICAL MEMO"],
  "DIALYSIS": [],
  "OUT PATIENT BENEFIT PACKAGE": [],
  "STROKE HAEMORRHAGIC": [],
};

// Characteristics per case rate
const CHARS_MAP = {
  "ACUTE GASTROENTERITIS": ["AGE"],
  "PNEUMONIA MODERATE RISK": ["PNEUMONIA MODERATE"],
  "PNEUMONIA HIGH RISK": ["PNEUMONIA HIGH RISK"],
  "DENGUE": ["DENGUE SEVERE"],
  "URINARY TRACT INFECTION": ["URINARY TRACT INFECTION"],
  "SEPSIS IN ADULT": ["SEPSIS IN ADULT"],
  "DEBRIDEMENT": ["DEBRIDEMENT"],
  "DIALYSIS": ["DIALYSIS"],
  "OUT PATIENT BENEFIT PACKAGE": [],
  "STROKE HAEMORRHAGIC": [],
};

// Reports per case rate (Sheet1 col-3)
const REPORTS_MAP = {
  "ACUTE GASTROENTERITIS": ["RTH MONITORING"],
  "DEBRIDEMENT": ["AGEING"],
};

const CASE_RATE_NAMES = [
  "ACUTE GASTROENTERITIS",
  "DEBRIDEMENT",
  "DENGUE",
  "DIALYSIS",
  "OUT PATIENT BENEFIT PACKAGE",
  "PNEUMONIA HIGH RISK",
  "PNEUMONIA MODERATE RISK",
  "SEPSIS IN ADULT",
  "STROKE HAEMORRHAGIC",
  "URINARY TRACT INFECTION",
];

const CASE_RATES = CASE_RATE_NAMES.map((name, i) => ({
  id: i + 1,
  name,
  fullName: FULL_NAME_MAP[name] || name,
  icd10: ICD_MAP[name] || null,
  forms: FORMS_MAP[name] || [],
  characteristics: CHARS_MAP[name] || [],
  reports: REPORTS_MAP[name] || [],
}));

/* ─────────────────────────────────────────────
   COLORS
───────────────────────────────────────────── */

const FORM_COLORS = {
  CSF:            { light: { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd" }, dark: { bg: "#1e3a5f", text: "#93c5fd", border: "#2563eb" } },
  CF2:            { light: { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" }, dark: { bg: "#064e3b", text: "#6ee7b7", border: "#059669" } },
  SOA:            { light: { bg: "#ede9fe", text: "#4c1d95", border: "#c4b5fd" }, dark: { bg: "#2e1065", text: "#c4b5fd", border: "#7c3aed" } },
  CF4:            { light: { bg: "#fef3c7", text: "#78350f", border: "#fcd34d" }, dark: { bg: "#451a03", text: "#fcd34d", border: "#d97706" } },
  CF5:            { light: { bg: "#fee2e2", text: "#7f1d1d", border: "#fca5a5" }, dark: { bg: "#450a0a", text: "#fca5a5", border: "#dc2626" } },
  "SURGICAL MEMO":{ light: { bg: "#fce7f3", text: "#831843", border: "#f9a8d4" }, dark: { bg: "#500724", text: "#f9a8d4", border: "#db2777" } },
};

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */

const makeStyles = (dark) => `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }

  :root {
    --bg:        ${dark ? "#0f172a" : "#f8fafc"};
    --surface:   ${dark ? "#1e293b" : "#ffffff"};
    --surface2:  ${dark ? "#273549" : "#f1f5f9"};
    --border:    ${dark ? "#334155" : "#e2e8f0"};
    --border2:   ${dark ? "#475569" : "#cbd5e1"};
    --text:      ${dark ? "#f1f5f9" : "#0f172a"};
    --text2:     ${dark ? "#94a3b8" : "#64748b"};
    --text3:     ${dark ? "#64748b" : "#94a3b8"};
    --accent:    #2563eb;
    --accent-bg: ${dark ? "#1e3a5f" : "#eff6ff"};
    --accent-text:${dark ? "#93c5fd" : "#1d4ed8"};

    --col1-head: ${dark ? "#162032" : "#f0f9ff"};
    --col1-div:  ${dark ? "#1e3a5f" : "#bae6fd"};
    --col2-head: ${dark ? "#0d2318" : "#f0fdf4"};
    --col2-div:  ${dark ? "#064e3b" : "#bbf7d0"};
    --col3-head: ${dark ? "#1a1030" : "#faf5ff"};
    --col3-div:  ${dark ? "#2e1065" : "#e9d5ff"};
    --col4-head: ${dark ? "#1c1400" : "#fffbeb"};
    --col4-div:  ${dark ? "#451a03" : "#fde68a"};
    --col5-head: ${dark ? "#1c0808" : "#fff1f2"};
    --col5-div:  ${dark ? "#450a0a" : "#fecdd3"};

    --row-odd:   ${dark ? "#1e293b" : "#ffffff"};
    --row-even:  ${dark ? "#172032" : "#f8fafc"};
    --row-hover: ${dark ? "#1e3a5f" : "#eff6ff"};

    --report-bg:   ${dark ? "#052e16" : "#ecfdf5"};
    --report-text: ${dark ? "#4ade80" : "#064e3b"};
    --report-bdr:  ${dark ? "#166534" : "#6ee7b7"};

    --mono-bg:   ${dark ? "#0f172a" : "#f1f5f9"};
    --mono-text: ${dark ? "#94a3b8" : "#334155"};
    --mono-bdr:  ${dark ? "#334155" : "#e2e8f0"};

    --tag-bg:    ${dark ? "#1e293b" : "#f1f5f9"};
    --tag-text:  ${dark ? "#94a3b8" : "#475569"};
    --tag-bdr:   ${dark ? "#334155" : "#e2e8f0"};

    --overlay:   ${dark ? "rgba(0,0,0,0.65)" : "rgba(15,23,42,0.45)"};
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--bg);
    color: var(--text);
    transition: background 0.2s, color 0.2s;
  }

  .app { min-height: 100vh; display: flex; flex-direction: column; }

  /* NAV */
  .nav {
    height: 52px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    padding: 0 20px;
    gap: 10px;
    position: sticky;
    top: 0;
    z-index: 200;
    flex-shrink: 0;
  }
  .nav-icon {
    width: 30px; height: 30px;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .nav-icon svg { width: 15px; height: 15px; fill: none; stroke: #fff; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .nav-title { font-size: 14px; font-weight: 700; color: var(--text); letter-spacing: -0.01em; white-space: nowrap; }
  .nav-sep { width: 1px; height: 16px; background: var(--border); flex-shrink: 0; }
  .nav-sub { font-size: 11.5px; color: var(--text3); white-space: nowrap; }
  .nav-spacer { flex: 1; }
  .dark-btn {
    width: 34px; height: 34px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--surface2);
    cursor: pointer;
    color: var(--text2);
    font-size: 15px;
    flex-shrink: 0;
    transition: background 0.15s;
  }
  .dark-btn:hover { background: var(--border); }

  /* TOOLBAR */
  .toolbar {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 10px 20px;
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
    flex-shrink: 0;
  }
  .search-wrap { position: relative; flex: 1; min-width: 160px; max-width: 280px; }
  .search-icon {
    position: absolute; left: 9px; top: 50%; transform: translateY(-50%);
    color: var(--text3); pointer-events: none; display: flex; align-items: center;
  }
  .search-icon svg { width: 13px; height: 13px; stroke: currentColor; stroke-width: 2; fill: none; stroke-linecap: round; stroke-linejoin: round; }
  .search-input {
    width: 100%;
    padding: 7px 9px 7px 30px;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 13px;
    color: var(--text);
    background: var(--surface2);
    outline: none;
    transition: border-color 0.15s, background 0.15s;
  }
  .search-input:focus { border-color: var(--accent); background: var(--surface); }
  .search-input::placeholder { color: var(--text3); }

  select.fs {
    padding: 7px 26px 7px 9px;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 12px;
    color: var(--text);
    background: var(--surface2);
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2394a3b8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    cursor: pointer;
    outline: none;
    min-width: 0;
    flex: 1;
    transition: border-color 0.15s;
  }
  select.fs:focus { border-color: var(--accent); background-color: var(--surface); }

  .view-toggle {
    display: flex;
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
  }
  .vbtn {
    padding: 6px 9px;
    border: none;
    background: var(--surface2);
    color: var(--text3);
    cursor: pointer;
    display: flex; align-items: center;
    transition: background 0.12s, color 0.12s;
  }
  .vbtn svg { width: 14px; height: 14px; stroke: currentColor; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  .vbtn.active { background: var(--accent); color: #fff; }

  /* PILLS ROW */
  .pills-row {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 6px 20px;
    display: flex;
    gap: 5px;
    align-items: center;
    flex-wrap: wrap;
    min-height: 36px;
    flex-shrink: 0;
  }
  .pill {
    display: inline-flex; align-items: center; gap: 3px;
    padding: 2px 7px 2px 9px;
    border-radius: 20px;
    font-size: 11px; font-weight: 500;
    background: var(--accent-bg);
    color: var(--accent-text);
    border: 1px solid;
    border-color: ${dark ? "#2563eb" : "#bfdbfe"};
    white-space: nowrap;
  }
  .pill-x { background: none; border: none; cursor: pointer; color: var(--accent-text); font-size: 11px; line-height: 1; padding: 0; opacity: 0.7; }
  .pill-x:hover { opacity: 1; }
  .clear-all { font-size: 11px; color: #ef4444; background: none; border: none; cursor: pointer; padding: 2px 4px; flex-shrink: 0; }
  .rc { font-size: 11px; color: var(--text3); margin-left: auto; white-space: nowrap; flex-shrink: 0; }

  /* MAIN */
  .main { flex: 1; padding: 16px 20px; overflow-x: auto; }

  /* TABLE */
  .tw {
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--border);
    background: var(--surface);
    min-width: 560px;
  }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  colgroup col:nth-child(1) { width: 24%; }
  colgroup col:nth-child(2) { width: 10%; }
  colgroup col:nth-child(3) { width: 25%; }
  colgroup col:nth-child(4) { width: 25%; }
  colgroup col:nth-child(5) { width: 16%; }

  thead tr th {
    padding: 10px 14px;
    text-align: left;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--text2);
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
  }
  thead tr th:nth-child(1) { background: var(--col1-head); border-right: 1px solid var(--col1-div); }
  thead tr th:nth-child(2) { background: var(--col2-head); border-right: 1px solid var(--col2-div); }
  thead tr th:nth-child(3) { background: var(--col3-head); border-right: 1px solid var(--col3-div); }
  thead tr th:nth-child(4) { background: var(--col4-head); border-right: 1px solid var(--col4-div); }
  thead tr th:nth-child(5) { background: var(--col5-head); }

  tbody tr { cursor: pointer; }
  tbody tr:nth-child(odd)  td { background: var(--row-odd); }
  tbody tr:nth-child(even) td { background: var(--row-even); }
  tbody tr:hover td { background: var(--row-hover) !important; }

  tbody tr td {
    padding: 10px 14px;
    font-size: 12.5px;
    color: var(--text);
    vertical-align: middle;
    border-bottom: 1px solid var(--border);
  }
  tbody tr:last-child td { border-bottom: none; }

  tbody tr td:nth-child(1) { border-right: 1px solid var(--col1-div); font-weight: 500; font-size: 13px; }
  tbody tr td:nth-child(2) { border-right: 1px solid var(--col2-div); }
  tbody tr td:nth-child(3) { border-right: 1px solid var(--col3-div); }
  tbody tr td:nth-child(4) { border-right: 1px solid var(--col4-div); color: var(--text2); font-size: 12px; }

  /* CARDS */
  .cg { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 14px 16px;
    cursor: pointer;
    transition: border-color 0.15s, transform 0.1s;
  }
  .card:hover { border-color: var(--accent); transform: translateY(-1px); }
  .card-name { font-size: 13px; font-weight: 600; color: var(--text); line-height: 1.4; margin-bottom: 10px; }
  .card-sl { font-size: 10px; text-transform: uppercase; letter-spacing: 0.07em; color: var(--text3); margin-bottom: 4px; margin-top: 8px; }
  .card-foot { margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
  .card-cta { font-size: 11px; color: var(--accent); font-weight: 600; }

  /* BADGES */
  .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; margin-right: 3px; margin-bottom: 3px; white-space: nowrap; border: 1px solid; }
  .br { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; background: var(--report-bg); color: var(--report-text); border: 1px solid var(--report-bdr); margin-right: 3px; margin-bottom: 3px; }
  .icd { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 11.5px; background: var(--mono-bg); color: var(--mono-text); padding: 2px 7px; border-radius: 5px; border: 1px solid var(--mono-bdr); white-space: nowrap; }
  .dash { color: var(--text3); font-size: 13px; }
  .tn { display: inline-block; padding: 3px 9px; border-radius: 20px; font-size: 11px; background: var(--tag-bg); color: var(--tag-text); border: 1px solid var(--tag-bdr); margin-right: 4px; margin-bottom: 4px; }

  /* EMPTY */
  .empty { text-align: center; padding: 60px 0; color: var(--text3); }
  .empty-icon { font-size: 34px; margin-bottom: 12px; }
  .empty p { font-size: 14px; }
  .empty button { margin-top: 10px; font-size: 13px; color: var(--accent); background: none; border: none; cursor: pointer; text-decoration: underline; }

  /* MODAL */
  .mo { position: fixed; inset: 0; z-index: 999; background: var(--overlay); display: flex; align-items: center; justify-content: center; padding: 20px; }
  .md {
    background: var(--surface);
    border-radius: 16px;
    width: 100%; max-width: 500px;
    padding: 24px;
    position: relative;
    border: 1px solid var(--border);
    max-height: 90vh;
    overflow-y: auto;
  }
  .mc { position: absolute; top: 12px; right: 12px; background: var(--surface2); border: 1px solid var(--border); border-radius: 6px; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text2); font-size: 13px; }
  .mc:hover { background: var(--border); }
  .mey { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.09em; color: var(--text3); margin-bottom: 5px; }
  .mtt { font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 2px; }
  .msub { font-size: 12.5px; color: var(--text2); margin-bottom: 16px; }
  .mdiv { height: 1px; background: var(--border); margin: 14px 0; }
  .msl { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--text3); margin-bottom: 7px; }
  .ms { margin-bottom: 14px; }
  .im { font-size: 12.5px; color: var(--text3); font-style: italic; }

  /* FOOTER */
  .footer { text-align: center; padding: 14px; font-size: 11px; color: var(--text3); flex-shrink: 0; }

  /* RESPONSIVE */
  @media (max-width: 640px) {
    .nav-sub { display: none; }
    .nav-sep { display: none; }
    .toolbar { gap: 6px; }
    select.fs { min-width: 0; font-size: 11px; }
    .search-wrap { max-width: 100%; }
    .main { padding: 12px; }
    .cg { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 400px) {
    .cg { grid-template-columns: 1fr; }
    .nav-title { font-size: 13px; }
    .toolbar { padding: 8px 12px; }
    .pills-row { padding: 5px 12px; }
    .main { padding: 10px; }
  }
`;

/* ─────────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────────── */

function Badge({ label, dark }) {
  const c = FORM_COLORS[label];
  if (!c) return <span className="badge" style={{ background: "var(--tag-bg)", color: "var(--tag-text)", borderColor: "var(--tag-bdr)" }}>{label}</span>;
  const t = dark ? c.dark : c.light;
  return <span className="badge" style={{ background: t.bg, color: t.text, borderColor: t.border }}>{label}</span>;
}

function DetailModal({ item, onClose, dark }) {
  if (!item) return null;
  return (
    <div className="mo" onClick={onClose}>
      <div className="md" onClick={e => e.stopPropagation()}>
        <button className="mc" onClick={onClose} aria-label="Close">✕</button>
        <div className="mey">Case Rate</div>
        <div className="mtt">{item.name}</div>
        {item.fullName !== item.name && <div className="msub">{item.fullName}</div>}
        <div className="mdiv" />

        <div className="ms">
          <div className="msl">ICD-10 Code</div>
          {item.icd10 ? <span className="icd">{item.icd10}</span> : <span className="im">Not specified</span>}
        </div>

        <div className="ms">
          <div className="msl">Required PhilHealth Forms</div>
          {item.forms.length > 0
            ? item.forms.map(f => <Badge key={f} label={f} dark={dark} />)
            : <span className="im">None listed</span>}
        </div>

        <div className="ms">
          <div className="msl">Characteristics</div>
          {item.characteristics.length > 0
            ? item.characteristics.map(c => <span key={c} className="tn">{c}</span>)
            : <span className="im">None listed</span>}
        </div>

        <div className="ms">
          <div className="msl">Reports Required</div>
          {item.reports.length > 0
            ? item.reports.map(r => <span key={r} className="br">{r}</span>)
            : <span className="im">None</span>}
        </div>
      </div>
    </div>
  );
}

function Pill({ label, onRemove }) {
  return (
    <span className="pill">
      {label}
      <button className="pill-x" onClick={onRemove}>✕</button>
    </span>
  );
}

function TableView({ data, onSelect, dark }) {
  return (
    <div className="tw">
      <table>
        <colgroup><col /><col /><col /><col /><col /></colgroup>
        <thead>
          <tr>
            {["Case Rate", "ICD-10", "Required Forms", "Characteristics", "Reports"].map(h => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.id} onClick={() => onSelect(row)}>
              <td>{row.name}</td>
              <td>
                {row.icd10 ? <span className="icd">{row.icd10}</span> : <span className="dash">—</span>}
              </td>
              <td>
                {row.forms.length > 0
                  ? row.forms.map(f => <Badge key={f} label={f} dark={dark} />)
                  : <span className="dash">—</span>}
              </td>
              <td>
                {row.characteristics.length > 0
                  ? row.characteristics.join(", ")
                  : <span className="dash">—</span>}
              </td>
              <td>
                {row.reports.length > 0
                  ? row.reports.map(r => <span key={r} className="br">{r}</span>)
                  : <span className="dash">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CardsView({ data, onSelect, dark }) {
  return (
    <div className="cg">
      {data.map(item => (
        <div key={item.id} className="card" onClick={() => onSelect(item)}>
          <div className="card-name">{item.name}</div>
          {item.icd10 && <span className="icd">{item.icd10}</span>}
          {item.forms.length > 0 && (
            <>
              <div className="card-sl">Forms</div>
              <div>{item.forms.map(f => <Badge key={f} label={f} dark={dark} />)}</div>
            </>
          )}
          {item.characteristics.length > 0 && (
            <>
              <div className="card-sl">Characteristics</div>
              <div style={{ fontSize: 11.5, color: "var(--text2)" }}>{item.characteristics.join(", ")}</div>
            </>
          )}
          {item.reports.length > 0 && (
            <>
              <div className="card-sl">Reports</div>
              <div>{item.reports.map(r => <span key={r} className="br">{r}</span>)}</div>
            </>
          )}
          <div className="card-foot">
            <span style={{ fontSize: 10, color: "var(--text3)" }}>{item.forms.length} form{item.forms.length !== 1 ? "s" : ""} required</span>
            <span className="card-cta">Details →</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   APP
───────────────────────────────────────────── */

export default function App() {
  const prefersDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [dark, setDark] = useState(prefersDark);
  const [search, setSearch] = useState("");
  const [filterForm, setFilterForm] = useState("All");
  const [filterReport, setFilterReport] = useState("All");
  const [filterChar, setFilterChar] = useState("All");
  const [selected, setSelected] = useState(null);
  const [viewMode, setViewMode] = useState("table");

  // Inject/update styles
  useEffect(() => {
    let el = document.getElementById("__app-styles");
    if (!el) { el = document.createElement("style"); el.id = "__app-styles"; document.head.appendChild(el); }
    el.textContent = makeStyles(dark);
  }, [dark]);

  const filtered = useMemo(() => {
    let list = [...CASE_RATES];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.fullName.toLowerCase().includes(q) ||
        (r.icd10 && r.icd10.toLowerCase().includes(q))
      );
    }
    if (filterForm !== "All") list = list.filter(r => r.forms.includes(filterForm));
    if (filterReport !== "All") list = list.filter(r => r.reports.includes(filterReport));
    if (filterChar !== "All") list = list.filter(r => r.characteristics.includes(filterChar));
    return list;
  }, [search, filterForm, filterReport, filterChar]);

  const activeFilters = [filterForm, filterReport, filterChar].filter(f => f !== "All").length;
  const clearAll = () => { setSearch(""); setFilterForm("All"); setFilterChar("All"); setFilterReport("All"); };

  return (
    <div className="app">
      <h2 className="sr-only">NGH PhilHealth Case Rate Checklist</h2>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-icon">
          <svg viewBox="0 0 24 24">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
            <path d="M9 12h6M9 16h4"/>
          </svg>
        </div>
        <span className="nav-title">CaseRate Checklist</span>
        <span className="nav-sep" />
        <span className="nav-sub">Version 1.0</span>
        <span className="nav-spacer" />
        <button className="dark-btn" onClick={() => setDark(d => !d)} aria-label="Toggle dark mode">
          {dark ? "☀" : "☾"}
        </button>
      </nav>

      {/* TOOLBAR */}
      <div className="toolbar">
        <div className="search-wrap">
          <span className="search-icon">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </span>
          <input
            className="search-input"
            type="text"
            placeholder="Search case rate or ICD-10…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select className="fs" value={filterForm} onChange={e => setFilterForm(e.target.value)}>
          <option value="All">All forms</option>
          {ALL_FORMS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>

        <select className="fs" value={filterChar} onChange={e => setFilterChar(e.target.value)}>
          <option value="All">All characteristics</option>
          {ALL_CHARACTERISTICS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select className="fs" value={filterReport} onChange={e => setFilterReport(e.target.value)}>
          <option value="All">All reports</option>
          {ALL_REPORTS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <div className="view-toggle">
          <button className={`vbtn${viewMode === "table" ? " active" : ""}`} onClick={() => setViewMode("table")} aria-label="Table view">
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>
          </button>
          <button className={`vbtn${viewMode === "cards" ? " active" : ""}`} onClick={() => setViewMode("cards")} aria-label="Card view">
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          </button>
        </div>
      </div>

      {/* PILLS */}
      <div className="pills-row">
        {activeFilters > 0 ? (
          <>
            <span style={{ fontSize: 11, color: "var(--text3)", flexShrink: 0 }}>Filters:</span>
            {filterForm !== "All" && <Pill label={`Form: ${filterForm}`} onRemove={() => setFilterForm("All")} />}
            {filterChar !== "All" && <Pill label={`Char: ${filterChar}`} onRemove={() => setFilterChar("All")} />}
            {filterReport !== "All" && <Pill label={`Report: ${filterReport}`} onRemove={() => setFilterReport("All")} />}
            <button className="clear-all" onClick={clearAll}>Clear all</button>
          </>
        ) : (
          <span style={{ fontSize: 11, color: "var(--text3)" }}>No filters applied</span>
        )}
        <span className="rc">{filtered.length} / {CASE_RATES.length} case rates</span>
      </div>

      {/* CONTENT */}
      <main className="main">
        {filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🔍</div>
            <p>No case rates match your filters.</p>
            <button onClick={clearAll}>Clear all filters</button>
          </div>
        ) : viewMode === "table" ? (
          <TableView data={filtered} onSelect={setSelected} dark={dark} />
        ) : (
          <CardsView data={filtered} onSelect={setSelected} dark={dark} />
        )}
      </main>

      <div className="footer">Click any row for full details · NGH PhilHealth · May 2026</div>

      <DetailModal item={selected} onClose={() => setSelected(null)} dark={dark} />
    </div>
  );
}
