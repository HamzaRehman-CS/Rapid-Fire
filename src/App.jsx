import { useEffect, useState } from 'react';
import Landing from './components/Landing';
import PlayerSetup from './components/PlayerSetup';
import Quiz from './components/Quiz';
import Result from './components/Result';
import Leaderboard from './components/Leaderboard';
import BrandBar from './components/BrandBar';
import AdminLogin from './components/AdminLogin';
import AdminSettingsModal from './components/AdminSettingsModal';

function App() {
  // Determine if path is /game or /admin vs public root /
  const getInitialRoute = () => {
    const path = window.location.pathname.toLowerCase();
    return (path === '/game' || path === '/admin') ? 'game' : 'public';
  };

  const [route, setRoute] = useState(getInitialRoute);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem('rapid_fire_admin_auth') === 'true';
  });

  // Game station internal screens: 'landing' | 'setup' | 'quiz' | 'result'
  const [gameScreen, setGameScreen] = useState('landing');
  const [playerInfo, setPlayerInfo] = useState({ name: '', universityId: '', number: '' });
  const [quizStats, setQuizStats] = useState(null);
  const [attemptId, setAttemptId] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setRoute(getInitialRoute());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route, gameScreen]);

  const navigateRoute = (newRoute) => {
    const targetPath = newRoute === 'game' ? '/game' : '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    setRoute(newRoute);
  };

  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setGameScreen('landing');
  };

  const handleEndGame = () => {
    sessionStorage.removeItem('rapid_fire_admin_auth');
    sessionStorage.removeItem('rapid_fire_admin_id');
    setIsAdminAuthenticated(false);
    setIsSettingsOpen(false);
    setGameScreen('landing');
    setPlayerInfo({ name: '', universityId: '', number: '' });
    setQuizStats(null);
    navigateRoute('public');
  };

  const startQuiz = (info) => {
    setPlayerInfo(info);
    setAttemptId(crypto.randomUUID());
    setGameScreen('quiz');
  };

  const endQuiz = (stats) => {
    setQuizStats(stats);
    setGameScreen('result');
  };

  // 1. PUBLIC VIEW: Shows the Live Leaderboard only (no coordinator button)
  if (route === 'public') {
    return (
      <div className="site-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <BrandBar />
        <Leaderboard />
      </div>
    );
  }

  // 2. GAME / ADMIN ROUTE:
  // If not logged in, show Coordinator Login
  if (!isAdminAuthenticated) {
    return (
      <AdminLogin
        onLoginSuccess={handleLoginSuccess}
        onCancel={() => navigateRoute('public')}
      />
    );
  }

  // If logged in, show the Game Station
  return (
    <div className="site-wrapper game-station" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <BrandBar
        isAdmin={true}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {gameScreen === 'landing' && (
        <Landing
          onStart={() => setGameScreen('setup')}
        />
      )}

      {gameScreen === 'setup' && (
        <PlayerSetup
          onReady={startQuiz}
          onBack={() => setGameScreen('landing')}
        />
      )}

      {gameScreen === 'quiz' && (
        <Quiz
          onTimeUp={endQuiz}
          onCancel={() => setGameScreen('landing')}
        />
      )}

      {gameScreen === 'result' && (
        <Result
          stats={quizStats}
          player={playerInfo}
          attemptId={attemptId}
          onNext={() => setGameScreen('setup')}
        />
      )}

      <AdminSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onEndGame={handleEndGame}
      />
    </div>
  );
}

export default App;
