// src/screens/SignupScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../components/Logo';
import { Strings } from '../constants/strings';
import CustomAlert from '../components/CustomAlert';
import { createUserProfile, addCategory  } from '../firebase/firestore';
import { showMessage } from 'react-native-flash-message';


type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signup, user } = useAuth();

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);


  // État de chargement pour le bouton
  const [loading, setLoading] = useState(false);

  // États pour CustomAlert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // Fonction utilitaire pour afficher une alerte
  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const handleSignup = async () => {
    // Empêcher clics multiples
    if (loading) return;
    // Validation des champs
    if (!name.trim() || !userName.trim() || !email.trim() || !password || !confirmPassword) {
      showAlert(Strings.alerts.errorTitle, Strings.alerts.fillAllFields);
      return;
    }
    // Vérification email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showAlert(Strings.alerts.errorTitle, 'Adresse email invalide.');
      return;
    }
    // Vérification mot de passe
    if (password !== confirmPassword) {
      showAlert(Strings.alerts.errorTitle, Strings.alerts.passwordsMismatch);
      return;
    }
    if (password.length < 6) {
      showAlert(Strings.alerts.errorTitle, 'Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setLoading(true);
    try {
      await signup(name, userName, email, password);
      if (user?.id) {
        await createUserProfile(user.id, { name, userName, email });
         // 2) Ajoute les catégories par défaut
         const defaultCats = [
          "Alimentation",
          "Transport",
          "Shopping",
          "Divertissement",
          "Sante",
          "Loisirs"
        ] as const;
        await Promise.all(defaultCats.map(cat =>
          addCategory({ userId: user.id, name: cat, icone: cat })
        ));
      }
      showMessage({
        message: "Vérifie ton email",
        description: "Un lien de confirmation t’a été envoyé.",
        type: "info",
      });
      navigation.replace('Login');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        showAlert(Strings.alerts.errorTitle, 'Cet email est déjà utilisé. Veuillez vous connecter ou utiliser un autre email.');
      } else {
        showAlert(Strings.alerts.errorTitle, error.message || 'Impossible de s’inscrire pour le moment.');
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
        {/* Logo de l'application */}
        <Logo />
        <Text style={styles.header}>Inscription</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nom"
            placeholderTextColor="#eee"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            textContentType="name"
            autoComplete="name"
          />
          <TextInput
            style={styles.input}
            placeholder="Prénom"
            placeholderTextColor="#eee"
            value={userName}
            onChangeText={setUserName}
            autoCapitalize="words"
            textContentType="givenName"
            autoComplete="given-name"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#eee"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            textContentType="emailAddress"
            autoComplete="email"
          />
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.inputWithIcon}
              placeholder="Mot de passe"
              placeholderTextColor="#eee"
              secureTextEntry={!passwordVisible}
              value={password}
              onChangeText={setPassword}
              textContentType="newPassword"
              autoComplete="password-new"
            />
            <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.iconContainer}>
              <Text style={styles.eyeIcon}>{passwordVisible ? '👁️' : '🙈'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.inputWithIcon}
              placeholder="Confirmer mot de passe"
              placeholderTextColor="#eee"
              secureTextEntry={!confirmPasswordVisible}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              textContentType="newPassword"
              autoComplete="password-new"
            />
            <TouchableOpacity onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)} style={styles.iconContainer}>
              <Text style={styles.eyeIcon}>{confirmPasswordVisible ? '👁️' : '🙈'}</Text>
            </TouchableOpacity>
          </View>

        </View>
        {loading && (
            <View style={{ marginBottom: 10, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 20, marginBottom: 5 }}>Inscription en cours...</Text>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          )}
        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSignup} disabled={loading}>
        <Text style={styles.buttonText}>
    {loading ? "Inscription en cours..." : "S'inscrire"}
  </Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigation.replace('Login')} style={styles.loginLink}>
          <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
      {/* CustomAlert */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onConfirm={() => setAlertVisible(false)}
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
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 25,
    height: 50,
    marginBottom: 15,
    paddingHorizontal: 20,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    fontSize: 16,
  },
  passwordInputContainer: {
    position: 'relative',
    marginBottom: 15,
    width: '100%',
  },
  inputWithIcon: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 25,
    height: 50,
    paddingHorizontal: 20,
    paddingRight: 50, // espace pour l'icône
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    fontSize: 16,
  },
  iconContainer: {
    position: 'absolute',
    right: 15,
    top: 12,
  },
  eyeIcon: {
    fontSize: 22,
    color: '#fff',
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
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff7e5f',
  },
  loginLink: {
    marginTop: 10,
  },
  linkText: {
    color: '#fff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default SignupScreen;
