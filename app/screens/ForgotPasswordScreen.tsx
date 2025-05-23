// src/screens/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { LinearGradient } from 'expo-linear-gradient';
import { Strings } from '../constants/strings';
import CustomAlert from '../components/CustomAlert';
import { showMessage } from 'react-native-flash-message';

// Firebase Auth import
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // État pour CustomAlert
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
  
    const showAlert = (title: string, message: string) => {
      setAlertTitle(title);
      setAlertMessage(message);
      setAlertVisible(true);
    };

  // Fonction simulant l'envoi des instructions de réinitialisation
  const handleResetPassword = async()  => {
    // Empêche double exécution
    if (loading) return;
    // Vérification email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          showAlert(Strings.alerts.errorTitle, 'Adresse email invalide.');
          return;
        } 
        setLoading(true);
        try {
          // Envoi de l'email via Firebase Auth
      await sendPasswordResetEmail(auth, email.trim());
      showAlert(
        Strings.alerts.successTitle,
        Strings.alerts.resetEmailSent.replace('{email}', email.trim())
      );
      showMessage({
        message: "Email envoyé",
        description: "Consulte ta boîte mail pour réinitialiser ton mot de passe.",
        type: "success",
      });
      navigation.replace('Login');
        } catch (error: any) {
          // Gestion des erreurs Firebase
          if (error.code === 'auth/user-not-found') {
            showAlert(Strings.alerts.errorTitle, Strings.alerts.userNotFound);
          } else {
            showAlert(Strings.alerts.errorTitle, error.message || Strings.alerts.genericError);
          }
        } finally {
          setLoading(false);
        }
    
  };

  return (
    <LinearGradient colors={['#ff7e5f', '#feb47b']} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Text style={styles.header}>{Strings.labels.forgotPassword}</Text>
        <Text style={styles.instruction}>
        {Strings.instructions.resetPassword}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#eee"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleResetPassword}disabled={loading}>
          <Text style={styles.buttonText}>{loading ? Strings.labels.sending : Strings.buttons.send}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
          <Text style={styles.linkText}>{Strings.buttons.back}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
       {/* CustomAlert */}
       <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onConfirm={() => setAlertVisible(false)}
        // Pas de onCancel ici puisque seul OK
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  instruction: {
    fontSize: 16,
    color: '#f0f0f0',
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 30,
    lineHeight: 24,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 25,
    height: 50,
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 20,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#fff',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Pour Android
  },
  buttonDisabled: { backgroundColor: 'rgba(255,255,255,0.5)' },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff7e5f',
  },
  backLink: {
    marginTop: 10,
  },
  linkText: {
    color: '#fff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default ForgotPasswordScreen;
