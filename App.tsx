import 'react-native-gesture-handler';  
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import FlashMessage from "react-native-flash-message";

import './src/firebase'; 
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
      <FlashMessage position="bottom"/>
    </GestureHandlerRootView>
  );
}

