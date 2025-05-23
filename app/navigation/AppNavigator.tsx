// src/navigation/AppNavigator.tsx
import React from 'react';
import {TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Importation des écrans
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import DashboardScreen from '../screens/DashboardScreen';
import PremiumUpgradeScreen from '../screens/PremiumUpgradeScreen';
import ProfileDetailScreen from '../screens/ProfileDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import HelpAndSupportScreen from '../screens/HelpAndSupportScreen';
import CategoryScreen from '../screens/CategoryScreen';


// Définition des types de navigation (optionnel mais recommandé avec TypeScript)
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  Dashboard: undefined;
  PremiumUpgrade: undefined;
  ProfileDetail: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  NotificationSettings: undefined;
  HelpAndSupport: undefined;
  Categories: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        {/* Nous démarrons avec l’écran de Splash */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        {/* Ensuite, l’écran d’onboarding est facultatif */}
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        {/* Écrans d'authentification */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        {/* Une fois authentifié, on redirige vers le Dashboard */}
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="PremiumUpgrade" component={PremiumUpgradeScreen} />
        <Stack.Screen
          name="ProfileDetail"
          component={ProfileDetailScreen}
          options={{
            title: 'Mon profil',
            headerStyle: { backgroundColor: '#ff7e5f' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '700' },
          }}
        />
        <Stack.Screen
  name="Settings"
  component={SettingsScreen}
  options={({ navigation }) => ({
    title: 'Paramètres',
    headerStyle: {
      backgroundColor: '#ff7e5f'
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold'
    },
    headerLeft: () => (
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 10 }}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
    )
  })}
/>
<Stack.Screen
  name="ChangePassword"
  component={ChangePasswordScreen}
  options={{
    headerShown: false
  }}
/>
<Stack.Screen
  name="NotificationSettings"
  component={NotificationSettingsScreen}
  options={{ headerShown: true }} // pour utiliser l'en-tête défini dans le composant
/>
<Stack.Screen
  name="HelpAndSupport"
  component={HelpAndSupportScreen}
  options={{ headerShown: false }}
/>
<Stack.Screen
  name="Categories"
  component={CategoryScreen}
  options={{ title: "Catégories" }}
/>

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
