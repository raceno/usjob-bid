import { Link, Route, Routes, useLocation, useNavigate, Navigate } from 'react-router-dom';
import JobDataPage from './pages/JobDataPage.tsx';
import SettingsPage from './pages/SettingsPage.tsx';
import ActionPage from './pages/ActionPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import SignUpPage from './pages/SignUpPage.tsx';
import { useAuth } from './AuthContext.tsx';
import './App.css';

const Nav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const isActive = (path: string) =>
    location.pathname === path ? 'nav-link nav-link-active' : 'nav-link';

  return (
    <header className="app-header">
      <div className="app-header-left">
        <span className="app-logo">Stay hungry, Stay foolish</span>
      </div>
      <nav className="app-nav">
        {token ? (
          <>
            <Link to="/" className={isActive('/')}>              
              Jobs
            </Link>
            <Link to="/settings" className={isActive('/settings')}>
              Settings
            </Link>
            <Link to="/action" className={isActive('/action')}>
              Action
            </Link>
            <button
              className="nav-link"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              style={{border:'none',background:'transparent',cursor:'pointer'}}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={isActive('/login')}>
              Log in
            </Link>
            <Link to="/signup" className={isActive('/signup')}>
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <div className="app-root">
      <Nav />
      <main className="app-main">
        <Routes>
          <Route
            path="/"
            element={<RequireAuth><JobDataPage /></RequireAuth>}
          />
          <Route
            path="/settings"
            element={<RequireAuth><SettingsPage /></RequireAuth>}
          />
          <Route
            path="/action"
            element={<RequireAuth><ActionPage /></RequireAuth>}
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
