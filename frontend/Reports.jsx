// KORAI ORL – Reports list + Case detail + GENERATEUR PDF (jsPDF)

// =============================================================================
// CONFIGURATION MEDECIN (apparaît sur tous les PDF générés)
// =============================================================================
// Pour modifier ces infos plus tard, il suffit de changer ce bloc.
// Une évolution future possible : lire ces infos depuis le profil utilisateur.
const DOCTOR_INFO = {
  name: 'Pr Ciré Ndiaye',
  title: 'Chef de service ORL',
  institution: 'Service ORL - CHU de Fann',
  city: 'Dakar',
};

const Reports = ({ consultations, onCaseSelect }) => {
  const { COLORS, Icon, Card, Button, StatusBadge, PageHeader } = window;
  const [search, setSearch] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('Tous');

  const filtered = consultations.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.patient.nom.toLowerCase().includes(q) || c.patient.prenom.toLowerCase().includes(q) || c.patient.telephone?.includes(q) || c.id.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'Tous' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleExportCSV = () => {
    const headers = ['N° Dossier', 'Patient', 'Date', 'Diagnostic expert', 'Statut'];
    const rows = filtered.map(c => [c.id, `${c.patient.prenom} ${c.patient.nom}`, c.date, c.expertDiagnosis || '', c.status]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'korai_consultations.csv'; a.click();
  };

  return (
    <div>
      <PageHeader
        title="Liste des consultations"
        subtitle={`${filtered.length} résultat${filtered.length > 1 ? 's' : ''}`}
        actions={
          <Button variant="ghost" size="sm" icon="download" onClick={handleExportCSV}>Exporter CSV</Button>
        }
      />
      <div style={{ padding: '28px 32px' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
              <Icon name="search" size={16} color={COLORS.textSecondary} />
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par nom, téléphone, dossier…"
              style={{ width: '100%', padding: '10px 14px 10px 38px', border: `1.5px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, fontFamily: 'Outfit,sans-serif', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['Tous', 'Validée', 'Corrigée', 'En attente'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{
                padding: '8px 16px', borderRadius: 8, border: `1.5px solid ${filterStatus === s ? COLORS.primary : COLORS.border}`,
                background: filterStatus === s ? COLORS.primary : '#fff',
                color: filterStatus === s ? 'white' : COLORS.textSecondary,
                fontSize: 13, fontWeight: filterStatus === s ? 600 : 400,
                fontFamily: 'Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap'
              }}>{s}</button>
            ))}
          </div>
        </div>

        <Card padding={0}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: COLORS.background }}>
                  {['N° Dossier', 'Patient', 'Date', 'Diagnostic Vision', 'Diagnostic Expert', 'Statut', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: COLORS.textSecondary }}>
                    <Icon name="search" size={28} color={COLORS.border} />
                    <p style={{ margin: '10px 0 0', fontSize: 14 }}>Aucune consultation trouvée.</p>
                  </td></tr>
                )}
                {filtered.map(c => (
                  <tr key={c.id}
                    style={{ borderTop: `1px solid ${COLORS.border}`, cursor: 'pointer', transition: 'background 0.12s' }}
                    onMouseEnter={e => e.currentTarget.style.background = COLORS.background}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => onCaseSelect(c)}
                  >
                    <td style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: COLORS.primary, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{c.id}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.textPrimary, whiteSpace: 'nowrap' }}>{c.patient.prenom} {c.patient.nom}</div>
                      <div style={{ fontSize: 12, color: COLORS.textSecondary }}>{c.patient.age} ans · {c.patient.sexe}</div>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: COLORS.textSecondary, whiteSpace: 'nowrap' }}>{c.date}</td>
                    <td style={{ padding: '14px 20px' }}>
                      {c.vision ? (
                        <div>
                          <span style={{ fontSize: 13, color: COLORS.textPrimary, textTransform: 'capitalize', fontWeight: 500 }}>{c.vision.prediction}</span>
                          <span style={{ fontSize: 12, color: COLORS.secondary, fontWeight: 600, marginLeft: 4 }}>({Number(c.vision.confidence).toFixed(1)}%)</span>
                        </div>
                      ) : <span style={{ fontSize: 12, color: COLORS.textSecondary, fontStyle: 'italic' }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: COLORS.textPrimary, maxWidth: 200 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.expertDiagnosis || '—'}</span>
                    </td>
                    <td style={{ padding: '14px 20px' }}><StatusBadge status={c.status} /></td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" icon="filetext" onClick={() => onCaseSelect(c)}>Détail</Button>
                        <Button variant="ghost" size="sm" icon="pdf" onClick={() => generatePDF(c)}>PDF</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

// =============================================================================
// VRAI GENERATEUR PDF avec jsPDF
// =============================================================================
// Génère et télécharge directement un fichier .pdf professionnel signé
// par Pr Ciré Ndiaye.
//
// Dépendances : jsPDF + jsPDF-AutoTable (chargés dans index.html)
// =============================================================================

const generatePDF = (c) => {
  // Vérifier que jsPDF est bien chargé
  if (typeof window.jspdf === 'undefined') {
    alert('Erreur : jsPDF non chargé. Vérifiez que index.html inclut bien jsPDF.');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  // Couleurs (RGB)
  const PRIMARY = [30, 64, 175];
  const SUCCESS = [16, 185, 129];
  const DANGER = [220, 38, 38];
  const TEXT = [31, 41, 55];
  const MUTED = [107, 114, 128];
  const BORDER = [229, 231, 235];

  const PAGE_W = doc.internal.pageSize.getWidth();
  const PAGE_H = doc.internal.pageSize.getHeight();
  const MARGIN_X = 18;
  const CONTENT_W = PAGE_W - 2 * MARGIN_X;

  // ── EN-TÊTE ────────────────────────────────────────────────────────────
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, PAGE_W, 32, 'F');

  // KORAI à gauche
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('KORAI ORL', MARGIN_X, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Rapport de consultation médicale', MARGIN_X, 19);

  // Bloc médecin à droite
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(DOCTOR_INFO.name, PAGE_W - MARGIN_X, 11, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(DOCTOR_INFO.title, PAGE_W - MARGIN_X, 16, { align: 'right' });
  doc.text(DOCTOR_INFO.institution, PAGE_W - MARGIN_X, 21, { align: 'right' });

  // Date de génération sur fond bleu
  doc.setFontSize(8);
  doc.setTextColor(220, 230, 250);
  doc.text(
    `Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
    MARGIN_X, 28
  );

  let y = 42;

  // ── BANDEAU N° DOSSIER ─────────────────────────────────────────────────
  doc.setFillColor(243, 244, 246);
  doc.rect(MARGIN_X, y, CONTENT_W, 14, 'F');
  doc.setTextColor(...MUTED);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('N° DOSSIER', MARGIN_X + 4, y + 5);

  doc.setTextColor(...PRIMARY);
  doc.setFontSize(14);
  doc.text(c.id || '—', MARGIN_X + 4, y + 11);

  doc.setTextColor(...MUTED);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const dateStr = c.date + (c.time ? ' à ' + c.time : '');
  doc.text(dateStr, PAGE_W - MARGIN_X - 4, y + 8, { align: 'right' });

  y += 20;

  // ── SECTION : PATIENT ──────────────────────────────────────────────────
  drawSectionTitle(doc, 'PATIENT', y, MARGIN_X, CONTENT_W, PRIMARY);
  y += 8;

  doc.autoTable({
    startY: y,
    head: [],
    body: [
      ['Nom complet', `${c.patient.prenom || ''} ${c.patient.nom || ''}`.trim() || '—'],
      ['Âge', c.patient.age ? `${c.patient.age} ans` : '—'],
      ['Sexe', c.patient.sexe || '—'],
      ['Téléphone', c.patient.telephone || '—'],
      ['Adresse', c.patient.adresse || '—'],
    ],
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: { top: 1.5, bottom: 1.5, left: 0, right: 2 } },
    columnStyles: {
      0: { cellWidth: 40, textColor: MUTED, fontStyle: 'normal' },
      1: { textColor: TEXT, fontStyle: 'bold' },
    },
    margin: { left: MARGIN_X, right: MARGIN_X },
  });
  y = doc.lastAutoTable.finalY + 6;

  // ── SECTION : ANAMNÈSE ─────────────────────────────────────────────────
  ensureSpace(doc, y, 30, MARGIN_X, PAGE_W);
  y = doc.__currentY || y;

  drawSectionTitle(doc, 'ANAMNÈSE', y, MARGIN_X, CONTENT_W, PRIMARY);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text('Symptômes', MARGIN_X, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...TEXT);
  const symptomsText = (c.symptoms || []).join(', ') || 'Non renseigné';
  const symptomsLines = doc.splitTextToSize(symptomsText, CONTENT_W);
  doc.text(symptomsLines, MARGIN_X, y);
  y += symptomsLines.length * 4.5 + 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text('Antécédents', MARGIN_X, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...TEXT);
  const anteText = (c.antecedents || []).join(', ') || 'Aucun';
  const anteLines = doc.splitTextToSize(anteText, CONTENT_W);
  doc.text(anteLines, MARGIN_X, y);
  y += anteLines.length * 4.5 + 8;

  // ── SECTION : DIAGNOSTIC IA ────────────────────────────────────────────
  ensureSpace(doc, y, 50, MARGIN_X, PAGE_W);
  y = doc.__currentY || y;

  drawSectionTitle(doc, 'DIAGNOSTIC ASSISTÉ PAR IA', y, MARGIN_X, CONTENT_W, PRIMARY);
  y += 8;

  // Vision
  if (c.vision) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...TEXT);
    doc.text('Vision IA (analyse otoscopique)', MARGIN_X, y);

    if (c.visionValidated === true) drawBadge(doc, 'Validé', PAGE_W - MARGIN_X - 22, y - 4, SUCCESS);
    else if (c.visionValidated === false) drawBadge(doc, 'Refusé', PAGE_W - MARGIN_X - 22, y - 4, DANGER);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...PRIMARY);
    doc.text(
      `${capitalize(c.vision.prediction)} · ${Number(c.vision.confidence).toFixed(1)}%`,
      MARGIN_X, y
    );
    y += 6;

    if (c.vision.top3 && c.vision.top3.length > 0) {
      const top3Body = c.vision.top3.slice(0, 3).map(p => {
        const [name, conf] = Array.isArray(p) ? p : [p.class, p.confidence];
        return [capitalize(name), `${Number(conf).toFixed(1)}%`];
      });
      doc.autoTable({
        startY: y,
        head: [['Top 3 prédictions', 'Confiance']],
        body: top3Body,
        theme: 'striped',
        styles: { fontSize: 9, cellPadding: 1.5 },
        headStyles: { fillColor: [243, 244, 246], textColor: MUTED, fontSize: 8, fontStyle: 'bold' },
        columnStyles: { 1: { halign: 'right', cellWidth: 30 } },
        margin: { left: MARGIN_X, right: MARGIN_X },
      });
      y = doc.lastAutoTable.finalY + 4;
    }

    if (c.visionComment) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(...DANGER);
      const cmtLines = doc.splitTextToSize(`Commentaire expert : ${c.visionComment}`, CONTENT_W);
      doc.text(cmtLines, MARGIN_X, y);
      y += cmtLines.length * 4 + 4;
    }
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text('Aucune image otoscopique fournie pour cette consultation.', MARGIN_X, y);
    y += 6;
  }

  y += 4;

  // RAG
  if (c.rag) {
    ensureSpace(doc, y, 40, MARGIN_X, PAGE_W);
    y = doc.__currentY || y;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...TEXT);
    doc.text('Analyse RAG (Mistral · base ORL)', MARGIN_X, y);

    if (c.ragValidated === true) drawBadge(doc, 'Validé', PAGE_W - MARGIN_X - 22, y - 4, SUCCESS);
    else if (c.ragValidated === false) drawBadge(doc, 'Refusé', PAGE_W - MARGIN_X - 22, y - 4, DANGER);
    y += 6;

    [
      ['Causes probables', c.rag.causes],
      ['Signes associés', c.rag.signes],
      ['Conduite à tenir', c.rag.conduite],
    ].forEach(([label, val]) => {
      if (!val) return;
      ensureSpace(doc, y, 18, MARGIN_X, PAGE_W);
      y = doc.__currentY || y;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...SUCCESS);
      doc.text(label.toUpperCase(), MARGIN_X, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...TEXT);
      const lines = doc.splitTextToSize(val, CONTENT_W);
      doc.text(lines, MARGIN_X, y);
      y += lines.length * 4.5 + 4;
    });

    if (c.ragComment) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(...DANGER);
      const cmtLines = doc.splitTextToSize(`Commentaire expert : ${c.ragComment}`, CONTENT_W);
      doc.text(cmtLines, MARGIN_X, y);
      y += cmtLines.length * 4 + 4;
    }
  }

  y += 4;

  // ── SECTION : DIAGNOSTIC FINAL EXPERT ──────────────────────────────────
  ensureSpace(doc, y, 30, MARGIN_X, PAGE_W);
  y = doc.__currentY || y;

  doc.setFillColor(...PRIMARY);
  doc.rect(MARGIN_X, y, CONTENT_W, 1, 'F');
  y += 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...PRIMARY);
  doc.text('DIAGNOSTIC FINAL DE L\'EXPERT', MARGIN_X, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...TEXT);
  const expDx = c.expertDiagnosis || 'Non renseigné';
  const expLines = doc.splitTextToSize(expDx, CONTENT_W);
  doc.text(expLines, MARGIN_X, y);
  y += expLines.length * 6 + 4;

  if (c.expertComment) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    const cmtLines = doc.splitTextToSize(c.expertComment, CONTENT_W);
    doc.text(cmtLines, MARGIN_X, y);
    y += cmtLines.length * 4.5 + 4;
  }

  // Statut
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text('Statut :', MARGIN_X, y + 3);
  const statusColor = c.status === 'Validée' ? SUCCESS : c.status === 'Corrigée' ? [217, 119, 6] : MUTED;
  drawBadge(doc, c.status || 'En attente', MARGIN_X + 16, y - 1, statusColor);
  y += 12;

  // ── BLOC SIGNATURE ─────────────────────────────────────────────────────
  ensureSpace(doc, y, 40, MARGIN_X, PAGE_W);
  y = doc.__currentY || y;

  y += 8;
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.line(MARGIN_X, y, PAGE_W - MARGIN_X, y);
  y += 8;

  // Date à gauche, signature à droite
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(`Fait à ${DOCTOR_INFO.city}, le ${new Date().toLocaleDateString('fr-FR')}`, MARGIN_X, y);

  // Bloc signature à droite
  const SIG_X = PAGE_W - MARGIN_X - 70;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...TEXT);
  doc.text(DOCTOR_INFO.name, SIG_X, y);
  y += 5;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(DOCTOR_INFO.title, SIG_X, y);
  y += 4;
  doc.text(DOCTOR_INFO.institution, SIG_X, y);
  y += 12;

  // Cadre signature manuscrite
  doc.setDrawColor(...MUTED);
  doc.setLineWidth(0.3);
  doc.line(SIG_X, y, PAGE_W - MARGIN_X, y);
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text('Signature et cachet', SIG_X, y + 3);

  // ── PIED DE PAGE (sur toutes les pages) ───────────────────────────────
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.2);
    doc.line(MARGIN_X, PAGE_H - 14, PAGE_W - MARGIN_X, PAGE_H - 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`KORAI ORL · ${DOCTOR_INFO.name} · Document confidentiel`, MARGIN_X, PAGE_H - 9);
    doc.text(
      `Page ${i} sur ${pageCount}`,
      PAGE_W - MARGIN_X, PAGE_H - 9, { align: 'right' }
    );
    doc.text(
      `Dossier ${c.id || '—'} · ${c.patient.prenom || ''} ${c.patient.nom || ''}`,
      PAGE_W / 2, PAGE_H - 9, { align: 'center' }
    );
  }

  // ── TÉLÉCHARGEMENT ────────────────────────────────────────────────────
  const safeName = (c.patient.nom || 'patient').replace(/[^a-z0-9]/gi, '_');
  const fileName = `KORAI_${c.id}_${safeName}_${c.date}.pdf`;
  doc.save(fileName);
};

// ── Helpers PDF ─────────────────────────────────────────────────────────
const drawSectionTitle = (doc, title, y, marginX, contentW, color) => {
  doc.setFillColor(...color);
  doc.rect(marginX, y, 3, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...color);
  doc.text(title, marginX + 6, y + 4);
};

const drawBadge = (doc, label, x, y, color) => {
  doc.setFillColor(...color);
  doc.roundedRect(x, y, 22, 6, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(label, x + 11, y + 4, { align: 'center' });
};

const ensureSpace = (doc, y, needed, marginX, pageW) => {
  const pageH = doc.internal.pageSize.getHeight();
  if (y + needed > pageH - 20) {
    doc.addPage();
    doc.__currentY = 20;
  } else {
    doc.__currentY = y;
  }
};

const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};


// =============================================================================
// CASE DETAIL (vue détail + bouton PDF)
// =============================================================================
const CaseDetail = ({ cas, onBack }) => {
  const { COLORS, Icon, Card, Button, StatusBadge, ConfidenceBar, PageHeader } = window;
  if (!cas) return null;
  const c = cas;

  return (
    <div>
      <PageHeader
        title={`Consultation ${c.id}`}
        subtitle={`${c.patient.prenom} ${c.patient.nom} · ${c.date}`}
        actions={
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="ghost" icon="chevronleft" onClick={onBack}>Retour</Button>
            <Button variant="primary" icon="pdf" onClick={() => generatePDF(c)}>Télécharger PDF</Button>
          </div>
        }
      />
      <div style={{ padding: '28px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Patient */}
        <Card padding={24}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: COLORS.textPrimary, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="user" size={16} color={COLORS.primary} /> Patient
          </h3>
          {[
            ['N° Dossier', c.id, true],
            ['Nom complet', `${c.patient.prenom} ${c.patient.nom}`],
            ['Âge', `${c.patient.age} ans`],
            ['Sexe', c.patient.sexe],
            ['Téléphone', c.patient.telephone],
            ['Adresse', c.patient.adresse],
          ].map(([label, val, mono]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${COLORS.border}` }}>
              <span style={{ fontSize: 13, color: COLORS.textSecondary }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.textPrimary, fontFamily: mono ? 'monospace' : undefined }}>{val || '—'}</span>
            </div>
          ))}
        </Card>

        {/* Symptoms + antecedents */}
        <Card padding={24}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: COLORS.textPrimary, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="clipboard" size={16} color={COLORS.primary} /> Anamnèse
          </h3>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Symptômes</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(c.symptoms || []).map(s => (
                <span key={s} style={{ padding: '4px 10px', borderRadius: 20, background: COLORS.primary + '10', color: COLORS.primary, fontSize: 12, fontWeight: 600 }}>{s}</span>
              ))}
              {(!c.symptoms || c.symptoms.length === 0) && <span style={{ fontSize: 13, color: COLORS.textSecondary }}>—</span>}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Antécédents</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(c.antecedents || []).map(a => (
                <span key={a} style={{ padding: '4px 10px', borderRadius: 20, background: COLORS.warning + '10', color: COLORS.warning, fontSize: 12, fontWeight: 600 }}>{a}</span>
              ))}
              {(!c.antecedents || c.antecedents.length === 0) && <span style={{ fontSize: 13, color: COLORS.textSecondary }}>Aucun</span>}
            </div>
          </div>
        </Card>

        {/* Vision */}
        <Card padding={24} style={{ borderTop: `3px solid ${COLORS.primary}` }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: COLORS.textPrimary, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="image" size={16} color={COLORS.primary} /> Vision IA</span>
            {c.visionValidated === true && <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: COLORS.success + '12', color: COLORS.success }}>Validé</span>}
            {c.visionValidated === false && <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: COLORS.danger + '12', color: COLORS.danger }}>Refusé</span>}
          </h3>
          {c.vision ? (
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.textPrimary, textTransform: 'capitalize', marginBottom: 12 }}>{c.vision.prediction}</div>
              <ConfidenceBar value={c.vision.confidence} color={c.vision.confidence > 80 ? COLORS.success : COLORS.warning} />
              {c.visionComment && (
                <div style={{ marginTop: 12, padding: '10px 14px', background: COLORS.danger + '08', borderRadius: 8, borderLeft: `3px solid ${COLORS.danger}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.danger, marginBottom: 4, textTransform: 'uppercase' }}>Commentaire expert</div>
                  <div style={{ fontSize: 13, color: COLORS.textPrimary }}>{c.visionComment}</div>
                </div>
              )}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: 13, color: COLORS.textSecondary, fontStyle: 'italic' }}>Aucune image fournie pour cette consultation.</p>
          )}
        </Card>

        {/* RAG */}
        <Card padding={24} style={{ borderTop: `3px solid ${COLORS.success}` }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: COLORS.textPrimary, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="message" size={16} color={COLORS.success} /> Analyse RAG</span>
            {c.ragValidated === true && <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: COLORS.success + '12', color: COLORS.success }}>Validé</span>}
            {c.ragValidated === false && <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: COLORS.danger + '12', color: COLORS.danger }}>Refusé</span>}
          </h3>
          {c.rag ? (
            <div>
              {[['Causes probables', c.rag.causes], ['Signes associés', c.rag.signes], ['Conduite à tenir', c.rag.conduite]].map(([label, val]) => val && (
                <div key={label} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${COLORS.border}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.success, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
                  <p style={{ margin: 0, fontSize: 13, color: COLORS.textPrimary, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{val}</p>
                </div>
              ))}
              {c.ragComment && (
                <div style={{ marginTop: 8, padding: '10px 14px', background: COLORS.danger + '08', borderRadius: 8, borderLeft: `3px solid ${COLORS.danger}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.danger, marginBottom: 4, textTransform: 'uppercase' }}>Commentaire expert</div>
                  <div style={{ fontSize: 13, color: COLORS.textPrimary }}>{c.ragComment}</div>
                </div>
              )}
            </div>
          ) : <p style={{ margin: 0, fontSize: 13, color: COLORS.textSecondary }}>—</p>}
        </Card>

        {/* Expert diagnosis */}
        <Card padding={24} style={{ gridColumn: 'span 2', background: `linear-gradient(135deg, ${COLORS.primary}06, ${COLORS.cardBg})`, borderTop: `3px solid ${COLORS.primary}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: COLORS.textPrimary, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="star" size={16} color={COLORS.primary} /> Diagnostic final expert
              </h3>
              <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.primary, marginBottom: 8 }}>{c.expertDiagnosis}</div>
              {c.expertComment && <p style={{ margin: 0, fontSize: 14, color: COLORS.textSecondary, lineHeight: 1.5, fontStyle: 'italic' }}>{c.expertComment}</p>}
            </div>
            <StatusBadge status={c.status} />
          </div>
        </Card>
      </div>
    </div>
  );
};

Object.assign(window, { Reports, CaseDetail, generatePDF });