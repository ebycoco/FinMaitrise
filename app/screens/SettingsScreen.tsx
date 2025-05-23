// src/screens/SettingsScreen.tsx
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    StyleSheet,
    Switch,
    TouchableOpacity
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLayoutEffect } from 'react';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
    const { logout } = useAuth();
    const [darkMode, setDarkMode] = useState(false); 
    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
            ),
            headerStyle: {
                backgroundColor: '#ff7e5f',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
            title: 'Paramètres',
        });
    }, [navigation]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.header}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Paramètres</Text>
                    </View>
                </LinearGradient>


                <View style={styles.optionItem}>
                    <Ionicons name="moon-outline" size={24} color="#4facfe" />
                    <Text style={styles.optionText}>Mode Sombre</Text>
                    <Switch
                        value={darkMode}
                        onValueChange={setDarkMode}
                    />
                </View> 

                <TouchableOpacity style={styles.optionItem} onPress={() => navigation.navigate('ChangePassword')}>
                    <Ionicons name="key-outline" size={24} color="#4facfe" />
                    <Text style={styles.optionText}>Changer de mot de passe</Text>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionItem} onPress={() => navigation.navigate('ProfileDetail')}>
                    <Ionicons name="person-circle-outline" size={24} color="#4facfe" />
                    <Text style={styles.optionText}>Mettre à jour mon profil</Text>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Ionicons name="log-out-outline" size={20} color="#fff" />
                    <Text style={styles.logoutText}>Se déconnecter</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    container: { paddingBottom: 40 },
    header: {
        alignItems: 'center',
        paddingVertical: 20,
        marginBottom: 20,
        paddingTop: 50,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
    },

    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff'
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fafafa',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 15,
        marginHorizontal: 20,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
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
        marginTop: 20,
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

export default SettingsScreen;

