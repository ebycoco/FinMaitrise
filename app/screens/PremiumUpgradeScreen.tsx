// src/screens/PremiumUpgradeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'PremiumUpgrade'>;

const PremiumUpgradeScreen: React.FC<Props> = ({ navigation }) => {
  const handleUpgrade = async () => {
    // Ici, insérer la logique d'achat/mise à niveau Premium.
    // Pour ce MVP, nous simulons simplement l'upgrade et redirigeons vers le Dashboard.
    navigation.replace('Dashboard');
  };

  return (
    <LinearGradient colors={['#ff9a9e', '#fad0c4']} style={styles.gradient}>
      <View style={styles.container}>
        {/* Icône de mise en avant */}
        <Ionicons name="star" size={64} color="#fff" style={styles.icon} />

        <Text style={styles.title}>Décuplez votre expérience !</Text>
        <Text style={styles.subtitle}>
          Débloquez des fonctionnalités exclusives et transformez la gestion de vos finances.
        </Text>

        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
            <Text style={styles.featureText}>Recommandations intelligentes</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
            <Text style={styles.featureText}>Synchronisation multi-appareils</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
            <Text style={styles.featureText}>Suppression des publicités</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
            <Text style={styles.featureText}>Accès anticipé aux nouveautés</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleUpgrade}>
          <Text style={styles.buttonText}>Passer Premium</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 25,
    lineHeight: 22,
  },
  featureList: {
    width: '100%',
    marginBottom: 25,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 10,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff5e62',
  },
});

export default PremiumUpgradeScreen;
