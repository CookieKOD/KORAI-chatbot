// KORAI ORL – Chatbot RAG style ChatGPT (sobre, médical, sans emojis)

const QUICK_QUESTIONS = [
  'Signes cliniques d\'un cholestéatome ?',
  'Conduite face à une perforation tympanique',
  'Différence otite externe vs otite moyenne',
  'Traitement de l\'otomycose',
];

const Chatbot = () => {
  const { COLORS, Icon, Spinner, PageHeader } = window;

  const [messages, setMessages] = React.useState([
    {
      id: 'init',
      role: 'assistant',
      text: 'Bonjour. Je suis l\'assistant ORL KORAI, alimenté par la base de connaissances médicales (Mistral + Chroma).\n\nPosez-moi vos questions sur les pathologies ORL, les traitements ou la conduite à tenir. Je vous fournirai des résumés cliniques structurés avec sources.',
      time: now(),
    }
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [convId, setConvId] = React.useState(null);
  const [showSources, setShowSources] = React.useState({});
  const [apiError, setApiError] = React.useState(false);

  const scrollRef = React.useRef();
  const inputRef = React.useRef();

  // Auto-scroll vers le bas quand un nouveau message arrive
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Auto-resize du textarea selon contenu
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

  const sendMessage = async (textOverride) => {
    const q = (textOverride || input).trim();
    if (!q || loading) return;
    setInput('');
    setApiError(false);

    const userMsg = { id: Date.now(), role: 'user', text: q, time: now() };
    setMessages(m => [...m, userMsg]);
    setLoading(true);

    try {
      const res = await window.API.chat(q, true, convId);
      if (!convId && res.conversation_id) setConvId(res.conversation_id);

      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        text: res.response,
        sources: res.sources || [],
        time: now(),
      };
      setMessages(m => [...m, aiMsg]);
    } catch (err) {
      console.error('Erreur chatbot:', err);
      setApiError(true);
      setMessages(m => [...m, {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'Désolé, je n\'arrive pas à joindre la base de connaissances pour le moment. Veuillez réessayer dans un instant.',
        time: now(),
        isError: true,
      }]);
    }

    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleNewChat = () => {
    if (loading) return;
    if (messages.length > 1 && !window.confirm('Démarrer une nouvelle conversation ? L\'historique de cet écran sera effacé.')) return;
    setMessages([{
      id: 'init',
      role: 'assistant',
      text: 'Nouvelle conversation. Posez-moi votre question ORL.',
      time: now(),
    }]);
    setConvId(null);
    setShowSources({});
    setApiError(false);
  };

  const toggleSources = (id) => setShowSources(s => ({ ...s, [id]: !s[id] }));

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title="Assistant ORL"
        subtitle="Base de connaissances médicales · Mistral + Chroma"
        actions={
          <button onClick={handleNewChat} disabled={loading} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 8,
            border: `1.5px solid ${COLORS.primary}`,
            background: '#fff', color: COLORS.primary,
            fontSize: 13, fontWeight: 600, fontFamily: 'Outfit,sans-serif',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
          }}>
            <Icon name="plus" size={14} color={COLORS.primary} />
            Nouvelle conversation
          </button>
        }
      />

      {/* Zone de messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 0',
          background: COLORS.background,
        }}
      >
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>
          {messages.map(msg => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              colors={COLORS}
              showSources={showSources[msg.id]}
              onToggleSources={() => toggleSources(msg.id)}
            />
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <Avatar role="assistant" colors={COLORS} />
              <div style={{
                background: '#fff',
                borderRadius: 12,
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                border: `1px solid ${COLORS.border}`,
              }}>
                <TypingDots color={COLORS.textSecondary} />
                <span style={{ fontSize: 13, color: COLORS.textSecondary }}>L'assistant rédige...</span>
              </div>
            </div>
          )}

          {/* Suggestions au démarrage */}
          {messages.length === 1 && !loading && (
            <div style={{ marginTop: 24 }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: COLORS.textSecondary,
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10
              }}>
                Suggestions
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {QUICK_QUESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    style={{
                      textAlign: 'left',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: `1px solid ${COLORS.border}`,
                      background: '#fff',
                      color: COLORS.textPrimary,
                      fontSize: 13,
                      fontFamily: 'Outfit,sans-serif',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = COLORS.primary;
                      e.currentTarget.style.background = COLORS.primary + '06';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = COLORS.border;
                      e.currentTarget.style.background = '#fff';
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bandeau erreur API */}
      {apiError && (
        <div style={{
          background: COLORS.danger + '10',
          borderTop: `1px solid ${COLORS.danger}30`,
          padding: '8px 24px',
          fontSize: 12,
          color: COLORS.danger,
          textAlign: 'center',
        }}>
          Connexion au backend indisponible. Vérifiez que le serveur est lancé.
        </div>
      )}

      {/* Zone de saisie */}
      <div style={{
        background: '#fff',
        borderTop: `1px solid ${COLORS.border}`,
        padding: '16px 24px',
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 10,
            background: COLORS.background,
            border: `1.5px solid ${COLORS.border}`,
            borderRadius: 14,
            padding: '10px 12px',
            transition: 'border-color 0.15s',
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Posez votre question médicale ORL..."
              rows={1}
              disabled={loading}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontFamily: 'Outfit,sans-serif',
                fontSize: 14,
                lineHeight: 1.5,
                color: COLORS.textPrimary,
                resize: 'none',
                padding: '6px 4px',
                maxHeight: 160,
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{
                width: 36, height: 36, borderRadius: 10,
                border: 'none',
                background: input.trim() && !loading ? COLORS.primary : COLORS.border,
                color: '#fff',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.15s',
              }}
              title="Envoyer (Entrée)"
            >
              {loading
                ? <Spinner size={16} color="#fff" />
                : <Icon name="send" size={16} color="#fff" />}
            </button>
          </div>
          <p style={{
            margin: '8px 4px 0',
            fontSize: 11,
            color: COLORS.textSecondary,
            textAlign: 'center',
          }}>
            L'assistant peut faire des erreurs. Vérifiez les informations critiques avec un confrère.
          </p>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// SOUS-COMPOSANTS
// =============================================================================

const MessageBubble = ({ msg, colors, showSources, onToggleSources }) => {
  const isUser = msg.role === 'user';
  const isError = msg.isError;

  return (
    <div style={{
      display: 'flex',
      gap: 12,
      marginBottom: 20,
      flexDirection: isUser ? 'row-reverse' : 'row',
    }}>
      <Avatar role={msg.role} colors={colors} />
      <div style={{
        maxWidth: '78%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
      }}>
        <div style={{
          background: isUser ? colors.primary : (isError ? colors.danger + '08' : '#fff'),
          color: isUser ? '#fff' : (isError ? colors.danger : colors.textPrimary),
          padding: '12px 16px',
          borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
          fontSize: 14,
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          border: isUser ? 'none' : `1px solid ${isError ? colors.danger + '40' : colors.border}`,
          boxShadow: isUser ? 'none' : '0 1px 2px rgba(0,0,0,0.04)',
        }}>
          {formatText(msg.text, colors, isUser)}
        </div>

        <div style={{
          fontSize: 11,
          color: colors.textSecondary,
          marginTop: 4,
          padding: '0 4px',
        }}>
          {msg.time}
        </div>

        {/* Sources (uniquement assistant) */}
        {!isUser && msg.sources && msg.sources.length > 0 && (
          <div style={{ width: '100%', marginTop: 8 }}>
            <button
              onClick={onToggleSources}
              style={{
                background: 'none',
                border: 'none',
                color: colors.secondary,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'Outfit,sans-serif',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <window.Icon
                name={showSources ? 'chevronleft' : 'chevronright'}
                size={12}
                color={colors.secondary}
              />
              {showSources ? 'Masquer' : 'Afficher'} les sources ({msg.sources.length})
            </button>
            {showSources && (
              <div style={{ marginTop: 8 }}>
                {msg.sources.map((s, i) => (
                  <div key={i} style={{
                    padding: '10px 12px',
                    background: '#fff',
                    borderRadius: 8,
                    marginBottom: 6,
                    border: `1px solid ${colors.border}`,
                    fontSize: 12,
                  }}>
                    <div style={{ fontWeight: 600, color: colors.textPrimary, marginBottom: 4 }}>
                      {s.source}{s.page ? ` · page ${s.page}` : ''}
                    </div>
                    <div style={{ color: colors.textSecondary, lineHeight: 1.5 }}>
                      {s.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Avatar = ({ role, colors }) => {
  const isUser = role === 'user';
  return (
    <div style={{
      width: 32,
      height: 32,
      borderRadius: 8,
      flexShrink: 0,
      background: isUser ? colors.primary : colors.success + '15',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <window.Icon
        name={isUser ? 'user' : 'message'}
        size={16}
        color={isUser ? '#fff' : colors.success}
      />
    </div>
  );
};

const TypingDots = ({ color }) => (
  <div style={{ display: 'flex', gap: 4 }}>
    {[0, 1, 2].map(i => (
      <div
        key={i}
        style={{
          width: 6, height: 6, borderRadius: '50%',
          background: color,
          opacity: 0.5,
          animation: `korai-typing-dot 1.4s infinite ${i * 0.2}s`,
        }}
      />
    ))}
    <style>{`
      @keyframes korai-typing-dot {
        0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
        30% { opacity: 1; transform: translateY(-3px); }
      }
    `}</style>
  </div>
);

// Met en évidence les en-têtes "1. xxx", "2. xxx", "3. xxx" dans les réponses assistant
const formatText = (text, colors, isUser) => {
  if (!text) return null;
  if (isUser) return text;
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const headerMatch = line.match(/^\s*(\d+)[.)]\s*(.+)$/);
    if (headerMatch) {
      return (
        <div key={i} style={{
          fontWeight: 700,
          color: colors.primary,
          marginTop: i > 0 ? 10 : 0,
          marginBottom: 2,
        }}>
          {headerMatch[1]}. {headerMatch[2]}
        </div>
      );
    }
    return line ? <div key={i}>{line}</div> : <div key={i} style={{ height: 6 }} />;
  });
};

const now = () => new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

Object.assign(window, { Chatbot });