// KORAI ORL – Dashboard

const Dashboard = ({ consultations, onNavigate }) => {
  const { COLORS, Icon, Card, Button, Badge, StatusBadge, PageHeader } = window;

  const total = consultations.length;
  const validated = consultations.filter(c => c.status === 'Validée').length;
  const corrected = consultations.filter(c => c.status === 'Corrigée').length;
  const pending = consultations.filter(c => c.status === 'En attente').length;
  const uniquePatients = new Set(consultations.map(c => c.patient.nom + c.patient.prenom)).size;

  // Pathology frequency
  const pathoCounts = {};
  consultations.forEach(c => {
    const p = c.vision?.prediction || (c.expertDiagnosis ? c.expertDiagnosis.toLowerCase() : null);
    if (p) pathoCounts[p] = (pathoCounts[p] || 0) + 1;
  });
  const pathoSorted = Object.entries(pathoCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxPatho = pathoSorted[0]?.[1] || 1;

  // Weekly trend (last 7 days mock)
  const weekData = [3, 5, 2, 7, 4, 6, total > 7 ? total - 27 : 3];
  const maxWeek = Math.max(...weekData);

  // Vision accuracy
  const withImage = consultations.filter(c => c.hasImage && c.vision);
  const visionAcc = withImage.length > 0
    ? Math.round((withImage.filter(c => c.visionValidated).length / withImage.length) * 100)
    : 78;

  const pending5 = consultations.filter(c => c.status === 'En attente').slice(0, 5);
  const recent5 = consultations.slice(-5).reverse();

  const kpis = [
    { label: 'Patients uniques', value: uniquePatients, icon: 'user', color: COLORS.primary, bg: COLORS.primary + '12' },
    { label: 'Consultations', value: total, icon: 'clipboard', color: COLORS.secondary, bg: COLORS.secondary + '12' },
    { label: 'Validées', value: validated, icon: 'checkcircle', color: COLORS.success, bg: COLORS.success + '12' },
    { label: 'Corrigées', value: corrected, icon: 'alert', color: COLORS.warning, bg: COLORS.warning + '12' },
  ];

  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const chartH = 120;

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        subtitle={`Bonjour · ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}`}
        actions={
          <Button variant="primary" icon="stethoscope" onClick={() => onNavigate('new-consultation')}>
            Nouvelle consultation
          </Button>
        }
      />

      <div style={{ padding: '28px 32px' }}>
        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {kpis.map(k => (
            <Card key={k.label} padding={20} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={k.icon} size={22} color={k.color} />
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.textPrimary, lineHeight: 1 }}>{k.value}</div>
                <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 4 }}>{k.label}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 200px', gap: 16, marginBottom: 24 }}>
          {/* Bar chart – Pathologies */}
          <Card padding={24}>
            <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, color: COLORS.textPrimary }}>
              Pathologies fréquentes
            </h3>
            {pathoSorted.length === 0 ? (
              <p style={{ color: COLORS.textSecondary, fontSize: 13 }}>Aucune donnée disponible.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pathoSorted.map(([name, count]) => (
                  <div key={name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: COLORS.textPrimary, fontWeight: 500, textTransform: 'capitalize' }}>{name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.primary }}>{count}</span>
                    </div>
                    <div style={{ height: 7, background: COLORS.border, borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(count / maxPatho) * 100}%`, background: `linear-gradient(90deg, ${COLORS.primary}80, ${COLORS.primary})`, borderRadius: 99 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Line chart – Weekly trend */}
          <Card padding={24}>
            <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, color: COLORS.textPrimary }}>
              Tendance hebdomadaire
            </h3>
            <svg width="100%" height={chartH + 30} viewBox={`0 0 280 ${chartH + 30}`} style={{ overflow: 'visible' }}>
              {/* Grid lines */}
              {[0, 1, 2, 3].map(i => (
                <line key={i} x1="0" y1={i * (chartH / 3)} x2="280" y2={i * (chartH / 3)}
                  stroke={COLORS.border} strokeWidth="1" strokeDasharray="4 3"/>
              ))}
              {/* Area */}
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.primary} stopOpacity="0.2"/>
                  <stop offset="100%" stopColor={COLORS.primary} stopOpacity="0"/>
                </linearGradient>
              </defs>
              <polygon
                points={[
                  ...weekData.map((v, i) => `${i * 46},${chartH - (v / maxWeek) * chartH}`),
                  `${6 * 46},${chartH}`, `0,${chartH}`
                ].join(' ')}
                fill="url(#areaGrad)"
              />
              {/* Line */}
              <polyline
                points={weekData.map((v, i) => `${i * 46},${chartH - (v / maxWeek) * chartH}`).join(' ')}
                fill="none" stroke={COLORS.primary} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
              />
              {/* Dots */}
              {weekData.map((v, i) => (
                <circle key={i} cx={i * 46} cy={chartH - (v / maxWeek) * chartH} r="4"
                  fill="white" stroke={COLORS.primary} strokeWidth="2.5"/>
              ))}
              {/* Labels */}
              {days.map((d, i) => (
                <text key={i} x={i * 46} y={chartH + 20} textAnchor="middle"
                  fontSize="11" fill={COLORS.textSecondary} fontFamily="Outfit,sans-serif">{d}</text>
              ))}
            </svg>
          </Card>

          {/* Gauge – Vision accuracy */}
          <Card padding={20} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: COLORS.textPrimary, textAlign: 'center' }}>
              Précision Vision IA
            </h3>
            <svg width="140" height="90" viewBox="0 0 140 90">
              <defs>
                <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={COLORS.warning}/>
                  <stop offset="50%" stopColor={COLORS.secondary}/>
                  <stop offset="100%" stopColor={COLORS.success}/>
                </linearGradient>
              </defs>
              {/* Background arc */}
              <path d="M 15 80 A 55 55 0 0 1 125 80" fill="none" stroke={COLORS.border} strokeWidth="12" strokeLinecap="round"/>
              {/* Value arc */}
              <path d="M 15 80 A 55 55 0 0 1 125 80" fill="none" stroke="url(#gaugeGrad)" strokeWidth="12"
                strokeLinecap="round" strokeDasharray={`${(visionAcc / 100) * 172} 172`}/>
              <text x="70" y="75" textAnchor="middle" fontSize="24" fontWeight="800"
                fill={COLORS.textPrimary} fontFamily="Outfit,sans-serif">{visionAcc}%</text>
              <text x="70" y="90" textAnchor="middle" fontSize="10"
                fill={COLORS.textSecondary} fontFamily="Outfit,sans-serif">vs. Expert</text>
            </svg>
          </Card>
        </div>

        {/* Recent consultations */}
        <Card padding={0}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: COLORS.textPrimary }}>Consultations récentes</h3>
            <Button variant="ghost" size="sm" icon="arrowright" onClick={() => onNavigate('reports')}>Voir tout</Button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: COLORS.background }}>
                  {['N° Dossier', 'Patient', 'Date', 'Prédiction Vision', 'Statut', 'Action'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent5.map((c, i) => (
                  <tr key={c.id} style={{ borderTop: `1px solid ${COLORS.border}` }}
                    onMouseEnter={e => e.currentTarget.style.background = COLORS.background}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: COLORS.primary, fontFamily: 'monospace' }}>{c.id}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.textPrimary }}>{c.patient.prenom} {c.patient.nom}</div>
                      <div style={{ fontSize: 12, color: COLORS.textSecondary }}>{c.patient.age} ans · {c.patient.sexe}</div>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: COLORS.textSecondary }}>{c.date}</td>
                    <td style={{ padding: '14px 20px' }}>
                      {c.vision ? (
                        <span style={{ fontSize: 13, color: COLORS.textPrimary, textTransform: 'capitalize' }}>{c.vision.prediction} <span style={{ color: COLORS.secondary, fontWeight: 600 }}>({c.vision.confidence}%)</span></span>
                      ) : (
                        <span style={{ fontSize: 12, color: COLORS.textSecondary, fontStyle: 'italic' }}>RAG uniquement</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 20px' }}><StatusBadge status={c.status} /></td>
                    <td style={{ padding: '14px 20px' }}>
                      {c.status === 'En attente' ? (
                        <Button variant="primary" size="sm" icon="check" onClick={() => onNavigate('new-consultation')}>Valider</Button>
                      ) : (
                        <Button variant="ghost" size="sm" icon="filetext" onClick={() => onNavigate('reports')}>Détail</Button>
                      )}
                    </td>
                  </tr>
                ))}
                {recent5.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: COLORS.textSecondary, fontSize: 14 }}>
                    Aucune consultation. <button style={{ color: COLORS.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'Outfit,sans-serif' }} onClick={() => onNavigate('new-consultation')}>Créer la première →</button>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

Object.assign(window, { Dashboard });
