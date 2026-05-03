// KORAI ORL – Shared components & utilities
// Exports to window: COLORS, Icon, Card, Button, Badge, Modal, Spinner, Input, Select, API, MOCK_DATA

const COLORS = {
  primary: "#1E40AF",
  secondary: "#3B82F6",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  background: "#F3F4F6",
  cardBg: "#FFFFFF",
  textPrimary: "#1F2937",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  sidebar: "#0F172A",
  sidebarActive: "#1E3A8A",
};

// ─── SVG Icon library ────────────────────────────────────────────────────────
const ICON_PATHS = {
  dashboard: `<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>`,
  stethoscope: `<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>`,
  filetext: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>`,
  message: `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>`,
  user: `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
  logout: `<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>`,
  eye: `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`,
  eyeoff: `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`,
  upload: `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>`,
  check: `<path d="M20 6L9 17l-5-5"/>`,
  x: `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`,
  plus: `<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>`,
  search: `<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>`,
  chevronright: `<polyline points="9 18 15 12 9 6"/>`,
  chevronleft: `<polyline points="15 18 9 12 15 6"/>`,
  download: `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>`,
  alert: `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`,
  clock: `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
  trending: `<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>`,
  activity: `<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>`,
  send: `<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>`,
  filter: `<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>`,
  clipboard: `<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>`,
  arrowright: `<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>`,
  refresh: `<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>`,
  image: `<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>`,
  trash: `<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>`,
  star: `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
  info: `<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>`,
  checkcircle: `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>`,
  xCircle: `<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>`,
  pdf: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 13h6M9 17h3"/>`,
  bars: `<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>`,
};

const Icon = ({ name, size = 18, color = "currentColor", strokeWidth = 2, style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    dangerouslySetInnerHTML={{ __html: ICON_PATHS[name] || '' }}
  />
);

// ─── Card ─────────────────────────────────────────────────────────────────────
const Card = ({ children, style, padding = 24, ...props }) => (
  <div style={{
    background: COLORS.cardBg,
    borderRadius: 12,
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    padding,
    ...style
  }} {...props}>
    {children}
  </div>
);

// ─── Button ────────────────────────────────────────────────────────────────────
const Button = ({ children, variant = 'primary', size = 'md', onClick, disabled, style, icon, fullWidth }) => {
  const sizes = { sm: { padding: '6px 12px', fontSize: 13 }, md: { padding: '10px 20px', fontSize: 14 }, lg: { padding: '14px 28px', fontSize: 15 } };
  const variants = {
    primary: { background: COLORS.primary, color: '#fff', border: 'none' },
    secondary: { background: '#fff', color: COLORS.primary, border: `1.5px solid ${COLORS.primary}` },
    success: { background: COLORS.success, color: '#fff', border: 'none' },
    danger: { background: COLORS.danger, color: '#fff', border: 'none' },
    ghost: { background: 'transparent', color: COLORS.textSecondary, border: `1px solid ${COLORS.border}` },
    warning: { background: COLORS.warning, color: '#fff', border: 'none' },
  };
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...variants[variant],
        ...sizes[size],
        borderRadius: 8,
        fontWeight: 600,
        fontFamily: 'Outfit, sans-serif',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : hover ? 0.88 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        transition: 'all 0.15s ease',
        width: fullWidth ? '100%' : undefined,
        justifyContent: fullWidth ? 'center' : undefined,
        ...style
      }}
    >
      {icon && <Icon name={icon} size={16} color="currentColor" />}
      {children}
    </button>
  );
};

// ─── Badge ─────────────────────────────────────────────────────────────────────
const Badge = ({ children, color = COLORS.primary }) => {
  const bg = color + '18';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600,
      background: bg, color
    }}>
      {children}
    </span>
  );
};

// ─── StatusBadge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    'Validée': { color: COLORS.success, icon: 'checkcircle', label: 'Validée' },
    'Corrigée': { color: COLORS.warning, icon: 'alert', label: 'Corrigée' },
    'En attente': { color: COLORS.secondary, icon: 'clock', label: 'En attente' },
  };
  const s = map[status] || map['En attente'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600,
      background: s.color + '18', color: s.color
    }}>
      <Icon name={s.icon} size={12} color={s.color} />
      {s.label}
    </span>
  );
};

// ─── Modal ─────────────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children, width = 560, hideClose }) => {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(3px)'
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 16,
        width: '90%', maxWidth: width,
        maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: `1px solid ${COLORS.border}`,
          position: 'sticky', top: 0, background: '#fff', zIndex: 1
        }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: COLORS.textPrimary }}>{title}</h3>
          {!hideClose && (
            <button onClick={onClose} style={{
              background: COLORS.background, border: 'none',
              borderRadius: 8, width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}>
              <Icon name="x" size={16} color={COLORS.textSecondary} />
            </button>
          )}
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
};

// ─── Spinner ───────────────────────────────────────────────────────────────────
const Spinner = ({ size = 20, color = COLORS.primary }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ animation: 'spin 0.8s linear infinite' }}>
    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    <circle cx="12" cy="12" r="10" fill="none" stroke={color + '30'} strokeWidth="3"/>
    <path fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
      d="M12 2a10 10 0 0 1 10 10"/>
  </svg>
);

// ─── Input ─────────────────────────────────────────────────────────────────────
const Input = ({ label, value, onChange, placeholder, type = 'text', required, readOnly, suffix, prefix, style }) => {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{ marginBottom: 16, ...style }}>
      {label && (
        <label style={{
          display: 'block', marginBottom: 6,
          fontSize: 13, fontWeight: 600,
          color: COLORS.textSecondary, letterSpacing: '0.02em'
        }}>
          {label}{required && <span style={{ color: COLORS.danger }}> *</span>}
        </label>
      )}
      <div style={{
        display: 'flex', alignItems: 'center',
        border: `1.5px solid ${focused ? COLORS.primary : COLORS.border}`,
        borderRadius: 8, background: readOnly ? COLORS.background : '#fff',
        transition: 'border-color 0.15s',
        overflow: 'hidden'
      }}>
        {prefix && <span style={{ padding: '0 12px', color: COLORS.textSecondary, fontSize: 13 }}>{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, border: 'none', outline: 'none',
            padding: '10px 14px', fontSize: 14,
            fontFamily: 'Outfit, sans-serif',
            color: COLORS.textPrimary,
            background: 'transparent',
            cursor: readOnly ? 'default' : 'text'
          }}
        />
        {suffix}
      </div>
    </div>
  );
};

// ─── Select ────────────────────────────────────────────────────────────────────
const Select = ({ label, value, onChange, options, required }) => (
  <div style={{ marginBottom: 16 }}>
    {label && (
      <label style={{
        display: 'block', marginBottom: 6,
        fontSize: 13, fontWeight: 600,
        color: COLORS.textSecondary
      }}>
        {label}{required && <span style={{ color: COLORS.danger }}> *</span>}
      </label>
    )}
    <select
      value={value}
      onChange={onChange}
      style={{
        width: '100%', padding: '10px 14px',
        border: `1.5px solid ${COLORS.border}`,
        borderRadius: 8, fontSize: 14,
        fontFamily: 'Outfit, sans-serif',
        color: COLORS.textPrimary,
        background: '#fff', outline: 'none',
        cursor: 'pointer'
      }}
    >
      {options.map(o => (
        <option key={o.value || o} value={o.value || o}>{o.label || o}</option>
      ))}
    </select>
  </div>
);

// ─── Divider ───────────────────────────────────────────────────────────────────
const Divider = ({ label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
    <div style={{ flex: 1, height: 1, background: COLORS.border }} />
    {label && <span style={{ fontSize: 12, color: COLORS.textSecondary, fontWeight: 500 }}>{label}</span>}
    <div style={{ flex: 1, height: 1, background: COLORS.border }} />
  </div>
);

// ─── ConfidenceBar ─────────────────────────────────────────────────────────────
const ConfidenceBar = ({ value, color = COLORS.primary }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
      <span style={{ fontSize: 12, color: COLORS.textSecondary }}>Confiance</span>
      <span style={{ fontSize: 13, fontWeight: 700, color }}>{Number(value).toFixed(1)}%</span>
    </div>
    <div style={{ height: 8, background: COLORS.border, borderRadius: 99, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${Math.min(100, Math.max(0, Number(value) || 0))}%`,
        background: `linear-gradient(90deg, ${color}88, ${color})`,
        borderRadius: 99,
        transition: 'width 0.8s ease'
      }} />
    </div>
  </div>
);

// ─── API ───────────────────────────────────────────────────────────────────────
//const API_BASE = 'http://localhost:8000';
const API_BASE = window.location.origin;
const API = {
  chat: async (message, showSources = false, conversationId = null) => {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, show_sources: showSources, conversation_id: conversationId })
    });
    if (!res.ok) throw new Error('API error');
    return res.json();
  },

  // [DEPRECATED] – conservé pour rétro-compat, mais on devrait utiliser diagnoseSeparate
  predict: async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${API_BASE}/vision/predict`, { method: 'POST', body: fd });
    if (!res.ok) throw new Error('Prediction error');
    const data = await res.json();
    if (Array.isArray(data.top3)) {
      data.top3 = data.top3.map(p => Array.isArray(p) ? p : [p.class, p.confidence]);
    }
    return data;
  },

  // ✅ NOUVEAU : diagnostic complet (Vision + RAG + upload Drive + case_store)
  // Renvoie : { case_id, vision, rag, drive_image_url, ... }
  diagnoseSeparate: async (symptoms, file, showSources = true) => {
    const fd = new FormData();
    fd.append('symptoms', symptoms);
    fd.append('show_sources', showSources ? 'true' : 'false');
    fd.append('file', file);
    const res = await fetch(`${API_BASE}/diagnose-separate`, { method: 'POST', body: fd });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Diagnose error: ${res.status} ${txt}`);
    }
    const data = await res.json();
    // Normalisation top3 : objets {class, confidence} → tableaux [name, conf]
    if (data.vision && Array.isArray(data.vision.top3)) {
      data.vision.top3 = data.vision.top3.map(p =>
        Array.isArray(p) ? p : [p.class, p.confidence]
      );
    }
    return data;
  },

  // ✅ NOUVEAU : enregistrer la validation experte (sauvegarde JSON sur Drive)
  // payload : { case_id, expert_id, expert_diagnosis, expert_comment, validation_source }
  validate: async (payload) => {
    const res = await fetch(`${API_BASE}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Validation error: ${res.status} ${txt}`);
    }
    return res.json();
  },

  health: async () => {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },
};

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_CONSULTATIONS = [
  {
    id: '2026-04-0001', date: '2026-04-15', time: '09:30',
    patient: { nom: 'Diallo', prenom: 'Aïssatou', age: 28, sexe: 'Féminin', telephone: '+221 77 123 45 67', adresse: 'Sacré-Cœur 3, Dakar' },
    symptoms: ['Otalgie', 'Fièvre', 'Otorrhée'],
    antecedents: ['Otites récurrentes'],
    hasImage: true,
    vision: { prediction: 'otite moyenne aigue', confidence: 92.5, top3: [['otite moyenne aigue', 92.5], ['otite séromuqueuse', 4.2], ['tympan normal', 1.8]] },
    rag: { causes: 'Infection bactérienne aiguë de l\'oreille moyenne, le plus souvent d\'origine streptococcique.', signes: 'Otalgie pulsatile, fièvre, otorrhée purulente, hypoacousie de transmission.', conduite: 'Antibiothérapie per os (amoxicilline-acide clavulanique), antalgiques, consultation ORL.' },
    expertDiagnosis: 'Otite moyenne aiguë purulente',
    expertComment: 'Tympan très inflammatoire avec épanchement rétrotympanique.',
    status: 'Validée', visionValidated: true, ragValidated: true
  },
  {
    id: '2026-04-0002', date: '2026-04-17', time: '11:00',
    patient: { nom: 'Sow', prenom: 'Mamadou', age: 45, sexe: 'Masculin', telephone: '+221 76 987 65 43', adresse: 'Almadies, Dakar' },
    symptoms: ['Hypoacousie', 'Sensation de plénitude', 'Acouphènes'],
    antecedents: ['Diabète', 'Barotraumatisme'],
    hasImage: true,
    vision: { prediction: 'bouchon de cerumen', confidence: 87.3, top3: [['bouchon de cerumen', 87.3], ['corps étrangers oreille', 7.1], ['tympan normal', 3.2]] },
    rag: { causes: 'Accumulation de cérumen occluant le conduit auditif externe.', signes: 'Hypoacousie progressive, acouphènes, sensation d\'oreille bouchée.', conduite: 'Ceruminolyse locale (huile), lavage auriculaire, ou ablation instrumentale.' },
    expertDiagnosis: 'Bouchon de cérumen bilatéral',
    expertComment: 'Retrait par lavage, résultat immédiat.',
    status: 'Validée', visionValidated: true, ragValidated: true
  },
  {
    id: '2026-04-0003', date: '2026-04-19', time: '14:15',
    patient: { nom: 'Ndiaye', prenom: 'Fatou', age: 32, sexe: 'Féminin', telephone: '+221 70 111 22 33', adresse: 'Plateau, Dakar' },
    symptoms: ['Otalgie', 'Prurit auriculaire', 'Otorrhée'],
    antecedents: ['Immunodépression'],
    hasImage: true,
    vision: { prediction: 'otomycose', confidence: 78.9, top3: [['otomycose', 78.9], ['otite moyenne aigue', 12.3], ['corps étrangers oreille', 4.1]] },
    rag: { causes: 'Infection fongique du conduit auditif externe (Aspergillus, Candida).', signes: 'Prurit intense, otorrhée blanchâtre ou noirâtre, douleur.', conduite: 'Nettoyage local, antifongiques topiques (clotrimazole), correction des facteurs favorisants.' },
    expertDiagnosis: 'Otomycose à Aspergillus',
    expertComment: 'Image non typique, diagnostic confirmé par prélèvement.',
    status: 'Corrigée', visionValidated: false, ragValidated: true,
    visionComment: 'L\'aspect était atypique, prélèvement mycologique nécessaire.'
  },
  {
    id: '2026-04-0004', date: '2026-04-21', time: '08:45',
    patient: { nom: 'Ba', prenom: 'Ibrahim', age: 58, sexe: 'Masculin', telephone: '+221 77 444 55 66', adresse: 'Ouakam, Dakar' },
    symptoms: ['Vertiges', 'Hypoacousie', 'Acouphènes'],
    antecedents: ['Chirurgie ORL', 'Tabagisme'],
    hasImage: false,
    vision: null,
    rag: { causes: 'Perforation tympanique ancienne avec infection surinfectée.', signes: 'Otorrhée chronique, hypoacousie mixte, vertiges positionnels.', conduite: 'Audiométrie, scanner des rochers, myringoplastie si indiqué.' },
    expertDiagnosis: 'Otite chronique cholestéatomateuse',
    expertComment: 'Patient déjà opéré, récidive probable.',
    status: 'Corrigée', visionValidated: false, ragValidated: false,
    ragComment: 'RAG insuffisant pour ce cas complexe.'
  },
  {
    id: '2026-04-0005', date: '2026-04-24', time: '10:00',
    patient: { nom: 'Faye', prenom: 'Awa', age: 19, sexe: 'Féminin', telephone: '+221 78 999 88 77', adresse: 'Médina, Dakar' },
    symptoms: ['Otalgie', 'Fièvre'],
    antecedents: [],
    hasImage: true,
    vision: { prediction: 'tympan normal', confidence: 65.2, top3: [['tympan normal', 65.2], ['otite moyenne aigue', 22.4], ['myringosclerose', 8.1]] },
    rag: { causes: 'Otite externe aiguë possible ou névralgie du IX.', signes: 'Douleur auriculaire sans signe otoscopique franc.', conduite: 'Examen clinique complet, analgésie, surveillance.' },
    expertDiagnosis: 'Otite externe aiguë',
    expertComment: 'Vision peu fiable ici.',
    status: 'Corrigée', visionValidated: false, ragValidated: true,
    visionComment: 'La confiance était trop basse, diagnostic clinique retenu.'
  },
];

const SYMPTOMS_LIST = [
  'Otalgie', 'Otorrhée', 'Hypoacousie', 'Acouphènes',
  'Fièvre', 'Vertiges', 'Prurit auriculaire', 'Sensation de plénitude',
  'Écoulement purulent', 'Perforation tympanique', 'Rhinorrhée', 'Obstruction nasale',
  'Douleur mastoïdienne', 'Paralysie faciale', 'Autre'
];

const ANTECEDENTS_LIST = [
  'Otites récurrentes', 'Chirurgie ORL', 'Traumatisme auriculaire',
  'Perforation tympanique ancienne', 'Cholestéatome',
  'Diabète', 'Immunodépression', 'Allergie',
  'Tabagisme', 'Barotraumatisme', 'HTA', 'Aucun'
];

// ─── localStorage helpers ──────────────────────────────────────────────────────
const Storage = {
  getConsultations: () => {
    try { return JSON.parse(localStorage.getItem('korai_consultations') || 'null') || MOCK_CONSULTATIONS; }
    catch { return MOCK_CONSULTATIONS; }
  },
  saveConsultations: (data) => {
    try { localStorage.setItem('korai_consultations', JSON.stringify(data)); } catch {}
  },
  getUsers: () => {
    try { return JSON.parse(localStorage.getItem('korai_users') || 'null') || [{ username: 'Pr Ciré', password: 'module', role: 'Professeur ORL, Chef de service', initials: 'PC' }]; }
    catch { return [{ username: 'Pr Ciré', password: 'module', role: 'Professeur ORL, Chef de service', initials: 'PC' }]; }
  },
  saveUsers: (data) => {
    try { localStorage.setItem('korai_users', JSON.stringify(data)); } catch {}
  },
  nextDossierId: (consultations) => {
    const now = new Date();
    const prefix = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    const thisMonth = consultations.filter(c => c.id && c.id.startsWith(prefix));
    const num = String(thisMonth.length + 1).padStart(4, '0');
    return `${prefix}-${num}`;
  }
};

Object.assign(window, {
  COLORS, Icon, Card, Button, Badge, StatusBadge, Modal, Spinner,
  Input, Select, Divider, ConfidenceBar, API, Storage,
  MOCK_CONSULTATIONS, SYMPTOMS_LIST, ANTECEDENTS_LIST
});
