// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  updatePassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile as firestoreUpdateProfile,
  UserProfile
} from '../firebase/firestore';

// --- Étend UserProfile avec l'ID et l'email ---
export interface AuthUser extends UserProfile {
  id: string;
  email?: string;
}

// --- Interface pour le contexte d'authentification ---
interface AuthContextProps {
  user: AuthUser | null;
  isPremium: boolean;
  login(email: string, password: string): Promise<void>;
  signup(name: string, userName: string, email: string, password: string): Promise<void>;
  updateUserProfile(uid: string, profile: Partial<UserProfile>): Promise<void>;
  logout(): Promise<void>;
  upgradeToPremium(): Promise<void>;
  changePassword(oldPwd: string, newPwd: string): Promise<void>;
}

// Contexte initial vide pour typage
const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  // Connexion (firebase auth + récupération du profil Firestore)
  const login = async (email: string, password: string) => {
    const { user: fbUser } = await signInWithEmailAndPassword(auth, email, password);
    if (!fbUser.emailVerified) {
      // déconnecte et refuse la connexion
      await signOut(auth);
      throw { code: 'auth/email-not-verified' };
    }
    const profile = await getUserProfile(fbUser.uid);
    setUser({
      id: fbUser.uid,
      email: fbUser.email || undefined,
      name: profile?.name || fbUser.displayName || '',
      userName: profile?.userName || '',
      avatar: profile?.avatar,
      numberTel: profile?.numberTel,
      contry: profile?.contry
    });
  };

  // Inscription (firebase auth + création du document Firestore)
  const signup = async (name: string, userName: string, email: string, password: string) => {
    const { user: fbUser } = await createUserWithEmailAndPassword(auth, email, password);
    // Mettre displayName dans l'objet Auth
    await updateProfile(fbUser, { displayName: name });
    // Crée le profil dans Firestore avec l'UID comme clé
    await createUserProfile(fbUser.uid, { name, userName, email });
    //setUser({ id: fbUser.uid, name, userName, email, avatar: '', numberTel: '', contry: '' });

    // Envoi de l’email de vérification
    await sendEmailVerification(fbUser);
  };

  // Déconnexion
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setIsPremium(false);
  };

  // Passage en Premium (placeholder)
  const upgradeToPremium = async () => setIsPremium(true);

  // Changement de mot de passe (ré-authentification)
  const changePassword = async (oldPwd: string, newPwd: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) throw new Error('Utilisateur non connecté');
    await signInWithEmailAndPassword(auth, currentUser.email, oldPwd);
    await updatePassword(currentUser, newPwd);
  };

  // Mise à jour du profil dans Firestore + contexte
  const updateUserProfile = async (uid: string, profile: Partial<UserProfile>) => {
    await firestoreUpdateProfile(uid, profile);
    setUser(prev => prev ? ({ ...prev, ...profile } as AuthUser) : prev);
  };
  

  // Écoute les changements d'état Auth pour synchroniser le context
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async fbUser => {
      if (fbUser) {
        const profile = await getUserProfile(fbUser.uid);
        setUser({
          id: fbUser.uid,
          email: fbUser.email || undefined,
          name: profile?.name || fbUser.displayName || '',
          userName: profile?.userName || '',
          avatar: profile?.avatar,
          numberTel: profile?.numberTel,
          contry: profile?.contry
        });
      } else {
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, isPremium, login, signup, updateUserProfile, logout, upgradeToPremium, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook pour accéder au contexte
export const useAuth = () => useContext(AuthContext);
