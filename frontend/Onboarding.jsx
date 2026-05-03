// KORAI ORL – Onboarding (3 slides)
// Requires: window.COLORS, window.Icon, window.Button

const Onboarding = ({ onDone }) => {
  const { COLORS, Icon, Button } = window;
  const [slide, setSlide] = React.useState(0);

  const slides = [
    {
      title: "Analyse otoscopique instantanée",
      desc: "Le modèle de vision classifie les pathologies ORL avec un score de confiance et un top‑3 des diagnostics probables.",
      accent: "#3B82F6",
      illustration: (
        <svg viewBox="0 0 320 260" width="300" height="240">
          {/* Ear canal cross-section */}
          <defs>
            <radialGradient id="tympan1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FCA5A5"/>
              <stop offset="60%" stopColor="#F87171"/>
              <stop offset="100%" stopColor="#DC2626"/>
            </radialGradient>
            <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0"/>
            </radialGradient>
          </defs>
          {/* Scanning rings */}
          <circle cx="160" cy="125" r="110" fill="none" stroke="#3B82F6" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="6 4"/>
          <circle cx="160" cy="125" r="90" fill="none" stroke="#3B82F6" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4 3"/>
          {/* Tympan */}
          <ellipse cx="160" cy="125" rx="70" ry="68" fill="url(#tympan1)" opacity="0.95"/>
          <ellipse cx="160" cy="125" rx="70" ry="68" fill="none" stroke="#fff" strokeWidth="2" strokeOpacity="0.3"/>
          {/* Light cone */}
          <ellipse cx="185" cy="148" rx="18" ry="14" fill="white" opacity="0.35" transform="rotate(-20, 185, 148)"/>
          <circle cx="160" cy="125" r="12" fill="none" stroke="#fff" strokeWidth="2" strokeOpacity="0.5"/>
          {/* Scan line */}
          <line x1="90" y1="125" x2="230" y2="125" stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.6" strokeDasharray="3 3"/>
          {/* AI confidence badge */}
          <rect x="190" y="55" width="115" height="42" rx="10" fill="#1E3A8A" opacity="0.92"/>
          <text x="247" y="72" textAnchor="middle" fill="#93C5FD" fontSize="10" fontFamily="Outfit,sans-serif">Otite moyenne aiguë</text>
          <rect x="200" y="78" width="75" height="7" rx="3" fill="#3B82F6" opacity="0.4"/>
          <rect x="200" y="78" width="62" height="7" rx="3" fill="#60A5FA"/>
          <text x="280" y="85" fill="#93C5FD" fontSize="9" fontFamily="Outfit,sans-serif">92%</text>
          {/* Corner brackets */}
          <path d="M100 65 L85 65 L85 80" fill="none" stroke="#60A5FA" strokeWidth="2"/>
          <path d="M220 65 L235 65 L235 80" fill="none" stroke="#60A5FA" strokeWidth="2"/>
          <path d="M100 185 L85 185 L85 170" fill="none" stroke="#60A5FA" strokeWidth="2"/>
          <path d="M220 185 L235 185 L235 170" fill="none" stroke="#60A5FA" strokeWidth="2"/>
          {/* Dots */}
          <circle cx="92" cy="125" r="3" fill="#60A5FA"/>
          <circle cx="228" cy="125" r="3" fill="#60A5FA"/>
        </svg>
      )
    },
    {
      title: "Base de connaissances ORL",
      desc: "L'assistant RAG génère un résumé structuré à partir des symptômes saisis, ancré dans la littérature médicale ORL.",
      accent: "#10B981",
      illustration: (
        <svg viewBox="0 0 320 260" width="300" height="240">
          <defs>
            <linearGradient id="chatBg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ECFDF5"/>
              <stop offset="100%" stopColor="#D1FAE5"/>
            </linearGradient>
          </defs>
          {/* Chat window */}
          <rect x="30" y="20" width="260" height="220" rx="14" fill="white" stroke="#E5E7EB" strokeWidth="1.5"/>
          {/* Header */}
          <rect x="30" y="20" width="260" height="44" rx="14" fill="#065F46"/>
          <rect x="30" y="50" width="260" height="14" fill="#065F46"/>
          <circle cx="57" cy="42" r="12" fill="#10B981"/>
          <text x="57" y="46" textAnchor="middle" fill="white" fontSize="10" fontFamily="Outfit,sans-serif" fontWeight="700">IA</text>
          <text x="78" y="38" fill="white" fontSize="11" fontFamily="Outfit,sans-serif" fontWeight="600">Assistant ORL – RAG</text>
          <text x="78" y="50" fill="#6EE7B7" fontSize="9" fontFamily="Outfit,sans-serif">En ligne · Base Chroma</text>
          {/* User message */}
          <rect x="140" y="80" width="130" height="30" rx="10" rx="10" fill="#10B981" opacity="0.15"/>
          <text x="150" y="98" fill="#065F46" fontSize="9.5" fontFamily="Outfit,sans-serif">Signes d'un cholestéatome ?</text>
          {/* AI response */}
          <rect x="40" y="122" width="190" height="72" rx="10" fill="#F0FDF4" stroke="#D1FAE5" strokeWidth="1"/>
          <text x="52" y="138" fill="#065F46" fontSize="8.5" fontFamily="Outfit,sans-serif" fontWeight="700">1. Causes probables</text>
          <text x="52" y="151" fill="#374151" fontSize="8" fontFamily="Outfit,sans-serif">Épithélium kératinisant destructeur…</text>
          <text x="52" y="163" fill="#065F46" fontSize="8.5" fontFamily="Outfit,sans-serif" fontWeight="700">2. Signes associés</text>
          <text x="52" y="176" fill="#374151" fontSize="8" fontFamily="Outfit,sans-serif">Otorrhée fétide, hypoacousie…</text>
          <text x="52" y="188" fill="#374151" fontSize="8" fontFamily="Outfit,sans-serif">3. Scanner : érosion ossiculaire.</text>
          {/* Source badge */}
          <rect x="40" y="202" width="90" height="20" rx="6" fill="#D1FAE5"/>
          <text x="50" y="215" fill="#065F46" fontSize="8" fontFamily="Outfit,sans-serif">📎 3 sources Chroma</text>
          {/* Typing indicator */}
          <circle cx="155" cy="225" r="3.5" fill="#10B981" opacity="0.5"/>
          <circle cx="165" cy="225" r="3.5" fill="#10B981" opacity="0.7"/>
          <circle cx="175" cy="225" r="3.5" fill="#10B981"/>
        </svg>
      )
    },
    {
      title: "Validation en un clic",
      desc: "Consultez vision IA et RAG côte à côte, validez ou corrigez les diagnostics, et contribuez à l'amélioration du modèle.",
      accent: "#F59E0B",
      illustration: (
        <svg viewBox="0 0 320 260" width="300" height="240">
          {/* Left card – Vision */}
          <rect x="15" y="30" width="130" height="155" rx="12" fill="white" stroke="#E5E7EB" strokeWidth="1.5"/>
          <rect x="15" y="30" width="130" height="38" rx="12" fill="#1E3A8A"/>
          <rect x="15" y="55" width="130" height="13" fill="#1E3A8A"/>
          <text x="80" y="50" textAnchor="middle" fill="white" fontSize="10" fontFamily="Outfit,sans-serif" fontWeight="700">Vision IA</text>
          {/* Otoscope image placeholder */}
          <circle cx="80" cy="105" r="35" fill="#FEE2E2"/>
          <ellipse cx="80" cy="105" rx="28" ry="27" fill="#FECACA"/>
          <ellipse cx="92" cy="115" rx="9" ry="7" fill="white" opacity="0.3" transform="rotate(-20,92,115)"/>
          <text x="80" y="150" textAnchor="middle" fill="#1E40AF" fontSize="9" fontFamily="Outfit,sans-serif" fontWeight="700">Otite moyenne aiguë</text>
          {/* Confidence bar */}
          <rect x="28" y="158" width="104" height="5" rx="2" fill="#E5E7EB"/>
          <rect x="28" y="158" width="88" height="5" rx="2" fill="#3B82F6"/>
          <text x="136" y="163" fill="#1E40AF" fontSize="8" fontFamily="Outfit,sans-serif">92%</text>
          {/* Validated badge */}
          <rect x="28" y="170" width="56" height="16" rx="8" fill="#DCFCE7"/>
          <text x="56" y="181" textAnchor="middle" fill="#16A34A" fontSize="8" fontFamily="Outfit,sans-serif" fontWeight="700">✓ Validé</text>
          {/* Right card – RAG */}
          <rect x="175" y="30" width="130" height="155" rx="12" fill="white" stroke="#E5E7EB" strokeWidth="1.5"/>
          <rect x="175" y="30" width="130" height="38" rx="12" fill="#065F46"/>
          <rect x="175" y="55" width="130" height="13" fill="#065F46"/>
          <text x="240" y="50" textAnchor="middle" fill="white" fontSize="10" fontFamily="Outfit,sans-serif" fontWeight="700">Analyse RAG</text>
          <text x="185" y="82" fill="#374151" fontSize="7.5" fontFamily="Outfit,sans-serif" fontWeight="600">Causes probables</text>
          <text x="185" y="93" fill="#6B7280" fontSize="7" fontFamily="Outfit,sans-serif">Infection bactérienne aiguë…</text>
          <line x1="185" y1="99" x2="295" y2="99" stroke="#E5E7EB" strokeWidth="1"/>
          <text x="185" y="111" fill="#374151" fontSize="7.5" fontFamily="Outfit,sans-serif" fontWeight="600">Signes associés</text>
          <text x="185" y="122" fill="#6B7280" fontSize="7" fontFamily="Outfit,sans-serif">Otalgie, fièvre, otorrhée…</text>
          <line x1="185" y1="128" x2="295" y2="128" stroke="#E5E7EB" strokeWidth="1"/>
          <text x="185" y="140" fill="#374151" fontSize="7.5" fontFamily="Outfit,sans-serif" fontWeight="600">Conduite à tenir</text>
          <text x="185" y="151" fill="#6B7280" fontSize="7" fontFamily="Outfit,sans-serif">Antibiothérapie per os…</text>
          <rect x="188" y="170" width="56" height="16" rx="8" fill="#DCFCE7"/>
          <text x="216" y="181" textAnchor="middle" fill="#16A34A" fontSize="8" fontFamily="Outfit,sans-serif" fontWeight="700">✓ Validé</text>
          {/* Bottom validate button */}
          <rect x="75" y="200" width="170" height="38" rx="10" fill="#1E40AF"/>
          <text x="160" y="224" textAnchor="middle" fill="white" fontSize="11" fontFamily="Outfit,sans-serif" fontWeight="700">Valider / Corriger →</text>
        </svg>
      )
    }
  ];

  const current = slides[slide];

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: `linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #1E40AF 100%)`,
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'Outfit, sans-serif',
    padding: 24,
  };

  return (
    <div style={containerStyle}>
      {/* Background decoration */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)' }} />
      </div>

      {/* Skip button */}
      <button onClick={onDone} style={{
        position: 'absolute', top: 24, right: 24,
        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
        color: 'rgba(255,255,255,0.8)', padding: '8px 18px',
        borderRadius: 20, fontSize: 13, fontFamily: 'Outfit,sans-serif',
        cursor: 'pointer', fontWeight: 500
      }}>
        Passer
      </button>

      {/* Logo */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 4 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
            <Icon name="activity" size={22} color="white" />
          </div>
          <span style={{ fontSize: 26, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>KORAI</span>
        </div>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Système d'aide au diagnostic ORL</span>
      </div>

      {/* Slide card */}
      <div style={{
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 24,
        padding: '40px 48px',
        maxWidth: 780,
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 48,
      }}>
        {/* Text side */}
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: current.accent + '25',
            border: `1px solid ${current.accent}50`,
            borderRadius: 20, padding: '4px 14px',
            marginBottom: 20
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: current.accent }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: current.accent, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {slide + 1} / {slides.length}
            </span>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', margin: '0 0 16px', lineHeight: 1.2, letterSpacing: '-0.3px' }}>
            {current.title}
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', margin: '0 0 36px', lineHeight: 1.6 }}>
            {current.desc}
          </p>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {slide > 0 && (
              <button onClick={() => setSlide(s => s - 1)} style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white', padding: '11px 22px',
                borderRadius: 10, fontFamily: 'Outfit,sans-serif',
                fontSize: 14, fontWeight: 600, cursor: 'pointer'
              }}>
                Précédent
              </button>
            )}
            {slide < slides.length - 1 ? (
              <button onClick={() => setSlide(s => s + 1)} style={{
                background: current.accent,
                border: 'none', color: 'white',
                padding: '11px 28px', borderRadius: 10,
                fontFamily: 'Outfit,sans-serif', fontSize: 14,
                fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                Suivant <Icon name="chevronright" size={16} color="white" />
              </button>
            ) : (
              <button onClick={onDone} style={{
                background: current.accent,
                border: 'none', color: 'white',
                padding: '11px 28px', borderRadius: 10,
                fontFamily: 'Outfit,sans-serif', fontSize: 14,
                fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                Commencer <Icon name="arrowright" size={16} color="white" />
              </button>
            )}
          </div>
        </div>

        {/* Illustration side */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {current.illustration}
        </div>
      </div>

      {/* Dots indicator */}
      <div style={{ display: 'flex', gap: 8, marginTop: 28 }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => setSlide(i)} style={{
            width: i === slide ? 24 : 8, height: 8,
            borderRadius: 99, border: 'none',
            background: i === slide ? 'white' : 'rgba(255,255,255,0.3)',
            cursor: 'pointer', transition: 'all 0.25s ease', padding: 0
          }} />
        ))}
      </div>
    </div>
  );
};

Object.assign(window, { Onboarding });
