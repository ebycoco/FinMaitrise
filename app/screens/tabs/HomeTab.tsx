// src/screens/tabs/HomeTab.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Modal,
  TextInput,
  ActivityIndicator
} from 'react-native';
import {
  getBudgetsByUserAndMonth,
  updateBudget,
  Budget,
  getCategoriesByUser,
  Category,
  addIncome,
  addTransaction,
  getTransactionsByUser,
  getIncomesByUser,
  Transaction,
  Income,
  getMonthlyIncome,
  addMonthlyIncome,
  updateMonthlyIncome
} from '../../firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Layout } from '../../constants';
import { Strings } from '../../constants/strings';
import FAB from '../../components/FAB';
import { Picker } from '@react-native-picker/picker';
import CustomAlert from '../../components/CustomAlert';
import CustomLoader from '../../components/CustomLoader';

const { screenWidth } = Layout;

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, 'ProfileDetail'>;

const HomeTab: React.FC = () => {
  // 1. Ajoutez un état isLoading
  const [isLoading, setIsLoading] = useState(true);
  type Tx = (Transaction & { type: 'expense' }) | (Income & { type: 'income' });
  const navigation = useNavigation<HomeNavProp>();
  const { user, logout } = useAuth();
  const [txs, setTxs] = useState<Tx[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>();
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overBudgetAlertVisible, setOverBudgetAlertVisible] = useState(false);
  const [pendingExpense, setPendingExpense] = useState<{
    budgetId: string;
    label: string;
    amount: number;
  } | null>(null);

  // Modal ajout transaction
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'expense' | 'income'>('expense');
  const [newLabel, setNewLabel] = useState('');
  const [newAmount, setNewAmount] = useState('');
  // états
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);


  // 1) helper générique pour naviguer
  const goTo = (screen: keyof RootStackParamList) => {
    setShowMenu(false);
    navigation.navigate(screen);
  };

  // 2) un helper spécial pour la déconnexion
  const handleLogoutPress = async () => {
    setShowMenu(false);
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Onboarding' }],
      });
    } catch (err) {
      console.error('Erreur lors de la déconnexion :', err);
    }
  };

// 1️⃣ Extraire la logique dans fetchData
const fetchData = useCallback(async () => {
  if (!user) return;
  const [b, cats, txList, incList] = await Promise.all([
    getBudgetsByUserAndMonth(user.id, new Date().getMonth(), new Date().getFullYear()),
    getCategoriesByUser(user.id),
    getTransactionsByUser(user.id),
    getIncomesByUser(user.id),
  ]);

  // charger monthlyIncome
  const miDoc = await getMonthlyIncome(user.id, new Date().getMonth(), new Date().getFullYear());
  setMonthlyIncome(miDoc?.total ?? 0);

  setBudgets(b);
  setCategories(cats);

  const all: Tx[] = [
    ...txList.map(t => ({ ...t, type: 'expense' as const })),
    ...incList.map(i => ({ ...i, type: 'income' as const })),
  ];
  all.sort((a, b) =>
    (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)
  );
  setTxs(all);
}, [user]);

  // charge budgets, catégories, transactions
  // loadAll ne touche plus isLoading
const loadAll = useCallback(async () => {
  if (!user) return;
  await fetchData();
}, [fetchData]);

// Au montage du composant seulement
useEffect(() => {
  (async () => {
    setIsLoading(true);
    await fetchData();
    setIsLoading(false);
  })();
}, [fetchData]);

  // Recharge à chaque focus sur l’onglet
  useFocusEffect(React.useCallback(() =>  {
    (async () => {
      setIsLoading(true);
      await fetchData();
      setIsLoading(false);
    })();
  }, [fetchData]));

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Salutation
  const hour = new Date().getHours();
  const greetingWord = hour < 12
    ? Strings.greetings.morning
    : hour < 18
      ? Strings.greetings.afternoon
      : Strings.greetings.evening;

  // FAB toggle
  const toggleFab = () => {
    LayoutAnimation.spring();
    setFabOpen(prev => !prev);
  };

  // Ouvre modal
  const openModal = (type: 'expense' | 'income') => {
    setModalType(type);
    setNewLabel('');
    setNewAmount('');
    setSelectedBudgetId(undefined);
    setModalVisible(true);
  };
  // 4) Calculer le total des seules dépenses (positives)
  const totalExpenses = txs
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  // 5) Balance courante = revenus agrégés – dépenses

  const currentBalance = monthlyIncome - totalExpenses;
  // Calcule l’utilisation du budget mensuel
  const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalBudgetSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
  const usagePercent = totalLimit
    ? Math.round((totalBudgetSpent / totalLimit) * 100)
    : 0;

  const finalizeSubmit = async () => {
    setIsSubmitting(false);
    setModalVisible(false);
    setFabOpen(false);
    setNewLabel('');
    setNewAmount('');
    setSelectedBudgetId(undefined);
    await loadAll();
  };

  const handleSubmitTransaction = async () => {
    const amt = parseFloat(newAmount);
    if (!newLabel.trim() || isNaN(amt) || (modalType === 'expense' && !selectedBudgetId) || !user) return;
    setIsSubmitting(true);
    try {
      if (modalType === 'expense') {
        // on a bien un budget sélectionné
        const budget = budgets.find(b => b.id === selectedBudgetId);
        if (!budget) return;
        const remaining = (budget.limit - (budget.spent || 0));
        if (amt > remaining) {
          // dépassement : on prépare l'alerte
          setPendingExpense({
            budgetId: selectedBudgetId!,
            label: newLabel.trim(),
            amount: amt
          });
          setOverBudgetAlertVisible(true);
          return; // on n'appelle pas encore Firestore
        }
        // sinon on exécute directement
        await updateBudget(
          selectedBudgetId!,
          {
            spent: (budget.spent || 0) + amt
          });
        await addTransaction({
          userId: user.id,
          budgetId: selectedBudgetId!,
          label: newLabel.trim(),
          amount: -amt
        });

      } else {
        // **INCOME**
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();

        // 1) on récupère (ou pas) le total du mois
        const existing = await getMonthlyIncome(user.id, month, year);
        if (existing) {
          // incrémente
          await updateMonthlyIncome(existing.id!, {
            total: existing.total + amt
          });
        } else {
          // crée un nouveau doc mensuel
          await addMonthlyIncome({
            userId: user.id,
            month,
            year,
            total: amt
          });
        }
        // 2) ajoute la transaction positive
        await addIncome({
          userId: user.id,
          label: newLabel.trim(),
          amount: amt
        });
      }
    } catch (error: any) {
      console.error("Erreur lors de l'ajout :", error);
    } finally {
      // reset + UI
      // reset + reload
      finalizeSubmit();
    }
  };


  // construit dynamiquement le message d'avertissement
const overBudgetMessage = useMemo(() => {
  if (!pendingExpense) return '';
  const { budgetId, amount } = pendingExpense;
  const budget = budgets.find(b => b.id === budgetId);
  const remaining = budget ? budget.limit - (budget.spent || 0) : 0;
  return `Ce montant (${amount.toLocaleString('fr-FR')} F CFA) dépasse le reste du budget (${remaining.toLocaleString('fr-FR')} F CFA). Voulez-vous tout de même l’ajouter ?`;
}, [pendingExpense, budgets]);




// 4. Tant que isLoading, affichez un loader plein écran
if (isLoading) {
  return <CustomLoader />;
}
  return (
    <SafeAreaView style={styles.safeArea}>
      <View>
      <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{greetingWord}, {user?.name || Strings.labels.anonymeUser} 👋</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString('fr-FR', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}</Text>
          </View>
          <TouchableOpacity style={styles.menu} onPress={() => setShowMenu(prev => !prev)}>
            <Ionicons name="menu" size={28} color={Colors.white} />
          </TouchableOpacity>
        </View>
        {showMenu && (
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={() => goTo('Settings')}>
              <Ionicons name="settings-outline" size={20} color="#ff7e5f" style={{ marginRight: 8 }} />
              <Text style={styles.menuText}>Paramètres</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => goTo('Categories')}>
              <Ionicons name="pricetags-outline" size={20} color="#ff7e5f" style={{ marginRight: 8 }} />
              <Text style={styles.menuText}>Categories</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => goTo('NotificationSettings')}>
              <Ionicons name="notifications-outline" size={20} color="#ff7e5f" style={{ marginRight: 8 }} />
              <Text style={styles.menuText}>Notifications</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => goTo('HelpAndSupport')}>
              <Ionicons name="help-circle-outline" size={20} color="#ff7e5f" style={{ marginRight: 8 }} />
              <Text style={styles.menuText}>Aide & Support</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogoutPress}>
              <Ionicons name="log-out-outline" size={20} color="#ff6b6b" style={{ marginRight: 8 }} />
              <Text style={styles.menuTextLogout}>{Strings.labels.logout}</Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
      <View style={styles.metricsContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{Strings.labels.currentBalance}</Text>
          <Text style={styles.cardValue}>{(currentBalance).toLocaleString('fr-FR', {
            style: 'currency', currency: 'XOF'
          })}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{Strings.labels.monthlyBudget}</Text>
          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: `${usagePercent}%` }]} />
          </View>
          <Text style={styles.progressText}>{usagePercent} {Strings.labels.percentUtilise}</Text>
        </View>
      </View>
      <Text style={styles.sectionHeader}>{Strings.labels.recentTransactions}</Text>
      </View>
      <FlatList<Tx>
        data={txs}
        keyExtractor={i => i.id!} 
        renderItem={({ item }) => (
          <View style={styles.transactionItem}>
            <Ionicons
              name={item.type === 'expense' ? 'remove-circle-outline' : 'add-circle-outline'}
              size={20}
              color={item.type === 'expense' ? Colors.danger : Colors.success}
            />
            <Text style={styles.transactionLabel}>{item.label}</Text>
            <Text style={[styles.transactionAmount, { color: item.amount > 0 ? Colors.success : Colors.danger }]}>
              {item.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
      {/* Modal ajout */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalType === 'expense' ? 'Nouvelle dépense' : 'Nouveau revenu'}
            </Text>
            {modalType === 'expense' && (
              <View style={styles.inputGroup}>
                <Ionicons name="wallet-outline" size={20} color={Colors.primary} />
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={selectedBudgetId}
                    onValueChange={v => setSelectedBudgetId(v)}
                  >
                    <Picker.Item label="Choisir un budget" value={undefined} />
                    {budgets.map(b => (
                      <Picker.Item
                        key={b.id}
                        label={`${categories.find(c => c.id === b.categoryId)?.name || '—'} (${(b.limit - b.spent).toLocaleString()} restants)`}
                        value={b.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            )}
            <TextInput
              placeholder={modalType === 'expense' ? 'Libellé de la dépense' : 'Libellé du revenu'}
              style={styles.input}
              value={newLabel}
              onChangeText={setNewLabel}
            />
            <TextInput
              placeholder={modalType === 'expense' ? 'Montant dépensé' : 'Montant reçu'}
              style={styles.input}
              value={newAmount}
              onChangeText={setNewAmount}
              keyboardType="numeric"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmitTransaction}
                style={[styles.addBtn, isSubmitting && { opacity: 0.6 }]}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text style={styles.loadingText}>Envoi en cours…</Text>
                    </View>
                  ) : (
                    <Text style={styles.addText}>
                      {modalType === 'expense' ? 'Ajouter la dépense' : 'Ajouter le revenu'}
                    </Text>
                  )
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {fabOpen && (
        <View style={styles.fabActions}>
          <View style={styles.fabBox}>
            <Text style={styles.fabLabelD}>{Strings.labels.expense}</Text>
            <TouchableOpacity style={[styles.fabButton, styles.expenseButton]} onPress={() => openModal('expense')}>
              <Ionicons name="remove-circle-outline" size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.fabBox}>
            <Text style={styles.fabLabelR}>{Strings.labels.income}</Text>
            <TouchableOpacity style={[styles.fabButton, styles.incomeButton]} onPress={() => openModal('income')}>
              <Ionicons name="add-circle-outline" size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      )}
      <FAB isOpen={fabOpen} onPress={toggleFab} backgroundColor={Colors.accent} />
      <CustomAlert
  visible={overBudgetAlertVisible}
  title="Dépassement de budget"
  message={overBudgetMessage}
  confirmText="Oui, ajouter"
  cancelText="Non, annuler"
  onConfirm={async () => {
    if (!pendingExpense) return;
    const { budgetId, label, amount } = pendingExpense;
    const budget = budgets.find(b => b.id === budgetId);
    if (budget) {
      await updateBudget(budgetId, { spent: (budget.spent || 0) + amount });
      await addTransaction({
        userId: user!.id,
        budgetId,
        label,
        amount: -amount
      });
    }
    setOverBudgetAlertVisible(false);
    setPendingExpense(null);
    finalizeSubmit();
  }}
  onCancel={() => {
    setOverBudgetAlertVisible(false);
    setPendingExpense(null);
  }}
/>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  
  header: {
    height: 180,
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: Colors.primary,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    marginTop: 50
  },
  menu: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    marginTop: -40
  },
  date: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fb8500',
    marginTop: 9
  },
  menuContainer: {
    position: 'absolute',
    marginTop: 90,
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 10,
    alignSelf: 'flex-end',
    marginRight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 3,
    zIndex: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  menuText: { fontSize: 16, color: Colors.textPrimary },
  menuTextLogout: { fontSize: 16, color: '#ff6b6b' },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -20,
    paddingHorizontal: 20
  },
  card: { width: (screenWidth - 60) / 2, backgroundColor: Colors.white, borderRadius: 20, padding: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  cardTitle: { fontSize: 16, color: Colors.textSecondary, marginBottom: 8 },
  cardValue: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  progressBackground: { width: '100%', height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: Colors.success },
  progressText: { fontSize: 12, color: '#999', textAlign: 'right' },
  sectionHeader: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginHorizontal: 20, marginVertical: 10 },
  transactionItem: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 15, borderRadius: 15, marginHorizontal: 20, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  transactionLabel: { fontSize: 16, color: Colors.textPrimary },
  transactionAmount: { fontSize: 16, fontWeight: '600' },
  listContent: { paddingBottom: 100 },
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center', alignItems: 'center', padding: 20
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8
  },
  fabActions: { position: 'absolute', bottom: 110, right: 8, alignItems: 'center' },
  fabBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  fabButton: { width: 40, height: 40, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  expenseButton: { backgroundColor: Colors.danger },
  incomeButton: { backgroundColor: Colors.success },
  fabLabelD: { fontSize: 12, fontWeight: '600', marginRight: 8, color: Colors.danger },
  fabLabelR: { fontSize: 12, fontWeight: '600', marginRight: 8, color: Colors.success },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10
  },
  categoryButton: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 10
  },
  categorySelected: {
    backgroundColor: '#ffd6d6'
  },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, marginBottom: 12 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '85%', backgroundColor: Colors.white, borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15, textAlign: 'center' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  cancelBtn: {
    marginRight: 10,
    paddingVertical: 8, paddingHorizontal: 15,
    borderRadius: 10, borderWidth: 1,
    borderColor: '#ff6b6b', backgroundColor: 'transparent'
  },
  inputGroup: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 8,
    borderWidth: 1, borderColor: '#ddd',
    marginBottom: 12, paddingHorizontal: 12, paddingVertical: 8
  },
  pickerWrapper: {
    flex: 1, marginLeft: 8
  },
  cancelOutlined: { borderWidth: 1, borderColor: Colors.accent, paddingVertical: 8, paddingHorizontal: 15, borderRadius: 10, marginRight: 8 },
  cancelText: { color: Colors.danger, fontWeight: '600' },
  addBtn: {
    backgroundColor: Colors.success, paddingVertical: 8,
    paddingHorizontal: 15, borderRadius: 10
  },
  addText: { color: '#fff', fontWeight: '600' },
  submitBtn: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 10 },
  expenseBtn: { backgroundColor: Colors.danger },
  incomeBtn: { backgroundColor: Colors.success },
  submitText: { color: Colors.white, fontWeight: '600' },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },

});

export default HomeTab;
