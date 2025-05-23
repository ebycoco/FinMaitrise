// src/screens/ChangePasswordScreen.tsx
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'ChangePassword'>;

const ChangePasswordScreen: React.FC<Props> = ({ navigation }) => {
    const { changePassword } = useAuth(); 
    const [currentPwd, setCurrentPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');

    const handleSave = async () => {
        if (!currentPwd || !newPwd || !confirmPwd) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }
        if (newPwd !== confirmPwd) {
            Alert.alert('Erreur', 'Les nouveaux mots de passe ne correspondent pas.');
            return;
        }
        try {
            await changePassword(currentPwd, newPwd);
            Alert.alert('Succès', 'Mot de passe mis à jour.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (e) {
            const error = e as Error;
            Alert.alert('Erreur', error.message || 'Impossible de changer le mot de passe.');
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.container}>
                    <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.header}>
                        <View style={styles.headerRow}>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Ionicons name="arrow-back" size={24} color="#fff" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Changer de mot de passe</Text>
                        </View>
                    </LinearGradient>

                    <View style={styles.form}>
                        <Text style={styles.label}>Mot de passe actuel</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            secureTextEntry
                            value={currentPwd}
                            onChangeText={setCurrentPwd}
                        />

                        <Text style={styles.label}>Nouveau mot de passe</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            secureTextEntry
                            value={newPwd}
                            onChangeText={setNewPwd}
                        />

                        <Text style={styles.label}>Confirmer le nouveau mot de passe</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            secureTextEntry
                            value={confirmPwd}
                            onChangeText={setConfirmPwd}
                        />

                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>Enregistrer</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>
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
        fontSize: 22,
        fontWeight: '700',
        color: '#fff'
    },
    form: {
        marginHorizontal: 20
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 6
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 15
    },
    saveButton: {
        backgroundColor: '#4facfe',
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 10
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    }
});

export default ChangePasswordScreen;
