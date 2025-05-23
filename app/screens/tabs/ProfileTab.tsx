// src/screens/tabs/ProfileTab.tsx
import React, { useState,useRef, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import CustomLoader from '../../components/CustomLoader';

type ProfileNavProp = NativeStackNavigationProp<RootStackParamList, 'ProfileDetail'>;

const { width: screenWidth } = Dimensions.get('window');

const ProfileTab: React.FC = () => {
  // 1. Ajoutez un état isLoading
  const [isLoading, setIsLoading] = useState(true);
  const { user, isPremium, upgradeToPremium } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<ProfileNavProp>();

  useEffect(() => {
    setIsLoading(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
    setIsLoading(false);
  }, []);
 
  const handleUpgrade = async () => {
    await upgradeToPremium();
  };
  if (isLoading) {
      return <CustomLoader />;
    }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <LinearGradient
          colors={['#ff7e5f', '#feb47b']}
          style={styles.header}
        >
          <Animated.View style={[styles.avatarContainer, { opacity: fadeAnim }]}>
            <Image
              source={
                user?.avatar
                  ? { uri: user.avatar }
                  : require('../../../assets/avatar.jpg')
              }
              style={styles.avatar}
            />
          </Animated.View>
          <Animated.Text style={[styles.name, { opacity: fadeAnim }]}>
            {user?.name || 'Utilisateur'}
          </Animated.Text>
          <Animated.Text style={[styles.email, { opacity: fadeAnim }]}>
            {user?.email || 'email@exemple.com'}
          </Animated.Text>
          {isPremium && (
            <View style={styles.premiumBadge}>
              <Ionicons name="star" size={16} color="#fff" />
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
        </LinearGradient>

        {!isPremium && (
          <View style={styles.upgradeCard}>
            <Text style={styles.upgradeTitle}>Passez à Premium</Text>
            <Text style={styles.upgradeDesc}>
              Débloquez des recommandations intelligentes, synchronisation multi-appareils et plus encore.
            </Text>
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
              <Text style={styles.upgradeButtonText}>Découvrir Premium</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionItem} activeOpacity={0.7} onPress={() => navigation.navigate('ProfileDetail')}>
            <Ionicons name="person-circle-outline" size={24} color="#ff7e5f" />
            <Text style={styles.optionText}>Mon profil</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  container: {
    paddingBottom: 90
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    marginBottom: 20,
    position: 'relative'
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    padding: 5,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff'
  },
  email: {
    fontSize: 14,
    color: '#ffe5d9',
    marginTop: 4
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    right: 20
  },
  premiumText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4
  },
  upgradeCard: {
    backgroundColor: '#fdf5e6',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10
  },
  upgradeDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 20
  },
  upgradeButton: {
    backgroundColor: '#ff7e5f',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  },
  optionsContainer: {
    marginHorizontal: 20
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  optionText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: '#333'
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff6b6b',
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10
  }
});

export default ProfileTab;
