// KORAI ORL – Login screen + Create expert modal

const Login = ({ onLogin }) => {
  const { COLORS, Icon, Card, Button, Input, Modal, Storage } = window;
  const [username, setUsername] = React.useState('Pr Ciré');
  const [password, setPassword] = React.useState('module');
  const [showPwd, setShowPwd] = React.useState(false);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showCreate, setShowCreate] = React.useState(false);
  // Create form
  const [newName, setNewName] = React.useState('');
  const [newRole, setNewRole] = React.useState('Médecin ORL');
  const [newPwd, setNewPwd] = React.useState('');
  const [newPwd2, setNewPwd2] = React.useState('');
  const [createMsg, setCreateMsg] = React.useState('');

  const handleLogin = async () => {
    setError(''); setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const users = Storage.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    setLoading(false);
    if (user) {
      onLogin(user);
    } else {
      setError('Identifiants incorrects. Vérifiez votre nom d\'utilisateur et mot de passe.');
    }
  };

  const handleCreate = () => {
    setCreateMsg('');
    if (!newName || !newPwd) return setCreateMsg('Tous les champs obligatoires doivent être remplis.');
    if (newPwd !== newPwd2) return setCreateMsg('Les mots de passe ne correspondent pas.');
    const users = Storage.getUsers();
    if (users.find(u => u.username === newName)) return setCreateMsg('Ce nom d\'utilisateur existe déjà.');
    const initials = newName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    users.push({ username: newName, password: newPwd, role: newRole, initials });
    Storage.saveUsers(users);
    setCreateMsg('✓ Compte créé. Vous pouvez maintenant vous connecter.');
    setNewName(''); setNewPwd(''); setNewPwd2('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Outfit, sans-serif', position: 'relative', overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-5%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 65%)' }} />
        {/* Grid */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>
      </div>

      <div style={{ width: '100%', maxWidth: 440, padding: '0 16px', position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Icon name="activity" size={26} color="white" />
            </div>
            <span style={{ fontSize: 32, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>KORAI</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Système ORL · v3
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.97)',
          borderRadius: 20,
          padding: 36,
          boxShadow: '0 24px 80px rgba(0,0,0,0.35)'
        }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: COLORS.textPrimary }}>
            Connexion
          </h2>
          <p style={{ margin: '0 0 28px', color: COLORS.textSecondary, fontSize: 14 }}>
            Accédez à votre espace expert ORL
          </p>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: COLORS.textSecondary }}>
              Nom d'utilisateur
            </label>
            <div style={{
              display: 'flex', alignItems: 'center',
              border: `1.5px solid ${COLORS.border}`,
              borderRadius: 10, background: '#fff', overflow: 'hidden'
            }}>
              <div style={{ padding: '0 14px', color: COLORS.textSecondary }}>
                <Icon name="user" size={16} color={COLORS.textSecondary} />
              </div>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Nom d'utilisateur"
                style={{ flex: 1, border: 'none', outline: 'none', padding: '12px 14px 12px 0', fontSize: 14, fontFamily: 'Outfit,sans-serif', color: COLORS.textPrimary }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: COLORS.textSecondary }}>
              Mot de passe
            </label>
            <div style={{
              display: 'flex', alignItems: 'center',
              border: `1.5px solid ${COLORS.border}`,
              borderRadius: 10, background: '#fff', overflow: 'hidden'
            }}>
              <div style={{ padding: '0 14px', color: COLORS.textSecondary }}>
                <Icon name="eye" size={16} color={COLORS.textSecondary} />
              </div>
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mot de passe"
                style={{ flex: 1, border: 'none', outline: 'none', padding: '12px 0', fontSize: 14, fontFamily: 'Outfit,sans-serif', color: COLORS.textPrimary }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              <button onClick={() => setShowPwd(v => !v)} style={{
                background: 'none', border: 'none', padding: '0 14px',
                cursor: 'pointer', color: COLORS.textSecondary
              }}>
                <Icon name={showPwd ? 'eyeoff' : 'eye'} size={16} color={COLORS.textSecondary} />
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: COLORS.danger + '12', border: `1px solid ${COLORS.danger}30`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 18,
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              <Icon name="alert" size={15} color={COLORS.danger} />
              <span style={{ fontSize: 13, color: COLORS.danger }}>{error}</span>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%', padding: '13px', borderRadius: 10,
              background: loading ? COLORS.secondary : COLORS.primary,
              color: 'white', border: 'none', fontFamily: 'Outfit,sans-serif',
              fontSize: 15, fontWeight: 700, cursor: loading ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'background 0.2s'
            }}
          >
            {loading ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" style={{ animation: 'spin 0.8s linear infinite' }}>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="3"/>
                  <path fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" d="M12 2a10 10 0 0 1 10 10"/>
                </svg>
                Connexion en cours…
              </>
            ) : (
              <>Se connecter <Icon name="arrowright" size={16} color="white" /></>
            )}
          </button>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button
              onClick={() => setShowCreate(true)}
              style={{
                background: 'none', border: 'none', color: COLORS.primary,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'Outfit,sans-serif', textDecoration: 'underline'
              }}
            >
              Créer un nouveau compte expert
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 20 }}>
          KORAI ORL v3 · Données sécurisées Google Drive
        </p>
      </div>

      {/* Create Expert Modal */}
      <Modal open={showCreate} onClose={() => { setShowCreate(false); setCreateMsg(''); }} title="Créer un compte expert" width={440}>
        <div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: COLORS.textSecondary }}>
              Nom complet <span style={{ color: COLORS.danger }}>*</span>
            </label>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Dr Prénom Nom"
              style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, fontFamily: 'Outfit,sans-serif', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: COLORS.textSecondary }}>Rôle</label>
            <select
              value={newRole}
              onChange={e => setNewRole(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, fontFamily: 'Outfit,sans-serif', outline: 'none' }}
            >
              <option>Médecin ORL</option>
              <option>Professeur ORL</option>
              <option>Interne ORL</option>
              <option>Chirurgien ORL</option>
              <option>Audiologiste</option>
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: COLORS.textSecondary }}>
              Mot de passe <span style={{ color: COLORS.danger }}>*</span>
            </label>
            <input
              type="password"
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, fontFamily: 'Outfit,sans-serif', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: COLORS.textSecondary }}>
              Confirmer le mot de passe <span style={{ color: COLORS.danger }}>*</span>
            </label>
            <input
              type="password"
              value={newPwd2}
              onChange={e => setNewPwd2(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, fontFamily: 'Outfit,sans-serif', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {createMsg && (
            <div style={{
              padding: '10px 14px', borderRadius: 8, marginBottom: 16,
              background: createMsg.startsWith('✓') ? COLORS.success + '12' : COLORS.danger + '12',
              border: `1px solid ${createMsg.startsWith('✓') ? COLORS.success : COLORS.danger}30`,
              fontSize: 13,
              color: createMsg.startsWith('✓') ? COLORS.success : COLORS.danger
            }}>
              {createMsg}
            </div>
          )}

          <Button variant="primary" fullWidth onClick={handleCreate} icon="plus">
            Créer le compte
          </Button>
        </div>
      </Modal>
    </div>
  );
};

Object.assign(window, { Login });
