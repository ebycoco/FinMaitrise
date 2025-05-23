// src/screens/OnboardingScreen.tsx
import React from 'react';
import { Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants';
import Logo from '../components/Logo';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const handleGetStarted = () => {
    navigation.replace('Login');
  };

  return (
    <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Logo de l'application */}
        <Logo/>
        {/* Ici, nous avons retiré l'élément Image puisque vous ne disposez pas d'une image onboarding.png */}
        <Text style={styles.title}>Bienvenue sur Fin’Maîtrise</Text>
        <Text style={styles.subtitle}>
          Gérez vos finances en toute simplicité et atteignez vos objectifs d’épargne en un clin d’œil.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Commencer</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#f0f0f0',
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 40,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#fff',
    width: '80%',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
});

export default OnboardingScreen;
