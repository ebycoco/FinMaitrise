// src/services/dataService.ts

import { getTransactionsByUser, getIncomesByUser } from '../firebase/firestore';

export interface MonthAggregate {
  /** 0 = Janvier, 1 = Février, … */
  month: number;
  /** Total des dépenses (positives) */
  expenses: number;
  /** Total des revenus */
  incomes: number;
}

/**
 * Calcule pour chaque mois (0–11) le total des dépenses et des revenus
 * de l'année donnée (par défaut l'année en cours).
 */
export async function getMonthlyData(
  userId: string,
  year: number = new Date().getFullYear()
): Promise<MonthAggregate[]> {
  // On récupère toutes les transactions et tous les revenus
  const [txs, incs] = await Promise.all([
    getTransactionsByUser(userId),
    getIncomesByUser(userId),
  ]);

  // Pour chaque mois, on filtre et on agrège
  const result: MonthAggregate[] = Array.from({ length: 12 }, (_, month) => {
    const expenses = txs
      .filter(tx => {
        const d = tx.createdAt.toDate();
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    const incomes = incs
      .filter(inc => {
        const d = inc.createdAt!.toDate();
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((sum, inc) => sum + inc.amount, 0);

    return { month, expenses, incomes };
  });

  return result;
}
