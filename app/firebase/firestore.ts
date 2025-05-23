// src/firebase/firestore.ts
// Service Firestore pour gérer Profils, Budgets, Transactions et Catégories

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from './index';

// --- Profils utilisateur --------------------------------------------------

export interface UserProfile {
  name: string;
  userName: string;
  email?: string;
  avatar?: string;
  numberTel?: string;
  contry?: string;
  createdAt?: Timestamp;
}

export const createUserProfile = async (uid: string, profile: UserProfile) => {
  await setDoc(doc(db, 'users', uid), {
    ...profile,
    createdAt: Timestamp.now()
  });
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
};

export const updateUserProfile = async (uid: string, profile: Partial<UserProfile>) => {
  await updateDoc(doc(db, 'users', uid), profile);
};

// --- Budgets --------------------------------------------------------------

export interface Budget {
  id?: string;
  categoryId: string;   // <-- nouveau champ optionnel
  userId: string;
  limit: number;
  spent: number;
  month: number;          // 0 = Janvier … 11 = Décembre
  year: number;
  createdAt?: Timestamp;
}

const budgetsCol = collection(db, 'budgets');

/**
 * Ajoute un nouveau budget (pour un mois donné)
 */
export const addBudget = async (
  budget: Omit<Budget, 'id' | 'createdAt'>
) => {
  await addDoc(budgetsCol, {
    ...budget,
    createdAt: Timestamp.now()
  });
};

/**
 * Récupère les budgets d'un utilisateur pour un mois et une année précise
 */
export const getBudgetsByUserAndMonth = async (
  userId: string,
  month: number,
  year: number
): Promise<Budget[]> => {
  const q = query(
    budgetsCol,
    where('userId', '==', userId),
    where('month', '==', month),
    where('year', '==', year)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Budget) }));
};

/**
 * Met à jour un budget existant (y compris son categoryId si besoin)
 */
export const updateBudget = async (id: string, data: Partial<Budget>) => {
  const ref = doc(db, 'budgets', id);
  await updateDoc(ref, data);
};

/**
 * Supprime un budget
 */
export const deleteBudget = async (id: string) => {
  const ref = doc(db, 'budgets', id);
  await deleteDoc(ref);
};

// --- Transactions (Dépenses)---------------------------------------------------------

export interface Transaction {
  id?: string;
  userId: string;
  budgetId: string;
  label: string;
  amount: number;
  createdAt: Timestamp;
}

const transactionsCol = collection(db, 'transactions');

/**
 * Ajoute une nouvelle transaction pour un utilisateur / budget
 */
export const addTransaction = async (
  tx: Omit<Transaction, 'id' | 'createdAt'>
) => {
  await addDoc(transactionsCol, {
    ...tx,
    createdAt: Timestamp.now()
  });
};

/**
 * Récupère les transactions d’un utilisateur
 */
export const getTransactionsByUser = async (
  userId: string
): Promise<Transaction[]> => {
  const q = query(transactionsCol, where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    id: d.id,
    ...(d.data() as Transaction)
  }));
};

// --- Incomes (Revenus) ----------------------------------------------------
export interface Income {
  id?: string;
  userId: string;
  label: string;
  amount: number;      // toujours positif
  createdAt?: Timestamp;
}
const incomesCol = collection(db, 'incomes');
export const addIncome = async (inc: Omit<Income, 'id' | 'createdAt'>) => {
  await addDoc(incomesCol, { ...inc, createdAt: Timestamp.now() });
};
export const getIncomesByUser = async (userId: string): Promise<Income[]> => {
  const q = query(incomesCol, where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Income) }));
};

// --- Monthly Incomes -------------------------------------------------------
export interface MonthlyIncome {
  id?: string;
  userId: string;
  month: number;  // 0=Jan…11=Déc
  year: number;
  total: number;
  updatedAt?: Timestamp;
}

const monthlyIncomesCol = collection(db, 'monthlyIncomes');

/** Récupère le doc des revenus d’un user pour un mois+année, ou null */
export const getMonthlyIncome = async (
  userId: string,
  month: number,
  year: number
): Promise<MonthlyIncome | null> => {
  const q = query(
    monthlyIncomesCol,
    where('userId', '==', userId),
    where('month', '==', month),
    where('year', '==', year)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...(d.data() as MonthlyIncome) };
};

/** Crée un doc de revenus mensuels */
export const addMonthlyIncome = async (mi: Omit<MonthlyIncome, 'id' | 'updatedAt'>) => {
  await addDoc(monthlyIncomesCol, {
    ...mi,
    updatedAt: Timestamp.now()
  });
};

/** Mets à jour le total des revenus mensuels */
export const updateMonthlyIncome = async (id: string, data: Partial<MonthlyIncome>) => {
  const ref = doc(db, 'monthlyIncomes', id);
  await updateDoc(ref, {
    ...data,
    updatedAt: Timestamp.now()
  });
};



// --- Catégories -----------------------------------------------------------

export interface Category {
  id?: string;
  userId: string;
  name: string;
  icone: 'Alimentation' | 'Transport' | 'Shopping' | 'Divertissement' |'Sante'|'Loisirs';
  createdAt?: Timestamp;
}

const categoriesCol = collection(db, 'categories');

/** Récupère la liste des catégories d’un user */
export const getCategoriesByUser = async (
  userId: string
): Promise<Category[]> => {
  const q = query(categoriesCol, where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Category) }));
};

/** Ajoute une catégorie */
export const addCategory = async (
  cat: Omit<Category, 'id' | 'createdAt'>
) => {
  await addDoc(categoriesCol, {
    ...cat,
    createdAt: Timestamp.now()
  });
};

/** Met à jour une catégorie */
export const updateCategory = async (id: string, data: Partial<Category>) => {
  const ref = doc(db, 'categories', id);
  await updateDoc(ref, data);
};

/** Supprime une catégorie */
export const deleteCategory = async (id: string) => {
  const ref = doc(db, 'categories', id);
  await deleteDoc(ref);
};


