// KORAI ORL – Profile page

const Profile = ({ user, consultations }) => {
  const { COLORS, Icon, Card, Button, StatusBadge, PageHeader, Storage } = window;
  const [editing, setEditing] = React.useState(false);
  const [role, setRole] = React.useState(user?.role || '');
  const [saved, setSaved] = React.useState(false);

  const total = consultations.length;
  const validated = consultations.filter(c => c.status === 'Validée').length;
  const corrected = consultations.filter(c => c.status === 'Corrigée').length;
  const withImage = consultations.filter(c => c.hasImage).length;
  const accuracy = withImage > 0 ? Math.round((consultations.filter(c => c.visionValidated).length / withImage) * 100) : 0;

  const handleSave = () => {
    const users = Storage.getUsers();
    const idx = users.findIndex(u => u.username === user.username);
    if (idx !== -1) { users[idx].role = role; Storage.saveUsers(users); }
    setSaved(true); setEditing(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const stats = [
    { label: 'Consultations validées', value: validated, icon: 'checkcircle', color: COLORS.success },
    { label: 'Consultations corrigées', value: corrected, icon: 'alert', color: COLORS.warning },
    { label: 'Avec image otoscopique', value: withImage, icon: 'image', color: COLORS.primary },
    { label: 'Précision Vision validée', value: `${accuracy}%`, icon: 'trending', color: COLORS.secondary },
  ];

  const initials = user?.initials || (user?.username || 'U').slice(0, 2).toUpperCase();

  return (
    <div>
      <PageHeader title="Mon profil" subtitle="Informations du compte et statistiques personnelles" />
      <div style={{ padding: '28px 32px', maxWidth: 900 }}>

        {saved && (
          <div style={{ marginBottom: 20, padding: '12px 18px', background: COLORS.success + '10', border: `1px solid ${COLORS.success}30`, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="checkcircle" size={16} color={COLORS.success} />
            <span style={{ fontSize: 14, color: COLORS.success, fontWeight: 600 }}>Profil mis à jour avec succès.</span>
          </div>
        )}

        {/* Profile card */}
        <Card padding={32} style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 28 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 800, color: 'white', flexShrink: 0
          }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: COLORS.textPrimary }}>{user?.username}</h2>
            {editing ? (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8 }}>
                <select value={role} onChange={e => setRole(e.target.value)} style={{ padding: '8px 12px', border: `1.5px solid ${COLORS.primary}`, borderRadius: 8, fontSize: 14, fontFamily: 'Outfit,sans-serif', outline: 'none' }}>
                  {['Professeur ORL, Chef de service', 'Médecin ORL', 'Chirurgien ORL', 'Interne ORL', 'Audiologiste'].map(r => <option key={r}>{r}</option>)}
                </select>
                <Button variant="success" size="sm" icon="check" onClick={handleSave}>Sauvegarder</Button>
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Annuler</Button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
                <span style={{ fontSize: 15, color: COLORS.textSecondary }}>{user?.role}</span>
                <button onClick={() => setEditing(true)} style={{ background: COLORS.background, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>
                  Modifier
                </button>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <span style={{ padding: '4px 12px', borderRadius: 20, background: COLORS.success + '12', color: COLORS.success, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.success }} />
              Actif
            </span>
            <span style={{ fontSize: 12, color: COLORS.textSecondary }}>{total} consultation{total > 1 ? 's' : ''} réalisée{total > 1 ? 's' : ''}</span>
          </div>
        </Card>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {stats.map(s => (
            <Card key={s.label} padding={20} style={{ textAlign: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.color + '12', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Icon name={s.icon} size={20} color={s.color} />
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: COLORS.textPrimary }}>{s.value}</div>
              <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 4, lineHeight: 1.4 }}>{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Recent activity */}
        <Card padding={0}>
          <div style={{ padding: '18px 24px', borderBottom: `1px solid ${COLORS.border}` }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: COLORS.textPrimary }}>Activité récente</h3>
          </div>
          <div>
            {consultations.slice(-6).reverse().map((c, i) => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px', borderBottom: i < 5 ? `1px solid ${COLORS.border}` : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: c.status === 'Validée' ? COLORS.success + '12' : COLORS.warning + '12', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={c.status === 'Validée' ? 'checkcircle' : 'alert'} size={16} color={c.status === 'Validée' ? COLORS.success : COLORS.warning} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.textPrimary }}>{c.patient.prenom} {c.patient.nom}</div>
                  <div style={{ fontSize: 12, color: COLORS.textSecondary }}>{c.expertDiagnosis || 'Diagnostic en attente'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, color: COLORS.textSecondary }}>{c.date}</span>
                  <StatusBadge status={c.status} />
                </div>
              </div>
            ))}
            {consultations.length === 0 && (
              <div style={{ padding: 32, textAlign: 'center', color: COLORS.textSecondary, fontSize: 14 }}>
                Aucune consultation enregistrée pour ce compte.
              </div>
            )}
          </div>
        </Card>

        {/* System info */}
        <Card padding={24} style={{ marginTop: 24, background: COLORS.background }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Informations système</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
            {[
              ['Backend', 'FastAPI · localhost:8000'],
              ['Modèle Vision', 'EfficientNet-B0 (ONNX)'],
              ['Modèle RAG', 'Mistral-7b · Chroma'],
              ['Embeddings', 'CamemBERT-bio-base'],
              ['Stockage', 'Google Drive + SQLite'],
              ['Version', 'KORAI ORL v3'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ fontSize: 12, color: COLORS.textSecondary, fontWeight: 600 }}>{k}</span>
                <span style={{ fontSize: 12, color: COLORS.textPrimary, fontFamily: 'monospace' }}>{v}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

Object.assign(window, { Profile });
