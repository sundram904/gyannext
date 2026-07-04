import { createContext, useContext, useEffect, useState } from 'react';
import { subscribeToAuth, getUserProfile, logout as fbLogout } from '../firebase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // Firebase auth user
  const [profile, setProfile] = useState(null); // Firestore users/{uid} doc (has `role`)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAuth(async (fbUser) => {
      setLoading(true);
      if (fbUser) {
        setUser(fbUser);
        try {
          const p = await getUserProfile(fbUser.uid);
          setProfile(p);
        } catch {
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const logout = async () => {
    await fbLogout();
    setUser(null);
    setProfile(null);
  };

  const role = profile?.role || null;

  return (
    <AuthContext.Provider value={{ user, profile, role, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
