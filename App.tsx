
import React, { createContext, useContext, useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User, Stance, AppContextType, Topic } from './types';
import Login from './pages/Login';
import Lobby from './pages/Lobby';
import StanceSelection from './pages/StanceSelection';
import Matching from './pages/Matching';
import Call from './pages/Call';
import Feedback from './pages/Feedback';
import Profile from './pages/Profile';
import CallHistory from './pages/CallHistory';

// Context Setup
const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAppContext();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [selectedStance, setSelectedStance] = useState<Stance | null>(null);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);

  // Initialize
  useEffect(() => {
    // Load user from local storage
    const storedUser = localStorage.getItem('erani_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Handlers
  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('erani_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('erani_user');
    setSelectedStance(null);
    setCurrentTopic(null);
  };

  const handleSetStance = (stance: Stance | null) => {
    setSelectedStance(stance);
  };

  const contextValue: AppContextType = {
    user,
    login: handleLogin,
    logout: handleLogout,
    selectedStance,
    setStance: handleSetStance,
    currentTopic,
    setCurrentTopic,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/lobby"
            element={
              <ProtectedRoute>
                <Lobby />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stance"
            element={
              <ProtectedRoute>
                <StanceSelection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matching"
            element={
              <ProtectedRoute>
                <Matching />
              </ProtectedRoute>
            }
          />
          <Route
            path="/call"
            element={
              <ProtectedRoute>
                <Call />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <ProtectedRoute>
                <Feedback />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <CallHistory />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;
