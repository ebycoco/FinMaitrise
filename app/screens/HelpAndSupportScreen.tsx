// src/screens/HelpAndSupportScreen.tsx
import React, { useLayoutEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'HelpAndSupport'>;

const HelpAndSupportScreen: React.FC<Props> = ({ navigation }) => {
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Aide & Support',
      headerStyle: { backgroundColor: '#ff7e5f' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: '700' }
    });
  }, [navigation]);

  const openLink = (url: string) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#ff7e5f', '#feb47b']} style={styles.header}>
        <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                                        <Ionicons name="arrow-back" size={24} color="#fff" />
                                    </TouchableOpacity>
        <Text style={styles.headerTitle}>Aide & Support</Text>
        </View>
        
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.container}>
        {/* FAQ Section */}
        <Text style={styles.sectionTitle}>Foire aux Questions</Text>
        <TouchableOpacity style={styles.item} onPress={() => openLink('https://example.com/faq')}>
          <Text style={styles.itemText}>Consulter la FAQ</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        {/* Contact Support */}
        <Text style={styles.sectionTitle}>Nous contacter</Text>
        <TouchableOpacity style={styles.item} onPress={() => openLink('mailto:support@finmaitrise.example')}>
          <Text style={styles.itemText}>support@finmaitrise.example</Text>
          <Ionicons name="mail-outline" size={20} color="#4facfe" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => openLink('tel:+225012345678')}>
          <Text style={styles.itemText}>+225 0153676787</Text>
          <Ionicons name="call-outline" size={20} color="#4caf50" />
        </TouchableOpacity>

        {/* Terms & Privacy */}
        <Text style={styles.sectionTitle}>Informations Légales</Text>
        <TouchableOpacity style={styles.item} onPress={() => openLink('https://example.com/terms')}>
          <Text style={styles.itemText}>Conditions d'utilisation</Text>
          <Ionicons name="document-text-outline" size={20} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => openLink('https://example.com/privacy')}>
          <Text style={styles.itemText}>Politique de Confidentialité</Text>
          <Ionicons name="lock-closed-outline" size={20} color="#999" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: { paddingVertical: Platform.OS === 'ios' ? 60 : 40, alignItems: 'center' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
},
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  container: { padding: 20, paddingBottom: 60 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginTop: 20, marginBottom: 10 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#fafafa',
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  itemText: { fontSize: 16, color: '#333' }
});

export default HelpAndSupportScreen;
