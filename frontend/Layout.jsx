// KORAI ORL – Layout (Sidebar + page wrapper)

const Layout = ({ user, route, onNavigate, onLogout, children }) => {
  const { COLORS, Icon } = window;

  const navItems = [
    { key: 'dashboard',          icon: 'dashboard',   label: 'Tableau de bord' },
    { key: 'new-consultation',   icon: 'stethoscope', label: 'Nouvelle consultation' },
    { key: 'reports',            icon: 'filetext',    label: 'Consultations' },
    { key: 'chatbot',            icon: 'message',     label: 'Assistant RAG' },
    { key: 'profile',            icon: 'user',        label: 'Mon profil' },
  ];

  const initials = user?.initials || (user?.username || 'U').slice(0, 2).toUpperCase();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Outfit, sans-serif', background: COLORS.background }}>
      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside style={{
        width: 260, flexShrink: 0,
        background: 'linear-gradient(180deg, #0F172A 0%, #1E3A8A 100%)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
        boxShadow: '4px 0 24px rgba(0,0,0,0.18)'
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Icon name="activity" size={20} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '-0.3px', lineHeight: 1 }}>KORAI</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>ORL v3</div>
            </div>
          </div>
        </div>

        {/* User info */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0
            }}>
              {initials}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.username || 'Utilisateur'}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.role || 'Expert ORL'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '8px 8px 4px' }}>
            Navigation
          </div>
          {navItems.map(item => {
            const active = route === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 12px', borderRadius: 10, border: 'none',
                  background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                  color: active ? 'white' : 'rgba(255,255,255,0.55)',
                  fontSize: 14, fontWeight: active ? 600 : 400,
                  fontFamily: 'Outfit, sans-serif',
                  cursor: 'pointer', marginBottom: 2,
                  textAlign: 'left', transition: 'all 0.15s ease',
                  borderLeft: active ? '3px solid #60A5FA' : '3px solid transparent',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon name={item.icon} size={18} color={active ? '#93C5FD' : 'rgba(255,255,255,0.45)'} />
                {item.label}
                {item.key === 'new-consultation' && (
                  <span style={{
                    marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%',
                    background: '#10B981', flexShrink: 0
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={onLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 12px', borderRadius: 10, border: 'none',
              background: 'transparent',
              color: 'rgba(255,255,255,0.45)',
              fontSize: 14, fontWeight: 400,
              fontFamily: 'Outfit, sans-serif',
              cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#FCA5A5'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
          >
            <Icon name="logout" size={18} color="currentColor" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main style={{ marginLeft: 260, flex: 1, minHeight: '100vh', overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
};

// ── Page header component ──────────────────────────────────────────────────────
const PageHeader = ({ title, subtitle, actions }) => {
  const { COLORS } = window;
  return (
    <div style={{
      padding: '28px 32px 20px',
      borderBottom: `1px solid ${COLORS.border}`,
      background: COLORS.cardBg,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 50,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
    }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: COLORS.textPrimary, letterSpacing: '-0.2px' }}>{title}</h1>
        {subtitle && <p style={{ margin: '4px 0 0', fontSize: 14, color: COLORS.textSecondary }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 10 }}>{actions}</div>}
    </div>
  );
};

Object.assign(window, { Layout, PageHeader });
