// src/screens/CategoryScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Animated,
  Easing,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FAB from '../components/FAB';
import CustomAlert from '../components/CustomAlert';
import { Colors } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
  getCategoriesByUser,
  addCategory,
  updateCategory,
  deleteCategory,
  Category
} from '../firebase/firestore';

type Props = NativeStackScreenProps<RootStackParamList, 'Categories'>;

// mapping clé -> icône Ionicons
const iconMap: Record<Category['icone'], keyof typeof Ionicons.glyphMap> = {
    Alimentation: 'restaurant-outline',
    Transport: 'bus-outline',
    Shopping: 'cart-outline',
    Divertissement: 'film-outline',
    Sante: 'heart-outline',
    Loisirs: 'book-outline',
};

const CategoryScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [cats, setCats] = useState<Category[]>([]);
  const [loadingAnim] = useState(new Animated.Value(0));
  const [fabOpen, setFabOpen] = useState(false);

  // modal add/edit
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<Category['icone']>('Alimentation');

  // alert delete
  const [alertVisible, setAlertVisible] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    const data = await getCategoriesByUser(user.id);
    setCats(data);
    loadingAnim.setValue(0);
    Animated.timing(loadingAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false
    }).start();
  };

  useEffect(() => {
    load();
  }, [user]);

  const openAdd = () => {
    setIsEditing(false);
    setEditId(null);
    setFormName('');
    setSelectedIcon('Alimentation');
    setModalVisible(true);
  };
  const openEdit = (c: Category) => {
    setIsEditing(true);
    setEditId(c.id!);
    setFormName(c.name);
    setSelectedIcon(c.icone);
    setModalVisible(true);
  };
  const confirmDel = (id: string) => {
    setDeleteId(id);
    setAlertVisible(true);
  };

  const handleSubmit = async () => {
    if (!formName.trim() || !user) return;
    const payload = { userId: user.id, name: formName.trim(), icone: selectedIcon };
    if (isEditing && editId) {
      await updateCategory(editId, payload);
    } else {
      await addCategory(payload);
    }
    setModalVisible(false);
    await load();
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteCategory(deleteId);
      setAlertVisible(false);
      await load();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.header, { opacity: loadingAnim }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Mes catégories</Text>
        </View>
      </Animated.View>

      <FlatList
        data={cats}
        keyExtractor={c => c.id!}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons
                name={iconMap[item.icone]}
                size={20}
                color={Colors.accent}
                style={{ marginRight: 12 }}
              />
              <Text style={styles.name}>{item.name}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => openEdit(item)}>
                <Ionicons name="create-outline" size={22} color={Colors.accent} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmDel(item.id!)} style={{ marginLeft: 16 }}>
                <Ionicons name="trash-outline" size={22} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal add/edit */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Modifier catégorie' : 'Nouvelle catégorie'}
            </Text>

            {/* Sélection d’icône */}
            <View style={styles.iconPickerRow}>
              {(['Alimentation','Transport','Shopping','Divertissement','Sante','Loisirs'] as Category['icone'][]).map(ic => (
                <TouchableOpacity
                  key={ic}
                  style={[
                    styles.iconPickerButton,
                    selectedIcon === ic && styles.iconPickerSelected
                  ]}
                  onPress={() => setSelectedIcon(ic)}
                >
                  <Ionicons name={iconMap[ic]} size={24} color={selectedIcon === ic ? '#fff' : '#666'} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Nom */}
            <TextInput
              style={styles.input}
              placeholder="Nom de la catégorie"
              value={formName}
              onChangeText={setFormName}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.btnCancel}>
                <Text style={styles.textCancel}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSubmit} style={styles.btnConfirm}>
                <Text style={styles.textConfirm}>{isEditing ? 'Enregistrer' : 'Ajouter'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirmation delete */}
      <CustomAlert
        visible={alertVisible}
        title="Supprimer cette catégorie ?"
        message="Cette action est irréversible."
        onConfirm={handleDelete}
        onCancel={() => setAlertVisible(false)}
        confirmText="Supprimer"
        cancelText="Annuler"
      />

      <FAB isOpen={fabOpen} onPress={openAdd} backgroundColor={Colors.accent} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: Colors.primary },
  headerRow: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerText: { color: '#fff', fontSize: 20, fontWeight: '700', marginLeft: 12 },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd'
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 16 },

  actions: { flexDirection: 'row' },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalCard: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, textAlign: 'center' },

  iconPickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16
  },
  iconPickerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#eee'
  },
  iconPickerSelected: {
    backgroundColor: Colors.primary
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  btnCancel: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.danger,
    marginRight: 10
  },
  textCancel: { color: Colors.danger },
  btnConfirm: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6
  },
  textConfirm: { color: '#fff' }
});

export default CategoryScreen;
