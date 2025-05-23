// src/screens/tabs/ExpensesTab.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import FAB from '../../components/FAB';
import { Colors } from '../../constants';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

import {
  getBudgetsByUserAndMonth,
  updateBudget,
  Budget,
  getCategoriesByUser,
  Category,
  addTransaction,
  getTransactionsByUser,
  Transaction
} from '../../firebase/firestore';
import CustomLoader from '../../components/CustomLoader';

const ICON_MAPPING: Record<Category['icone'], keyof typeof Ionicons.glyphMap> = {
  Alimentation: 'restaurant-outline',
  Transport: 'bus-outline',
  Shopping: 'cart-outline',
  Divertissement: 'film-outline',
  Sante: 'heart-outline',
  Loisirs: 'book-outline',
};
const monthNames = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const SCREEN_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_PADDING = 20;
const CARD_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;
const CARD_HEIGHT = 120;
const HEADER_HEIGHT = 180;
const ITEM_SPACING = 16;

// Pour centrer parfaitement la 1ère et la dernière card :
const SIDE_PADDING      = (SCREEN_WIDTH - CARD_WIDTH) / 2;
// On enlève la moitié de l’espacement (marge intérieure) :
const CONTENT_PADDING   = SIDE_PADDING - ITEM_SPACING / 2;

// Sur ces bases, chaque « intervalle de snap » :
const CARD_WITH_SPACING = CARD_WIDTH + ITEM_SPACING;
// pour centrer la 1ère et la dernière

const ExpensesTab: React.FC = () => {
  // 1. Ajoutez un état isLoading
    const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // états
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Transaction[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>();
  const [monthIndex, setMonthIndex] = useState(new Date().getMonth());
  const [refreshing, setRefreshing] = useState(false);


  const now = new Date();
  const year = now.getFullYear();
/**
   * 1️⃣ fetchMonthData : charge budgets, catégories et dépenses
   *     sans toucher à refreshing
   */
const fetchMonthData = useCallback(async (m: number) => {
  if (!user) return;
  const y = new Date().getFullYear();
  const [b, cats, allTx] = await Promise.all([
    getBudgetsByUserAndMonth(user.id, m, y),
    getCategoriesByUser(user.id),
    getTransactionsByUser(user.id),
  ]);
  setBudgets(b);
  setCategories(cats);
  setExpenses(allTx.filter(tx => {
    const d = tx.createdAt.toDate();
    return d.getMonth() === m && d.getFullYear() === y;
  }));
}, [user]);

  /**
   * 2️⃣ loadAll : identique à fetchMonthData,
   *    utilisé sur focus / mise à jour de monthIndex
   */
  const loadAll = useCallback(async (m: number = monthIndex) => {
    await fetchMonthData(m);
  }, [fetchMonthData, monthIndex]);
  // 3️⃣ Au montage initial, on affiche CustomLoader
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await fetchMonthData(monthIndex);
      setIsLoading(false);
    })();
  }, [fetchMonthData, monthIndex]);
  // 4️⃣ Sur focus, on recharge les données sans loader
  useFocusEffect(React.useCallback(() => {
    (async () => {
      setIsLoading(true);
      await fetchMonthData(monthIndex);
      setIsLoading(false);
    })();
  }, [fetchMonthData, monthIndex]));

  // Pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMonthData(monthIndex);
    setRefreshing(false);
  };


  // 1) map catégorieId → icône, sans risque de undefined
  const categoryIconMap = useMemo(() => {
    const m: Record<string, keyof typeof Ionicons.glyphMap> = {};
    categories.forEach(c => {
      if (c.id) {
        // on sait que c.icone est Food | Transport | …
        m[c.id] = ICON_MAPPING[c.icone];
      }
    });
    return m;
  }, [categories]);

  // 2) map budgetId → icône de sa catégorie
  const budgetIconMap = useMemo(() => {
    const m: Record<string, keyof typeof Ionicons.glyphMap> = {};
    budgets.forEach(b => {
      if (b.id) {
        m[b.id] = b.categoryId
          ? categoryIconMap[b.categoryId] ?? 'wallet-outline'
          : 'wallet-outline';
      }
    });
    return m;
  }, [budgets, categoryIconMap]);


  const handleAddExpense = async () => {
    const amt = parseFloat(newAmount);
    if (!newLabel.trim() || isNaN(amt) || !selectedBudgetId || !user) return;

    // 1) met à jour le spent du budget
    const budget = budgets.find(b => b.id === selectedBudgetId);
    if (budget) {
      await updateBudget(selectedBudgetId, {
        spent: (budget.spent || 0) + amt
      });
    }

    // 2) crée la transaction
    await addTransaction({
      userId: user.id,
      budgetId: selectedBudgetId,
      label: newLabel.trim(),
      amount: -amt
    });

    // reset + reload
    setNewLabel('');
    setNewAmount('');
    setSelectedBudgetId(undefined);
    setModalVisible(false);
    await loadAll(monthIndex);
  };

  // 1️⃣ on définit renderExpenseItem
  const renderExpenseItem = ({ item }: { item: Transaction }) => {
    const iconName = budgetIconMap[item.budgetId] || 'wallet-outline';
    return (
      <View style={styles.itemContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name={iconName} size={24} color="#ff6b6b" />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemLabel}>{item.label}</Text>
          <Text style={styles.itemDate}>
            {item.createdAt.toDate().toLocaleDateString('fr-FR')}
          </Text>
        </View>
        <Text style={styles.itemAmount}>
          {item.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return <CustomLoader />;
  } 
  return (
    <SafeAreaView style={styles.safeArea}>
       {/* 1) HEADER */}
    <LinearGradient
      colors={['#ff9a9e','#fad0c4']}
      style={styles.header}
    >
      <Text style={styles.headerText}>Dépenses</Text>
      <Text style={styles.subheaderText}>{user?.name}</Text>
    </LinearGradient>

    {/* 2) RÉSUMÉ HORIZONTAL */}
    <View style={styles.summaryContainer}>
      <FlatList
        data={monthNames}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WITH_SPACING}
        decelerationRate="fast"
        snapToAlignment="start"
        keyExtractor={(_, i) => String(i)}
        initialScrollIndex={monthIndex}
        getItemLayout={(_, i) => ({
          length: CARD_WITH_SPACING,
          offset: CARD_WITH_SPACING * i,
          index: i
        })}
        onMomentumScrollEnd={ev => {
          const newIdx = Math.round(ev.nativeEvent.contentOffset.x / (CARD_WITH_SPACING));
          if (newIdx !== monthIndex) {
            setMonthIndex(newIdx);
            loadAll(newIdx);
          }
        }}
        contentContainerStyle={{ paddingHorizontal: CONTENT_PADDING, }}
        renderItem={({ item: mn, index }) => {
          const totalForMonth = expenses
            .filter(e => e.createdAt.toDate().getMonth() === index)
            .reduce((s,e) => s + e.amount, 0);
            const displayTotal = Math.abs(totalForMonth);
          return (
            <View style={[styles.summaryCard, { width: CARD_WIDTH, height: CARD_HEIGHT,marginRight: ITEM_SPACING, }]}>
              <Text style={styles.summaryTitle}>
                Total dépensé en {mn} {year}
              </Text>
              <Text style={styles.summaryValue}>
                {(displayTotal).toLocaleString('fr-FR',{
                  style:'currency',
                  currency:'XOF'
                })}
              </Text>
            </View>
          );
        }}
      />
    </View>

    {/* 3) LISTE DES DÉPENSES */}
    <FlatList
      data={expenses}
      keyExtractor={i => i.id!}
      renderItem={renderExpenseItem}
      contentContainerStyle={styles.listContainer}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListEmptyComponent={() => (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Aucune dépense pour ce mois.
          </Text>
        </View>
      )}
    />

      {/* Modal ajout */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nouvelle dépense</Text>

            {/* Choix du budget */}
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
                      label={`${categoryIconMap[b.categoryId!] ? '' : ''} ${
                        /**
                         * On affiche ici le nom de la catégorie
                         * à partir de categoryIconMap + categories
                         */
                        categories.find(c => c.id === b.categoryId)?.name || '—'
                        } (${(b.limit - b.spent).toLocaleString()} restants)`}
                      value={b.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <TextInput
              placeholder="Libellé"
              style={styles.input}
              value={newLabel}
              onChangeText={setNewLabel}
            />
            <TextInput
              placeholder="Montant"
              style={styles.input}
              value={newAmount}
              onChangeText={setNewAmount}
              keyboardType="numeric"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddExpense} style={styles.addBtn}>
                <Text style={styles.addText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* FAB */}
      <FAB isOpen={false} onPress={() => setModalVisible(true)} backgroundColor={Colors.danger} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fafafa' },
  header: {
    height: HEADER_HEIGHT,
    width: '100%',
    alignSelf: 'stretch', 
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerText: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    marginTop: 10
  },
  subheaderText: {
    fontSize: 16,
    color: '#fff99d',
    marginTop: 4
  },
  summaryContainer: {
    // fixe la hauteur totale du résumé pour éviter tout étirement
    height: CARD_HEIGHT + 20,
    marginTop: - (CARD_HEIGHT / 2),  // si tu veux chevaucher un peu le header
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex:1,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333'
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffe2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  itemInfo: { flex: 1 },
  itemLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  itemDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ff6b6b'
  },
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
  modalTitle: {
    fontSize: 18, fontWeight: '700', marginBottom: 15, textAlign: 'center'
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
  input: {
    borderWidth: 1, borderColor: '#ccc',
    borderRadius: 10, padding: 10, marginBottom: 10
  },
  modalActions: {
    flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15
  },
  cancelBtn: {
    marginRight: 10,
    paddingVertical: 8, paddingHorizontal: 15,
    borderRadius: 10, borderWidth: 1,
    borderColor: '#ff6b6b', backgroundColor: 'transparent'
  },
  cancelText: { color: '#999', fontWeight: '600' },
  addBtn: {
    backgroundColor: '#ff6b6b', paddingVertical: 8,
    paddingHorizontal: 15, borderRadius: 10
  },
  addText: { color: '#fff', fontWeight: '600' }
});

export default ExpensesTab;
