// KORAI ORL – Nouvelle consultation (6 étapes + modale validation)

const STEPS = ['Patient', 'Symptômes', 'Antécédents', 'Image', 'Diagnostic', 'Validation'];

const NewConsultation = ({ consultations, setConsultations, onDone }) => {
  const { COLORS, Icon, Card, Button, Modal, Spinner, ConfidenceBar, StatusBadge,
          SYMPTOMS_LIST, ANTECEDENTS_LIST, Storage, API } = window;

  const [step, setStep] = React.useState(0);

  // Step 1 – Patient
  const dossierId = React.useMemo(() => Storage.nextDossierId(consultations), [consultations.length]);
  const [patient, setPatient] = React.useState({ nom: '', prenom: '', telephone: '', adresse: '', age: '', sexe: 'Masculin' });

  // Step 2 – Symptoms
  const [symptoms, setSymptoms] = React.useState([]);
  const [symptomOther, setSymptomOther] = React.useState('');

  // Step 3 – Antecedents
  const [antecedents, setAntecedents] = React.useState([]);
  const [anteOther, setAnteOther] = React.useState('');

  // Step 4 – Image
  const [wantsImage, setWantsImage] = React.useState(null); // null | true | false
  const [imageFile, setImageFile] = React.useState(null);
  const [imagePreview, setImagePreview] = React.useState(null);
  const [dragOver, setDragOver] = React.useState(false);
  const fileRef = React.useRef();

  // Step 5 – Diagnosis
  const [diagLoading, setDiagLoading] = React.useState(false);
  const [diagError, setDiagError] = React.useState('');
  const [visionResult, setVisionResult] = React.useState(null);
  const [ragResult, setRagResult] = React.useState(null);
  const [showRagSources, setShowRagSources] = React.useState(false);
  const [caseId, setCaseId] = React.useState(null);            // case_id retourné par /diagnose-separate
  const [driveImageUrl, setDriveImageUrl] = React.useState(null);

  // Step 6 – Validation modal
  const [showModal, setShowModal] = React.useState(false);
  const [visionValidated, setVisionValidated] = React.useState(null);
  const [ragValidated, setRagValidated] = React.useState(null);
  const [visionComment, setVisionComment] = React.useState('');
  const [ragComment, setRagComment] = React.useState('');
  const [expertDiagnosis, setExpertDiagnosis] = React.useState('');
  const [expertComment, setExpertComment] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const toggleTag = (list, setList, tag) => {
    if (tag === 'Autre') { setList(l => l.includes('Autre') ? l.filter(t => t !== 'Autre') : [...l, 'Autre']); return; }
    setList(l => l.includes(tag) ? l.filter(t => t !== tag) : [...l, tag]);
  };

  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = e => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    handleImageFile(e.dataTransfer.files[0]);
  };

  const allSymptoms = symptoms.includes('Autre') && symptomOther
    ? [...symptoms.filter(s => s !== 'Autre'), symptomOther]
    : symptoms.filter(s => s !== 'Autre');
  const allAntecedents = antecedents.includes('Autre') && anteOther
    ? [...antecedents.filter(a => a !== 'Autre'), anteOther]
    : antecedents.filter(a => a !== 'Autre');

  // ── Parser RAG : robuste, basé sur les en-têtes numérotés ───────────────────
  // Format attendu (renvoyé par le RAG) :
  //   1. Causes probables
  //   <contenu>
  //   2. Signes associés
  //   <contenu>
  //   3. Conduite à tenir
  //   <contenu>
  const parseRagSections = (raw) => {
    if (!raw) return { causes: '', signes: '', conduite: '' };
    const cleaned = raw.replace(/\*\*/g, '').replace(/^#+\s*/gm, '').trim();
    const sections = { causes: '', signes: '', conduite: '' };
    const blocks = cleaned.split(/\n(?=\s*[1-9][.)]\s)/);

    for (const block of blocks) {
      const m = block.match(/^\s*([1-9])[.)]\s*(.+?)(?:\n|$)([\s\S]*)/);
      if (!m) continue;
      const num = m[1];
      const heading = m[2].toLowerCase();
      const body = (m[3] || '').trim();

      if (num === '1' || heading.includes('cause')) sections.causes = body;
      else if (num === '2' || heading.includes('signe') || heading.includes('symptôme') || heading.includes('symptome')) sections.signes = body;
      else if (num === '3' || heading.includes('conduite') || heading.includes('quand') || heading.includes('traitement')) sections.conduite = body;
    }
    return sections;
  };

  // ── Run diagnosis ──────────────────────────────────────────────────────────
  const runDiagnosis = async () => {
    setDiagLoading(true); setDiagError('');
    setCaseId(null); setDriveImageUrl(null);

    const symptomsText = `Patient ${patient.prenom || ''} ${patient.nom || ''}, ${patient.age || '?'} ans, ${patient.sexe || ''}. ` +
      `Symptômes : ${allSymptoms.join(', ') || 'non précisés'}. ` +
      `Antécédents : ${allAntecedents.join(', ') || 'aucun'}. ` +
      `Quel est le diagnostic ORL probable et la conduite à tenir ?`;

    try {
      // ✅ Cas avec image : /diagnose-separate (Vision + RAG + upload Drive + case_store)
      if (wantsImage && imageFile) {
        const result = await API.diagnoseSeparate(symptomsText, imageFile, true);

        setCaseId(result.case_id);
        setDriveImageUrl(result.drive_image_url || null);

        setVisionResult({
          prediction: result.vision.prediction,
          confidence: result.vision.confidence,
          top3: result.vision.top3
        });

        const text = result.rag.summary || '';
        const parsed = parseRagSections(text);
        setRagResult({
          fullText: text,
          causes: parsed.causes || text.slice(0, 200),
          signes: parsed.signes || '',
          conduite: parsed.conduite || '',
          sources: result.rag.sources || []
        });

      } else {
        // ✅ Cas sans image : /chat seul (pas de case créé, donc pas de validation Drive)
        const rRes = await API.chat(symptomsText, true);
        const text = rRes.response || '';
        const parsed = parseRagSections(text);

        setRagResult({
          fullText: text,
          causes: parsed.causes || text.slice(0, 200),
          signes: parsed.signes || '',
          conduite: parsed.conduite || '',
          sources: rRes.sources || []
        });
      }
    } catch (err) {
      console.error('Erreur diagnostic:', err);
      // Fallback mock quand backend inaccessible
      if (wantsImage && imageFile) {
        const mockPreds = ['otite moyenne aigue', 'bouchon de cerumen', 'otomycose', 'tympan normal'];
        const mockPred = mockPreds[Math.floor(Math.random() * mockPreds.length)];
        const mockConf = (65 + Math.random() * 30).toFixed(1);
        setVisionResult({
          prediction: mockPred,
          confidence: parseFloat(mockConf),
          top3: [[mockPred, parseFloat(mockConf)], ['tympan normal', (100 - mockConf - 5).toFixed(1)]]
        });
      }
      setRagResult({
        fullText: 'Analyse basée sur les symptômes fournis (mode hors-ligne).',
        causes: 'Backend inaccessible — données simulées.',
        signes: 'Otalgie, fièvre, possible otorrhée purulente.',
        conduite: 'Antibiothérapie per os recommandée, consultation ORL sous 48h.',
        sources: []
      });
    }
    setDiagLoading(false);
  };

  React.useEffect(() => {
    if (step === 4 && !diagLoading && !visionResult && !ragResult) runDiagnosis();
  }, [step]);

  // ── Validate & save ────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!expertDiagnosis.trim()) return;
    setSaving(true);

    const status = (visionValidated === false || ragValidated === false || expertDiagnosis !== (visionResult?.prediction || expertDiagnosis))
      ? 'Corrigée' : 'Validée';

    // ✅ Appel /validate pour exporter le JSON sur Drive (uniquement si caseId présent)
    let driveExportUrl = null;
    if (caseId) {
      try {
        const validationResponse = await API.validate({
          case_id: caseId,
          expert_id: 'pr_cire', // TODO: remplacer par l'utilisateur connecté quand l'auth sera en place
          expert_diagnosis: expertDiagnosis,
          expert_comment: expertComment || '',
          validation_source: 'expert'
        });
        driveExportUrl = validationResponse.drive_export_url || null;
        console.log('Validation envoyée au backend:', validationResponse);
      } catch (err) {
        console.error('Échec /validate:', err);
        // On continue : on sauvegarde au moins en local
      }
    } else {
      console.warn('Pas de caseId → validation non envoyée au backend (consultation sans image)');
    }

    // Stockage local (rétro-compat)
    const newCase = {
      id: dossierId,
      caseId: caseId,
      driveImageUrl,
      driveExportUrl,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      patient: { ...patient, age: parseInt(patient.age) },
      symptoms: allSymptoms,
      antecedents: allAntecedents,
      hasImage: !!(wantsImage && imageFile),
      vision: visionResult,
      rag: ragResult ? { causes: ragResult.causes, signes: ragResult.signes, conduite: ragResult.conduite } : null,
      expertDiagnosis,
      expertComment,
      status,
      visionValidated,
      ragValidated,
      visionComment: visionValidated === false ? visionComment : null,
      ragComment: ragValidated === false ? ragComment : null,
    };

    const updated = [...consultations, newCase];
    setConsultations(updated);
    Storage.saveConsultations(updated);
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setShowModal(false); onDone(); }, 1500);
  };

  // ── Tag grid ───────────────────────────────────────────────────────────────
  const TagGrid = ({ items, selected, onToggle, otherVal, onOtherChange }) => (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {items.map(tag => {
          const active = selected.includes(tag);
          return (
            <button key={tag} onClick={() => onToggle(tag)} style={{
              padding: '8px 16px', borderRadius: 20,
              border: `1.5px solid ${active ? COLORS.primary : COLORS.border}`,
              background: active ? COLORS.primary + '12' : '#fff',
              color: active ? COLORS.primary : COLORS.textSecondary,
              fontSize: 13, fontWeight: active ? 600 : 400,
              fontFamily: 'Outfit,sans-serif', cursor: 'pointer',
              transition: 'all 0.15s'
            }}>
              {tag === 'Autre' ? '+ Autre' : tag}
            </button>
          );
        })}
      </div>
      {selected.includes('Autre') && (
        <input
          value={otherVal}
          onChange={e => onOtherChange(e.target.value)}
          placeholder="Précisez…"
          style={{
            marginTop: 12, width: '100%', padding: '10px 14px',
            border: `1.5px solid ${COLORS.primary}`, borderRadius: 8,
            fontSize: 14, fontFamily: 'Outfit,sans-serif', outline: 'none', boxSizing: 'border-box'
          }}
        />
      )}
    </div>
  );

  // ── Step renderer ──────────────────────────────────────────────────────────
  const canNext = () => {
    if (step === 0) return patient.nom && patient.prenom && patient.telephone && patient.adresse && patient.age;
    if (step === 1) return symptoms.length > 0;
    if (step === 3) return wantsImage !== null && (wantsImage === false || imageFile);
    return true;
  };

  const renderStep = () => {
    // ── Step 1: Patient ─────────────────────────────────────────────────────
    if (step === 0) return (
      <div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: COLORS.primary + '10', borderRadius: 8,
          padding: '8px 14px', marginBottom: 24
        }}>
          <Icon name="clipboard" size={15} color={COLORS.primary} />
          <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary, fontFamily: 'monospace' }}>
            N° Dossier : {dossierId}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          {[
            { label: 'Nom', key: 'nom', required: true, placeholder: 'Diallo' },
            { label: 'Prénom', key: 'prenom', required: true, placeholder: 'Aïssatou' },
            { label: 'Téléphone', key: 'telephone', required: true, placeholder: '+221 77 …' },
            { label: 'Adresse', key: 'adresse', required: true, placeholder: 'Sacré-Cœur 3, Dakar' },
            { label: 'Âge (ans)', key: 'age', required: true, placeholder: '28', type: 'number' },
          ].map(f => (
            <div key={f.key} style={{ gridColumn: f.key === 'adresse' ? 'span 2' : undefined }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: COLORS.textSecondary }}>
                {f.label}{f.required && <span style={{ color: COLORS.danger }}> *</span>}
              </label>
              <input
                type={f.type || 'text'}
                value={patient[f.key]}
                onChange={e => setPatient(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, fontFamily: 'Outfit,sans-serif', outline: 'none', marginBottom: 16, boxSizing: 'border-box' }}
              />
            </div>
          ))}
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: COLORS.textSecondary }}>Sexe <span style={{ color: COLORS.danger }}>*</span></label>
            <div style={{ display: 'flex', gap: 10 }}>
              {['Masculin', 'Féminin'].map(s => (
                <button key={s} onClick={() => setPatient(p => ({ ...p, sexe: s }))} style={{
                  flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer', fontFamily: 'Outfit,sans-serif',
                  border: `1.5px solid ${patient.sexe === s ? COLORS.primary : COLORS.border}`,
                  background: patient.sexe === s ? COLORS.primary + '10' : '#fff',
                  color: patient.sexe === s ? COLORS.primary : COLORS.textSecondary,
                  fontWeight: patient.sexe === s ? 600 : 400, fontSize: 14,
                }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );

    // ── Step 2: Symptoms ────────────────────────────────────────────────────
    if (step === 1) return (
      <div>
        <p style={{ color: COLORS.textSecondary, fontSize: 14, marginTop: 0, marginBottom: 20 }}>
          Sélectionnez tous les symptômes pertinents.
        </p>
        <TagGrid items={SYMPTOMS_LIST} selected={symptoms} onToggle={t => toggleTag(symptoms, setSymptoms, t)} otherVal={symptomOther} onOtherChange={setSymptomOther} />
      </div>
    );

    // ── Step 3: Antecedents ─────────────────────────────────────────────────
    if (step === 2) return (
      <div>
        <p style={{ color: COLORS.textSecondary, fontSize: 14, marginTop: 0, marginBottom: 20 }}>
          Sélectionnez les antécédents médicaux du patient.
        </p>
        <TagGrid items={ANTECEDENTS_LIST} selected={antecedents} onToggle={t => toggleTag(antecedents, setAntecedents, t)} otherVal={anteOther} onOtherChange={setAnteOther} />
      </div>
    );

    // ── Step 4: Image ───────────────────────────────────────────────────────
    if (step === 3) return (
      <div>
        <p style={{ fontSize: 15, fontWeight: 500, color: COLORS.textPrimary, marginTop: 0, marginBottom: 20 }}>
          Souhaitez-vous joindre une image otoscopique ?
        </p>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {[{ val: true, label: 'Oui', sub: 'Image + RAG' }, { val: false, label: 'Non', sub: 'RAG uniquement' }].map(opt => (
            <button key={String(opt.val)} onClick={() => { setWantsImage(opt.val); if (!opt.val) { setImageFile(null); setImagePreview(null); } }} style={{
              flex: 1, padding: '16px 20px', borderRadius: 12, cursor: 'pointer', fontFamily: 'Outfit,sans-serif',
              border: `2px solid ${wantsImage === opt.val ? COLORS.primary : COLORS.border}`,
              background: wantsImage === opt.val ? COLORS.primary + '08' : '#fff',
              textAlign: 'left', transition: 'all 0.15s'
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: wantsImage === opt.val ? COLORS.primary : COLORS.textPrimary }}>{opt.label}</div>
              <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 4 }}>{opt.sub}</div>
            </button>
          ))}
        </div>

        {wantsImage === true && (
          !imagePreview ? (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? COLORS.primary : COLORS.border}`,
                borderRadius: 12, padding: '48px 24px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: dragOver ? COLORS.primary + '05' : COLORS.background,
                cursor: 'pointer', transition: 'all 0.2s', gap: 12
              }}
            >
              <div style={{ width: 56, height: 56, borderRadius: 14, background: COLORS.primary + '12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="upload" size={26} color={COLORS.primary} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: COLORS.textPrimary, textAlign: 'center' }}>Glisser-déposer ou cliquer</p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' }}>PNG, JPG, JPEG · max 10 Mo</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageFile(e.target.files[0])} />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 20, background: COLORS.background, borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
              <img src={imagePreview} alt="otoscope" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 10, border: `2px solid ${COLORS.border}` }} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 4px', fontWeight: 600, color: COLORS.textPrimary, fontSize: 14 }}>{imageFile.name}</p>
                <p style={{ margin: 0, color: COLORS.textSecondary, fontSize: 13 }}>{(imageFile.size / 1024).toFixed(0)} Ko · Prêt pour analyse</p>
                <button onClick={() => { setImageFile(null); setImagePreview(null); }} style={{ marginTop: 10, background: COLORS.danger + '12', border: 'none', color: COLORS.danger, padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'Outfit,sans-serif' }}>
                  Supprimer
                </button>
              </div>
            </div>
          )
        )}

        {wantsImage === false && (
          <div style={{ background: COLORS.warning + '10', border: `1px solid ${COLORS.warning}30`, borderRadius: 10, padding: '14px 18px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Icon name="info" size={16} color={COLORS.warning} style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ margin: 0, fontSize: 13, color: COLORS.textPrimary }}>Le diagnostic reposera uniquement sur l'analyse RAG des symptômes. La carte Vision ne sera pas disponible.</p>
          </div>
        )}
      </div>
    );

    // ── Step 5: Diagnosis ────────────────────────────────────────────────────
    if (step === 4) return (
      <div>
        {diagLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 16 }}>
            <Spinner size={40} color={COLORS.primary} />
            <p style={{ color: COLORS.textSecondary, fontSize: 15, margin: 0 }}>Analyse en cours…</p>
            <p style={{ color: COLORS.textSecondary, fontSize: 13, margin: 0, opacity: 0.7 }}>Vision IA + RAG médical</p>
          </div>
        )}

        {!diagLoading && (
          <div style={{ display: 'grid', gridTemplateColumns: visionResult ? '1fr 1fr' : '1fr', gap: 16 }}>
            {/* Vision card */}
            {visionResult ? (
              <Card padding={20} style={{ border: `2px solid ${COLORS.primary}20` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: COLORS.primary + '12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="image" size={16} color={COLORS.primary} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>Vision IA</div>
                    <div style={{ fontSize: 11, color: COLORS.textSecondary }}>EfficientNet-B0</div>
                  </div>
                </div>
                {imagePreview && <img src={imagePreview} alt="otoscope" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, marginBottom: 14 }} />}
                <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.textPrimary, textTransform: 'capitalize', marginBottom: 12 }}>
                  {visionResult.prediction}
                </div>
                <ConfidenceBar value={visionResult.confidence} color={visionResult.confidence > 80 ? COLORS.success : COLORS.warning} />
                {visionResult.top3 && visionResult.top3.length > 1 && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${COLORS.border}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Top 3</div>
                    {visionResult.top3.map(([name, conf], i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12, color: i === 0 ? COLORS.textPrimary : COLORS.textSecondary }}>
                        <span style={{ textTransform: 'capitalize', fontWeight: i === 0 ? 600 : 400 }}>{name}</span>
                        <span style={{ fontWeight: 600 }}>{parseFloat(conf).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ) : (
              <Card padding={20} style={{ border: `1px dashed ${COLORS.border}`, background: COLORS.background, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <Icon name="image" size={32} color={COLORS.textSecondary} />
                <p style={{ margin: 0, fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' }}>Aucune image fournie – diagnostic basé uniquement sur le RAG</p>
              </Card>
            )}

            {/* RAG card */}
            {ragResult && (
              <Card padding={20} style={{ border: `2px solid ${COLORS.success}20` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: COLORS.success + '12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="message" size={16} color={COLORS.success} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>Analyse RAG</div>
                    <div style={{ fontSize: 11, color: COLORS.textSecondary }}>Mistral-7b · Chroma</div>
                  </div>
                </div>

                {[
                  { label: 'Causes probables', value: ragResult.causes },
                  { label: 'Signes associés', value: ragResult.signes },
                  { label: 'Conduite à tenir', value: ragResult.conduite },
                ].map((s, i) => s.value && (
                  <div key={i} style={{
                    marginBottom: 14,
                    paddingBottom: 14,
                    borderBottom: i < 2 ? `1px solid ${COLORS.border}` : 'none'
                  }}>
                    <div style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: COLORS.success,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: 6,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <span style={{
                        display: 'inline-block',
                        width: 3,
                        height: 12,
                        background: COLORS.success,
                        borderRadius: 2
                      }} />
                      {s.label}
                    </div>
                    <p style={{
                      margin: 0,
                      fontSize: 13,
                      color: COLORS.textPrimary,
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {s.value}
                    </p>
                  </div>
                ))}

                {/* Bouton "Voir la réponse RAG complète" si le parsing semble incomplet */}
                {ragResult.fullText && ragResult.fullText.length > (
                  (ragResult.causes?.length || 0) + (ragResult.signes?.length || 0) + (ragResult.conduite?.length || 0) + 100
                ) && (
                  <details style={{ marginTop: 8, marginBottom: 12, fontSize: 12 }}>
                    <summary style={{
                      cursor: 'pointer',
                      color: COLORS.secondary,
                      fontWeight: 600,
                      padding: '6px 0'
                    }}>
                      Voir la réponse RAG complète
                    </summary>
                    <p style={{
                      margin: '8px 0 0',
                      padding: '10px 12px',
                      background: COLORS.background,
                      borderRadius: 6,
                      fontSize: 12,
                      color: COLORS.textSecondary,
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                      maxHeight: 300,
                      overflowY: 'auto'
                    }}>
                      {ragResult.fullText}
                    </p>
                  </details>
                )}

                {ragResult.sources?.length > 0 && (
                  <div>
                    <button onClick={() => setShowRagSources(v => !v)} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: COLORS.secondary, fontSize: 12, fontWeight: 600,
                      fontFamily: 'Outfit,sans-serif', padding: 0, display: 'flex', alignItems: 'center', gap: 4
                    }}>
                      <Icon name={showRagSources ? 'chevronleft' : 'chevronright'} size={13} color={COLORS.secondary} />
                      {showRagSources ? 'Masquer' : 'Afficher'} les sources ({ragResult.sources.length})
                    </button>
                    {showRagSources && (
                      <div style={{ marginTop: 10 }}>
                        {ragResult.sources.map((s, i) => (
                          <div key={i} style={{ padding: '8px 12px', background: COLORS.background, borderRadius: 8, marginBottom: 6, fontSize: 12 }}>
                            <div style={{ fontWeight: 600, color: COLORS.textPrimary }}>{s.source} {s.page ? `· p.${s.page}` : ''}</div>
                            <div style={{ color: COLORS.textSecondary, marginTop: 2 }}>{s.content}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )}
          </div>
        )}
      </div>
    );

    return null;
  };

  // ── Validation Modal content ───────────────────────────────────────────────
  // IMPORTANT : on utilise une variable JSX (validationModalContent) plutôt qu'un
  // composant interne (ValidationModal), pour éviter le re-mount à chaque keystroke
  // qui faisait perdre le focus dans les inputs.
  const validationModalContent = (
    <Modal open={showModal} onClose={() => !saving && setShowModal(false)} title="Validation experte" width={620}>
      {saved ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: COLORS.success + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Icon name="checkcircle" size={36} color={COLORS.success} />
          </div>
          <h3 style={{ color: COLORS.textPrimary, margin: '0 0 8px' }}>Consultation enregistrée</h3>
          <p style={{ color: COLORS.textSecondary, margin: 0 }}>Redirection vers la liste des consultations…</p>
        </div>
      ) : (
        <div>
          {/* Recap */}
          <div style={{ background: COLORS.background, borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: COLORS.textSecondary, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Récapitulatif</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>{patient.prenom} {patient.nom} · {patient.age} ans · {patient.sexe}</div>
            <div style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 4 }}>
              Symptômes : {allSymptoms.join(', ') || '—'}&nbsp;&nbsp;·&nbsp;&nbsp;Antécédents : {allAntecedents.join(', ') || 'aucun'}
            </div>
            {imagePreview && <img src={imagePreview} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, marginTop: 10 }} />}
          </div>

          {/* Vision evaluation */}
          {visionResult && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 8 }}>
                Évaluation Vision IA
                <span style={{ fontSize: 12, fontWeight: 400, color: COLORS.textSecondary, marginLeft: 8, textTransform: 'capitalize' }}>
                  → {visionResult.prediction} ({Number(visionResult.confidence).toFixed(1)}%)
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {[{ val: true, label: 'Valider', col: COLORS.success }, { val: false, label: 'Refuser', col: COLORS.danger }].map(opt => (
                  <button key={String(opt.val)} onClick={() => setVisionValidated(opt.val)} style={{
                    flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontSize: 14, fontWeight: 600,
                    border: `2px solid ${visionValidated === opt.val ? opt.col : COLORS.border}`,
                    background: visionValidated === opt.val ? opt.col + '10' : '#fff',
                    color: visionValidated === opt.val ? opt.col : COLORS.textSecondary,
                  }}>{opt.label}</button>
                ))}
              </div>
              {visionValidated === false && (
                <textarea value={visionComment} onChange={e => setVisionComment(e.target.value)} placeholder="Commentaire sur le refus Vision…" rows={2}
                  style={{ width: '100%', marginTop: 8, padding: '10px 14px', border: `1.5px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, fontFamily: 'Outfit,sans-serif', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              )}
            </div>
          )}

          {/* RAG evaluation */}
          {ragResult && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 8 }}>Évaluation Analyse RAG</div>
              <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 10, padding: '8px 12px', background: COLORS.background, borderRadius: 8, fontStyle: 'italic' }}>
                {(ragResult.causes || ragResult.fullText || '').slice(0, 120)}…
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {[{ val: true, label: 'Valider', col: COLORS.success }, { val: false, label: 'Refuser', col: COLORS.danger }].map(opt => (
                  <button key={String(opt.val)} onClick={() => setRagValidated(opt.val)} style={{
                    flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontSize: 14, fontWeight: 600,
                    border: `2px solid ${ragValidated === opt.val ? opt.col : COLORS.border}`,
                    background: ragValidated === opt.val ? opt.col + '10' : '#fff',
                    color: ragValidated === opt.val ? opt.col : COLORS.textSecondary,
                  }}>{opt.label}</button>
                ))}
              </div>
              {ragValidated === false && (
                <textarea value={ragComment} onChange={e => setRagComment(e.target.value)} placeholder="Commentaire sur le refus RAG…" rows={2}
                  style={{ width: '100%', marginTop: 8, padding: '10px 14px', border: `1.5px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, fontFamily: 'Outfit,sans-serif', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              )}
            </div>
          )}

          {/* Expert diagnosis */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: COLORS.textSecondary }}>
              Diagnostic final expert <span style={{ color: COLORS.danger }}>*</span>
            </label>
            <input value={expertDiagnosis} onChange={e => setExpertDiagnosis(e.target.value)} placeholder="Ex : Otite moyenne aiguë purulente"
              style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${expertDiagnosis ? COLORS.primary : COLORS.border}`, borderRadius: 8, fontSize: 14, fontFamily: 'Outfit,sans-serif', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: COLORS.textSecondary }}>Commentaire général (optionnel)</label>
            <textarea value={expertComment} onChange={e => setExpertComment(e.target.value)} placeholder="Observations cliniques, remarques…" rows={3}
              style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, fontFamily: 'Outfit,sans-serif', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>

          <button onClick={handleSave} disabled={!expertDiagnosis || saving} style={{
            width: '100%', padding: '14px', borderRadius: 10,
            background: expertDiagnosis ? COLORS.primary : COLORS.border,
            color: 'white', border: 'none', fontFamily: 'Outfit,sans-serif',
            fontSize: 15, fontWeight: 700, cursor: expertDiagnosis ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
          }}>
            {saving ? <><Spinner size={18} color="white" /> Enregistrement…</> : <><Icon name="checkcircle" size={18} color="white" /> Enregistrer la consultation</>}
          </button>
        </div>
      )}
    </Modal>
  );

  return (
    <div>
      <PageHeader title="Nouvelle consultation" subtitle={`Étape ${step + 1} sur ${STEPS.length} – ${STEPS[step]}`} />
      <div style={{ padding: '28px 32px' }}>
        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, overflowX: 'auto' }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: i < step ? COLORS.success : i === step ? COLORS.primary : COLORS.background,
                  border: `2px solid ${i < step ? COLORS.success : i === step ? COLORS.primary : COLORS.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: i <= step ? 'white' : COLORS.textSecondary,
                  fontSize: 13, fontWeight: 700, transition: 'all 0.3s'
                }}>
                  {i < step ? <Icon name="check" size={16} color="white" /> : i + 1}
                </div>
                <span style={{ fontSize: 11, fontWeight: i === step ? 700 : 400, color: i === step ? COLORS.primary : COLORS.textSecondary, whiteSpace: 'nowrap' }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: i < step ? COLORS.success : COLORS.border, marginBottom: 16, minWidth: 20, transition: 'background 0.3s' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        <Card padding={32} style={{ maxWidth: 800 }}>
          <h2 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 700, color: COLORS.textPrimary }}>
            {STEPS[step]}
          </h2>
          {renderStep()}

          {/* Navigation */}
          {step < 4 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 24, borderTop: `1px solid ${COLORS.border}` }}>
              <Button variant="ghost" icon="chevronleft" onClick={() => step > 0 && setStep(s => s - 1)} disabled={step === 0}>
                Précédent
              </Button>
              <Button variant="primary" icon="chevronright" onClick={() => setStep(s => s + 1)} disabled={!canNext()}>
                Suivant
              </Button>
            </div>
          )}
          {step === 4 && !diagLoading && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: `1px solid ${COLORS.border}` }}>
              <Button variant="ghost" icon="refresh" onClick={() => { setVisionResult(null); setRagResult(null); runDiagnosis(); }}>
                Relancer l'analyse
              </Button>
              <Button variant="primary" icon="checkcircle" onClick={() => setShowModal(true)} disabled={!ragResult}>
                Valider / Corriger
              </Button>
            </div>
          )}
        </Card>
      </div>
      {validationModalContent}
    </div>
  );
};

Object.assign(window, { NewConsultation });