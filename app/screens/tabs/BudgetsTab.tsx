// src/screens/tabs/BudgetsTab.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
  Modal,
  TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import FAB from '../../components/FAB';
import CustomAlert from '../../components/CustomAlert';
import { Colors } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import {
  getBudgetsByUserAndMonth,
  addBudget,
  updateBudget,
  deleteBudget,
  Budget,
  getCategoriesByUser,
  Category
} from '../../firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import CustomLoader from '../../components/CustomLoader';

const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const { width: screenWidth } = Dimensions.get('window');
const CARD_MARGIN = 16;
const CARD_WIDTH = screenWidth - CARD_MARGIN * 2;
const CARD_HEIGHT = 150;

const BudgetsTab: React.FC = () => {
  // 1. Ajoutez un état isLoading
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [monthIndex, setMonthIndex] = useState(new Date().getMonth());
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string | undefined>(undefined);

  // … en haut de ton composant BudgetsTab
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // Modal ajout/édition
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formLimit, setFormLimit] = useState('');

  // Confirmation suppression
  const [alertVisible, setAlertVisible] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Animations
  const summaryAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;

  // Fonction de chargement
  const loadBudgets = async () => {
    if (!user) return;
    setIsLoading(true);
    // Charger les catégories
    try {
      const cats = await getCategoriesByUser(user.id);
      setCategories(cats);
    } catch (e) {
      console.error("Erreur fetch categories:", e);
    }
    try {
      const data = await getBudgetsByUserAndMonth(
        user.id,
        monthIndex,
        new Date().getFullYear()
      );
      setBudgets(data);
      summaryAnim.setValue(0);
      cardAnim.setValue(0);
      Animated.stagger(100, [
        Animated.timing(summaryAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false
        }),
        Animated.timing(cardAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true
        })
      ]).start();
    } catch (error) {
      console.error("Erreur fetch budget:", error);
    }finally{
      setIsLoading(false);
    }

  };

  useEffect(() => {
    // Chargement immédiat au premier montage
    loadBudgets();

  }, []);

  // Recharge à chaque focus sur l’onglet
  useFocusEffect(
    React.useCallback(() => {
      loadBudgets();
    }, [user, monthIndex])
  );

  // Navigation mois
  const prevMonth = () => setMonthIndex(m => (m === 0 ? 11 : m - 1));
  const nextMonth = () => setMonthIndex(m => (m === 11 ? 0 : m + 1));

  // Ouvre modal ajout
  const openAddModal = () => {
    setIsEditing(false);
    setSelectedCatId('');
    setFormLimit('');
    setSelectedCatId('');
    setModalVisible(true);
  };

  // Ouvre modal édition
  const openEditModal = (b: Budget) => {
    setIsEditing(true);
    setEditId(b.id!);
    setSelectedCatId(b.categoryId);
    setFormLimit(String(b.limit));
    setModalVisible(true);
  };

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  // Envoi formulaire
  const handleSubmit = async () => {
    const limitVal = Number(formLimit);
    if (!user || isNaN(limitVal)) return;
    // 2) validation spécifique de la catégorie 
    if (!selectedCatId) {
      showAlert('Erreur', 'Veuillez sélectionner une catégorie.');
      return;
    }
    const payload = {
      userId: user.id,
      limit: limitVal,
      spent: 0,
      month: monthIndex,
      year: new Date().getFullYear(),
      categoryId: selectedCatId
    };
    if (isEditing && editId) {
      await updateBudget(editId, {
        limit: payload.limit
      });
    } else {
      await addBudget(payload);
    }
    setModalVisible(false);
    // on recharge la liste pour voir tout de suite le nouveau budget
    await loadBudgets();
  };

  // Prépare la confirmation de suppression
  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setAlertVisible(true);
  };

  // Supprime vraiment
  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteBudget(deleteId);
    setBudgets(bs => bs.filter(b => b.id !== deleteId));
    setDeleteId(null);
    setAlertVisible(false);
    await loadBudgets();
  };

  // Totaux
  const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const usagePercent = totalLimit
    ? Math.round((totalSpent / totalLimit) * 100)
    : 0;
  // map rapide id → name
  const categoryMap = React.useMemo(() =>
    categories.reduce<Record<string, string>>((acc, c) => {
      if (c.id) acc[c.id] = c.name;
      return acc;
    }, {}), [categories]
  );
  if (isLoading) {
    return <CustomLoader />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Mois */}
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        style={styles.header}
      >
        <TouchableOpacity onPress={prevMonth} style={styles.nav}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>
          {months[monthIndex]} {new Date().getFullYear()}
        </Text>
        <TouchableOpacity onPress={nextMonth} style={styles.nav}>
          <Ionicons name="chevron-forward" size={26} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Résumé */}
      <Animated.View
        style={[styles.summaryContainer, { opacity: summaryAnim }]}
      >
        <Text style={styles.summaryLabel}>Dépensé ce mois</Text>
        <Text style={styles.summaryValue}>
          {totalSpent.toLocaleString()} / {totalLimit.toLocaleString()} F CFA (
          {usagePercent}%)
        </Text>
        <View style={styles.progressBg}>
          <Animated.View
            style={[styles.progressFillSmall, { width: `${usagePercent}%` }]}
          />
        </View>
      </Animated.View>

      {/* Liste des budgets */}
      <FlatList
        data={budgets}
        keyExtractor={b => b.id!}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const percent = item.limit
            ? Math.round((item.spent / item.limit) * 100)
            : 0;
          const translateY = cardAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [30, 0]
          });
          const catName = categoryMap[item.categoryId] || '—';
          return (
            <Animated.View
              style={[
                styles.cardWrapper,
                { transform: [{ translateY }], opacity: cardAnim }
              ]}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.cardGradient}
              >
                <View style={styles.cardHeader}>
                  <Ionicons name="wallet-outline" size={28} color="#fff" />
                  <Text style={[styles.cardTitle, { flex: 1 }]}>
                    {catName}
                  </Text>
                  <TouchableOpacity
                    style={styles.editIcon}
                    onPress={() => openEditModal(item)}
                  >
                    <Ionicons name="create-outline" size={20} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteIcon}
                    onPress={() => confirmDelete(item.id!)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardSpent}>
                  {item.spent.toLocaleString()} F CFA
                </Text>
                <Text style={styles.cardLimit}>
                  / {item.limit.toLocaleString()} F CFA
                </Text>
                <View style={styles.cardFooter}>
                  <View style={styles.progressBgSmall}>
                    <View
                      style={[
                        styles.progressFillSmall,
                        { width: `${percent}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.percent}>{percent}%</Text>
                </View>
              </LinearGradient>
            </Animated.View>
          );
        }}
      />

      {/* Modal ajout/édition */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <LinearGradient
              colors={[Colors.secondary, Colors.primary]}
              start={[0, 0]} end={[1, 0]}
              style={styles.modalHeader}
            >
              <Text style={styles.modalTitle}>
                {isEditing ? 'Modifier budget' : 'Nouveau budget'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalClose}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>

            {/* Body */}
            <View style={styles.modalBody}>
              {/* Catégorie */}
              <View style={styles.inputGroup}>
                <Ionicons name="wallet-outline" size={20} color={Colors.primary} />
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={selectedCatId}
                    onValueChange={val => setSelectedCatId(val)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Catégorie" value={undefined} />
                    {categories.map(c => (
                      <Picker.Item key={c.id} label={c.name} value={c.id} />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Limite */}
              <View style={styles.inputGroup}>
                <Ionicons name="cash-outline" size={20} color={Colors.primary} />
                <TextInput
                  style={styles.input}
                  placeholder="Montant du budget"
                  keyboardType="numeric"
                  value={formLimit}
                  onChangeText={setFormLimit}
                />
              </View>
            </View>

            {/* Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnConfirm}
                onPress={handleSubmit}
              >
                <Text style={styles.btnConfirmText}>
                  {isEditing ? 'Enregistrer' : 'Ajouter'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


      {/* FAB pour ouvrir modal */}
      <FAB isOpen={false} onPress={openAddModal} backgroundColor={Colors.primary} />

      {/* CustomAlert suppression */}
      <CustomAlert
        visible={alertVisible}
        title="Supprimer ce budget ?"
        message="Cette action est irréversible."
        onConfirm={handleDelete}
        onCancel={() => setAlertVisible(false)}
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Platform.OS === 'ios' ? '#F0F2F5' : '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    backgroundColor: '#8E2DE2',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15
  },
  nav: {
    padding: 8,
    marginTop: 50,
  },
  headerText: { marginTop: 50, fontSize: 22, fontWeight: '800', color: '#fff' },

  summaryContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3
  },
  summaryLabel: { fontSize: 14, color: '#666', marginBottom: 4 },
  summaryValue: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 8 },
  progressBg: { width: '100%', height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden' },
  progressBgSmall: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFillSmall: { height: '100%', backgroundColor: '#4A00E0' },

  list: { paddingBottom: 80 },

  cardWrapper: { marginHorizontal: CARD_MARGIN, marginBottom: 20, width: CARD_WIDTH },
  cardGradient: {
    height: CARD_HEIGHT,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginLeft: 12 },
  editIcon: { marginLeft: 8, padding: 4 },
  deleteIcon: { marginLeft: 8, padding: 4 },
  cardSpent: { color: '#fff', fontSize: 24, fontWeight: '800' },
  cardLimit: { color: 'rgba(255,255,255,0.8)', fontSize: 16 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  percent: { color: '#fff', fontSize: 14, fontWeight: '700', marginLeft: 8 },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    // ombre iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    // élévation Android
    elevation: 10
  },
  modalHeader: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center'
  },
  modalClose: {
    position: 'absolute',
    right: 16
  },
  modalBody: {
    padding: 20,
    backgroundColor: '#fafafa'
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  pickerWrapper: {
    flex: 1,
    marginLeft: 8
  },
  picker: {
    height: 50,
    width: '100%'
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333'
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    backgroundColor: '#fff'
  },
  btnCancel: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginRight: 10
  },
  btnCancelText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600'
  },
  btnConfirm: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary
  },
  btnConfirmText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  }
});

export default BudgetsTab;
