// src/screens/NotificationSettingsScreen.tsx
import React, { useState, useLayoutEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Switch,
  FlatList,
  TouchableOpacity,
  Platform
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'NotificationSettings'>;

interface NotificationOption {
  key: string;
  label: string;
  value: boolean;
}

const NotificationSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [options, setOptions] = useState<NotificationOption[]>([
    { key: 'pushAlerts', label: 'Alertes push', value: true },
    { key: 'emailSummary', label: 'Résumé hebdomadaire par email', value: false },
    { key: 'paymentReminders', label: 'Rappels de paiement', value: true },
    { key: 'promoOffers', label: 'Offres et promotions', value: false }
  ]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Notifications',
      headerStyle: { backgroundColor: '#4facfe' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: '700' }
    });
  }, [navigation]);

  const toggleOption = (key: string) => {
    setOptions(prev => prev.map(opt => opt.key === key ? { ...opt, value: !opt.value } : opt));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={options}
        keyExtractor={item => item.key}
        renderItem={({ item }) => (
          <View style={styles.optionItem}>
            <Text style={styles.optionLabel}>{item.label}</Text>
            <Switch
              value={item.value}
              onValueChange={() => toggleOption(item.key)}
            />
          </View>
        )}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity style={styles.saveButton} onPress={() => navigation.goBack()}>
        <Text style={styles.saveText}>Enregistrer</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  list: { padding: 20, paddingBottom: 80 },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  optionLabel: { fontSize: 16, color: '#333' },
  saveButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#4facfe',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});

export default NotificationSettingsScreen;
