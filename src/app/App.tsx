import { useState, useMemo } from "react";
import { Search, ClipboardList, Grid3x3, Table2, Sun, Moon, X } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   DATA CONFIGURATION
   ═══════════════════════════════════════════════════════════════════ */

// All available form types
const ALL_FORMS = ["CSF", "CF2", "SOA", "CF4", "CF5", "SURGICAL MEMO"];

// All available characteristics
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

// All available report types
const ALL_REPORTS = ["RTH MONITORING", "AGEING"];

// ICD-10 code mapping
const ICD_MAP: Record<string, string> = {
  "ACUTE GASTROENTERITIS": "A09.6",
  "PNEUMONIA MODERATE RISK": "J18.92",
  "PNEUMONIA HIGH RISK": "J18.93",
};

// Full name overrides for display
const FULL_NAME_MAP: Record<string, string> = {
  "ACUTE GASTROENTERITIS": "ACUTE GASTROENTERITIS WITH MODERATE DEHYDRATION",
  "PNEUMONIA MODERATE RISK": "PNEUMONIA MODERATE",
  "PNEUMONIA HIGH RISK": "PNEUMONIA SEVERE",
  "DENGUE": "DENGUE / DENGUE SEVERE",
};

// Required forms per case rate
const FORMS_MAP: Record<string, string[]> = {
  "ACUTE GASTROENTERITIS": ["CSF", "SOA", "CF4","CF5", "CF2", "FECALSIS RESULT" ],
  "PNEUMONIA MODERATE RISK": ["CSF", "SOA", "CF4","CF5", "CF2", "CXR RESULT"],
  "PNEUMONIA HIGH RISK": ["CSF", "SOA", "CF4","CF5", "CF2", "CXR RESULT"],
  "DENGUE": ["CSF", "SOA", "CF4","CF5", "CF2", "DENGUE TEST RESULT"],
  "DENGUE SEVERE": ["CSF", "SOA", "CF4","CF5", "CF2", "DENGUE TEST RESULT"],
  "URINARY TRACT INFECTION": ["CSF", "SOA", "CF4","CF5", "CF2", "URINALYSIS RESULT"],
  "SEPSIS IN ADULT": ["CSF", "SOA", "CF4","CF5", "CF2", "BLOOD CS RESULT"],
  "DEBRIDEMENT": ["CSF", "SOA", "CF4","CF5", "CF2", "LABORATORY TEST", "SURGICAL MEMO"],
  "DIALYSIS": ["CSF", "SOA", "CF4"],
  "OUT PATIENT BENEFIT PACKAGE": ["CSF", "SOA", "CF4"],
  "STROKE HAEMORRHAGIC": ["CSF", "SOA", "CF4","CF5", "CF2", "CT SCAN RESULT"],
};

// Characteristics per case rate
const CHARS_MAP: Record<string, string[]> = {
  "ACUTE GASTROENTERITIS": [
    "3X LBM", 
    "3X VOMITING", 
    "FEVER", 
    "LOOSE/LIQUID STOOL", 
    "POOR SKIN TURGOR", 
    "SUNKEN EYES", 
    "DRY MUCOUS MEMBRANES", 
    "LETHARGIC/IRRITABLE"
  ],
  "PNEUMONIA MODERATE RISK": [
    "COUGH", 
    "FEVER", 
    "TACHYPNEA", 
    "CHEST RETRACTIONS", 
    "RUGGED BREATH SOUNDS/RALES", 
    "CRACKLES", 
    "ABNORMAL CHEST X-RAY/INFILTRATES"
  ],
  "PNEUMONIA HIGH RISK": [
    "SEVERE RESPIRATORY DISTRESS", 
    "CYANOSIS", 
    "GRUNTING", 
    "SPO2 LESS THAN 90", 
    "ALTERED MENTAL STATUS", 
    "SHOCK", 
    "MECHANICAL VENTILATION REQUIREMENT"
  ],
  "DENGUE": [
    "HIGH FEVER", 
    "RETRO-ORBITAL PAIN", 
    "MYALGIA/ARTHRALGIA", 
    "THROMBOCYTOPENIA", 
    "PETECHIAE/BLEEDING MANIFESTATIONS", 
    "POSITIVE TOURNIQUET TEST", 
    "PLASMA LEAKAGE", 
    "SEVERE DENGUE"
  ],
  "URINARY TRACT INFECTION": [
    "DYSURIA", 
    "FREQUENCY", 
    "URGENCY", 
    "FLANK PAIN/CVA TENDERNESS", 
    "FEVER", 
    "PYURIA/PUS CELLS IN URINALYSIS", 
    "POSITIVE URINE CULTURE"
  ],
  "SEPSIS IN ADULT": [
    "SIRS CRITERIA", 
    "ALTERED MENTAL STATUS", 
    "TACHYCARDIA", 
    "HYPOTENSION/SHOCK", 
    "MAP LESS THAN 65", 
    "ELEVATED LACTATE", 
    "DOCUMENTED OR SUSPECTED INFECTION"
  ],
  "DEBRIDEMENT": [
    "NECROTIC TISSUE", 
    "ESCHAR", 
    "SLOUGH", 
    "CHRONIC NON-HEALING WOUND", 
    "GANGRENE", 
    "SURGICAL WOUND CLEANSED", 
    "EXCISION OF TISSUE"
  ],
  "DIALYSIS": [
    "END STAGE RENAL DISEASE", 
    "UREMIA", 
    "FLUID OVERLOAD", 
    "REFRACTORY HYPERKALEMIA", 
    "HEMODIALYSIS RUN", 
    "PERITONEAL DIALYSIS", 
    "CREATININE CLEARANCE LESS THAN 15"
  ],
  "OUT PATIENT BENEFIT PACKAGE": [
    "PRIMARY CARE CONSULTATION", 
    "PREVENTIVE HEALTH SERVICES", 
    "DIAGNOSTIC WORKUP", 
    "REGULAR MAINTENANCE MEDICATIONS", 
    "NON-EMERGENCY CARE"
  ],
  "STROKE HAEMORRHAGIC": [
    "SUDDEN SEVERE HEADACHE", 
    "HEMIPARESIS/FOCAL DEFICIT", 
    "FACIAL DROOP", 
    "SLURRED SPEECH/APHASIA", 
    "ALTERED LOC", 
    "HYPERTENSIVE CRISIS", 
    "BRAIN CT SCAN CONFIRMED BLEED"
  ]
};

// Reports per case rate
const REPORTS_MAP: Record<string, string[]> = {
  "ACUTE GASTROENTERITIS": ["RTH MONITORING"],
  "DEBRIDEMENT": ["AGEING"],
};

// Main case rates list
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

// Build complete case rate objects
const CASE_RATES = CASE_RATE_NAMES.map((name, i) => ({
  id: i + 1,
  name,
  fullName: FULL_NAME_MAP[name] || name,
  icd10: ICD_MAP[name] || null,
  forms: FORMS_MAP[name] || [],
  characteristics: CHARS_MAP[name] || [],
  reports: REPORTS_MAP[name] || [],
}));

/* ═══════════════════════════════════════════════════════════════════
   STYLING UTILITIES
   ═══════════════════════════════════════════════════════════════════ */

// Color schemes for form badges
const FORM_COLORS = {
  CSF: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700",
  CF2: "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700",
  SOA: "bg-violet-100 text-violet-700 border-violet-300 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-700",
  CF4: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700",
  CF5: "bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-700",
  "SURGICAL MEMO": "bg-pink-100 text-pink-700 border-pink-300 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-700",
};

/* ═══════════════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Form Badge Component
 * Displays a colored badge for PhilHealth form types
 */
function FormBadge({ label }: { label: string }) {
  const colorClass = FORM_COLORS[label as keyof typeof FORM_COLORS] ||
    "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600";

  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border mr-1 mb-1 ${colorClass}`}>
      {label}
    </span>
  );
}

/**
 * Report Badge Component
 * Displays a badge for required reports
 */
function ReportBadge({ label }: { label: string }) {
  return (
    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-700 border border-teal-300 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-700 mr-1 mb-1">
      {label}
    </span>
  );
}

/**
 * ICD Code Badge Component
 * Displays ICD-10 codes in monospace font
 */
function IcdBadge({ code }: { code: string }) {
  return (
    <code className="px-2 py-1 text-xs font-mono bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 rounded">
      {code}
    </code>
  );
}

/**
 * Filter Pill Component
 * Shows active filters with remove button
 */
function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
      {label}
      <button
        onClick={onRemove}
        className="hover:opacity-70 transition-opacity"
        aria-label="Remove filter"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

/**
 * Table View Component
 * Displays case rates in a tabular format with 5 columns
 */
function TableView({
  data,
  onSelect
}: {
  data: typeof CASE_RATES;
  onSelect: (item: typeof CASE_RATES[0]) => void
}) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              {/* COLUMN 1: Case Rate Name */}
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 bg-blue-50/50 dark:bg-blue-950/30 border-r border-blue-200 dark:border-blue-800">
                Case Rate
              </th>

              {/* COLUMN 2: ICD-10 Code */}
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 bg-emerald-50/50 dark:bg-emerald-950/30 border-r border-emerald-200 dark:border-emerald-800">
                ICD-10
              </th>

              {/* COLUMN 3: Required PhilHealth Forms */}
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 bg-violet-50/50 dark:bg-violet-950/30 border-r border-violet-200 dark:border-violet-800">
                Required Forms
              </th>

              {/* COLUMN 4: Case Characteristics */}
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 bg-amber-50/50 dark:bg-amber-950/30 border-r border-amber-200 dark:border-amber-800">
                Characteristics
              </th>

              {/* COLUMN 5: Required Reports */}
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 bg-rose-50/50 dark:bg-rose-950/30">
                Reports
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row.id}
                onClick={() => onSelect(row)}
                className="cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-700 last:border-b-0 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700"
              >
                {/* COLUMN 1 CONTENT: Display the case rate name */}
                <td className="px-4 py-3 font-medium text-sm text-slate-900 dark:text-slate-100 border-r border-blue-100 dark:border-blue-900">
                  {row.name}
                </td>

                {/* COLUMN 2 CONTENT: Display the ICD-10 code or dash if not available */}
                <td className="px-4 py-3 border-r border-emerald-100 dark:border-emerald-900">
                  {row.icd10 ? (
                    <IcdBadge code={row.icd10} />
                  ) : (
                    <span className="text-slate-400 dark:text-slate-600">—</span>
                  )}
                </td>

                {/* COLUMN 3 CONTENT: Display required forms as colored badges */}
                <td className="px-4 py-3 border-r border-violet-100 dark:border-violet-900">
                  {row.forms.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {row.forms.map(form => (
                        <FormBadge key={form} label={form} />
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-600">—</span>
                  )}
                </td>

                {/* COLUMN 4 CONTENT: Display characteristics as comma-separated text */}
                <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 border-r border-amber-100 dark:border-amber-900">
                  {row.characteristics.length > 0 ? (
                    row.characteristics.join(", ")
                  ) : (
                    <span className="text-slate-400 dark:text-slate-600">—</span>
                  )}
                </td>

                {/* COLUMN 5 CONTENT: Display required reports as badges */}
                <td className="px-4 py-3">
                  {row.reports.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {row.reports.map(report => (
                        <ReportBadge key={report} label={report} />
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-600">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Card View Component
 * Displays case rates as individual cards in a responsive grid
 */
function CardView({
  data,
  onSelect
}: {
  data: typeof CASE_RATES;
  onSelect: (item: typeof CASE_RATES[0]) => void
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.map(item => (
        <div
          key={item.id}
          onClick={() => onSelect(item)}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 cursor-pointer transition-all hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5"
        >
          {/* Card Title - Case Rate Name */}
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-3 line-clamp-2 min-h-[2.5rem]">
            {item.name}
          </h3>

          {/* ICD-10 Code */}
          {item.icd10 && (
            <div className="mb-3">
              <IcdBadge code={item.icd10} />
            </div>
          )}

          {/* Required Forms Section */}
          {item.forms.length > 0 && (
            <div className="mb-3">
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                Forms
              </div>
              <div className="flex flex-wrap gap-1">
                {item.forms.map(form => (
                  <FormBadge key={form} label={form} />
                ))}
              </div>
            </div>
          )}

          {/* Characteristics Section */}
          {item.characteristics.length > 0 && (
            <div className="mb-3">
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                Characteristics
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                {item.characteristics.join(", ")}
              </p>
            </div>
          )}

          {/* Reports Section */}
          {item.reports.length > 0 && (
            <div className="mb-3">
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                Reports
              </div>
              <div className="flex flex-wrap gap-1">
                {item.reports.map(report => (
                  <ReportBadge key={report} label={report} />
                ))}
              </div>
            </div>
          )}

          {/* Card Footer */}
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {item.forms.length} form{item.forms.length !== 1 ? 's' : ''} required
            </span>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Details →
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Detail Modal Component
 * Shows complete information for a selected case rate
 */
function DetailModal({
  item,
  onClose
}: {
  item: typeof CASE_RATES[0] | null;
  onClose: () => void
}) {
  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-start justify-between z-10">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1">
              Case Rate Details
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {item.name}
            </h2>
            {item.fullName !== item.name && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {item.fullName}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* ICD-10 Code Section */}
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-2">
              ICD-10 Code
            </div>
            {item.icd10 ? (
              <IcdBadge code={item.icd10} />
            ) : (
              <p className="text-sm italic text-slate-400 dark:text-slate-600">Not specified</p>
            )}
          </div>

          {/* Required Forms Section */}
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-2">
              Required PhilHealth Forms
            </div>
            {item.forms.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {item.forms.map(form => (
                  <FormBadge key={form} label={form} />
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-slate-400 dark:text-slate-600">None listed</p>
            )}
          </div>

          {/* Characteristics Section */}
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-2">
              Characteristics
            </div>
            {item.characteristics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {item.characteristics.map(char => (
                  <span
                    key={char}
                    className="px-3 py-1.5 rounded-lg text-xs bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600"
                  >
                    {char}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-slate-400 dark:text-slate-600">None listed</p>
            )}
          </div>

          {/* Reports Section */}
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-2">
              Reports Required
            </div>
            {item.reports.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {item.reports.map(report => (
                  <ReportBadge key={report} label={report} />
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-slate-400 dark:text-slate-600">None</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN APP COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterForm, setFilterForm] = useState("All");
  const [filterChar, setFilterChar] = useState("All");
  const [filterReport, setFilterReport] = useState("All");

  // UI states
  const [selectedItem, setSelectedItem] = useState<typeof CASE_RATES[0] | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Apply dark mode class to document
  if (typeof document !== 'undefined') {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  // Filter and search logic
  const filteredData = useMemo(() => {
    let result = [...CASE_RATES];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.fullName.toLowerCase().includes(query) ||
        (item.icd10 && item.icd10.toLowerCase().includes(query))
      );
    }

    // Form filter
    if (filterForm !== "All") {
      result = result.filter(item => item.forms.includes(filterForm));
    }

    // Characteristic filter
    if (filterChar !== "All") {
      result = result.filter(item => item.characteristics.includes(filterChar));
    }

    // Report filter
    if (filterReport !== "All") {
      result = result.filter(item => item.reports.includes(filterReport));
    }

    return result;
  }, [searchQuery, filterForm, filterChar, filterReport]);

  // Count active filters
  const activeFilterCount = [filterForm, filterChar, filterReport].filter(f => f !== "All").length;

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setFilterForm("All");
    setFilterChar("All");
    setFilterReport("All");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* ═══════════════════════════════════════════════════════════
          NAVIGATION BAR
          ═══════════════════════════════════════════════════════════ */}
      <nav className="sticky top-0 z-40 h-14 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 sm:px-6 gap-3 shadow-sm">
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* App Icon */}
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <ClipboardList className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>

          {/* App Title */}
          <h1 className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100">
            CaseRate Checklist
          </h1>

          {/* Separator - Hidden on mobile */}
          <div className="hidden sm:block w-px h-4 bg-slate-300 dark:bg-slate-600" />

          {/* Subtitle - Hidden on mobile */}
          <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400">
            Version 1.0
          </span>
        </div>

        <div className="flex-1" />

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          )}
        </button>
      </nav>

      {/* ═══════════════════════════════════════════════════════════
          TOOLBAR - Search and Filters
          ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-3">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search case rate or ICD-10..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
          </div>

          {/* Form Filter */}
          <select
            value={filterForm}
            onChange={e => setFilterForm(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-shadow"
          >
            <option value="All">All forms</option>
            {ALL_FORMS.map(form => (
              <option key={form} value={form}>{form}</option>
            ))}
          </select>

          {/* Characteristic Filter */}
          <select
            value={filterChar}
            onChange={e => setFilterChar(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-shadow"
          >
            <option value="All">All characteristics</option>
            {ALL_CHARACTERISTICS.map(char => (
              <option key={char} value={char}>{char}</option>
            ))}
          </select>

          {/* Report Filter */}
          <select
            value={filterReport}
            onChange={e => setFilterReport(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-shadow"
          >
            <option value="All">All reports</option>
            {ALL_REPORTS.map(report => (
              <option key={report} value={report}>{report}</option>
            ))}
          </select>

          {/* View Toggle */}
          <div className="flex border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 transition-colors ${
                viewMode === "table"
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'
              }`}
              aria-label="Table view"
            >
              <Table2 className="w-4 h-4" strokeWidth={2} />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`p-2 transition-colors border-l border-slate-300 dark:border-slate-600 ${
                viewMode === "cards"
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'
              }`}
              aria-label="Card view"
            >
              <Grid3x3 className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          ACTIVE FILTERS BAR
          ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-2.5 min-h-[44px] flex items-center gap-2 flex-wrap">
        {activeFilterCount > 0 ? (
          <>
            <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
              Filters:
            </span>
            {filterForm !== "All" && (
              <FilterPill
                label={`Form: ${filterForm}`}
                onRemove={() => setFilterForm("All")}
              />
            )}
            {filterChar !== "All" && (
              <FilterPill
                label={`Char: ${filterChar}`}
                onRemove={() => setFilterChar("All")}
              />
            )}
            {filterReport !== "All" && (
              <FilterPill
                label={`Report: ${filterReport}`}
                onRemove={() => setFilterReport("All")}
              />
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-medium transition-colors"
            >
              Clear all
            </button>
          </>
        ) : (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            No filters applied
          </span>
        )}
        <div className="flex-1" />
        <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
          {filteredData.length} / {CASE_RATES.length} case rates
        </span>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          MAIN CONTENT AREA
          ═══════════════════════════════════════════════════════════ */}
      <main className="flex-1 p-4 sm:p-6 overflow-x-auto">
        {filteredData.length === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              No case rates match your filters.
            </p>
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Clear all filters
            </button>
          </div>
        ) : viewMode === "table" ? (
          <TableView data={filteredData} onSelect={setSelectedItem} />
        ) : (
          <CardView data={filteredData} onSelect={setSelectedItem} />
        )}
      </main>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════════ */}
      <footer className="text-center py-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
        Click any row for full details · CaseRate Checklist · May 2026
      </footer>

      {/* ═══════════════════════════════════════════════════════════
          DETAIL MODAL
          ═══════════════════════════════════════════════════════════ */}
      <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
