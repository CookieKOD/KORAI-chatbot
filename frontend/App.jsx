// KORAI ORL – App root component

const App = () => {
  const [screen, setScreen]   = React.useState('onboarding'); // onboarding | login | app
  const [route, setRoute]     = React.useState('dashboard');
  const [user, setUser]       = React.useState(null);
  const [consultations, setConsultations] = React.useState(() => window.Storage.getConsultations());
  const [selectedCase, setSelectedCase]   = React.useState(null);

  const handleLogin = (u) => { setUser(u); setScreen('app'); };
  const handleLogout = () => { setUser(null); setScreen('login'); setRoute('dashboard'); };

  const navigate = (r) => {
    setRoute(r);
    if (r !== 'case') setSelectedCase(null);
  };

  if (screen === 'onboarding') return <Onboarding onDone={() => setScreen('login')} />;
  if (screen === 'login')      return <Login onLogin={handleLogin} />;

  return (
    <Layout user={user} route={route} onNavigate={navigate} onLogout={handleLogout}>
      {route === 'dashboard' && (
        <Dashboard consultations={consultations} onNavigate={navigate} />
      )}
      {route === 'new-consultation' && (
        <NewConsultation
          consultations={consultations}
          setConsultations={setConsultations}
          onDone={() => navigate('reports')}
        />
      )}
      {route === 'reports' && (
        <Reports
          consultations={consultations}
          onCaseSelect={(c) => { setSelectedCase(c); navigate('case'); }}
        />
      )}
      {route === 'case' && (
        <CaseDetail
          cas={selectedCase}
          onBack={() => navigate('reports')}
        />
      )}
      {route === 'chatbot' && <Chatbot />}
      {route === 'profile' && (
        <Profile user={user} consultations={consultations} />
      )}
    </Layout>
  );
};

// Mount
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
