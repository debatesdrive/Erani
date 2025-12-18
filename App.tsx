import React, { createContext, useContext, useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { User, Stance, AppContextType, Topic } from './types';
import { auth, db } from './lib/firebase';
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
  const { user, loadingAuth } = useAppContext();
  if (loadingAuth) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-400">טוען...</div>;
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [selectedStance, setSelectedStance] = useState<Stance | null>(null);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Fetch full profile from Firestore
        const userRef = doc(db, 'users', fbUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUser({ ...userSnap.data(), uid: fbUser.uid } as User);
        }
      } else {
        setUser(null);
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setSelectedStance(null);
    setCurrentTopic(null);
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  const handleSetStance = (stance: Stance | null) => {
    setSelectedStance(stance);
  };

  const contextValue: AppContextType = {
    user,
    loadingAuth,
    login: handleLogin,
    logout: handleLogout,
    updateUser,
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
          <Route path="/lobby" element={<ProtectedRoute><Lobby /></ProtectedRoute>} />
          <Route path="/stance" element={<ProtectedRoute><StanceSelection /></ProtectedRoute>} />
          <Route path="/matching" element={<ProtectedRoute><Matching /></ProtectedRoute>} />
          <Route path="/call" element={<ProtectedRoute><Call /></ProtectedRoute>} />
          <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><CallHistory /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;