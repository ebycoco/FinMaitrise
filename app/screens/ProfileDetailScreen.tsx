// src/screens/ProfileDetailScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import CustomAlert from '../components/CustomAlert';
import { UserProfile } from '../firebase/firestore';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileDetail'>;

const ProfileDetailScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateUserProfile } = useAuth();
  // États locaux pour l’édition
  const [name, setName] = useState(user?.name || '');
  const [userName, setUserName] = useState(user?.userName || '');
  const [numberTel, setNumberTel] = useState(user?.numberTel || '');
  const [contry, setContry] = useState(user?.contry || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [uploading, setUploading] = useState(false);

  // États pour CustomAlert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const pickImage = async () => {
    // 1) Demande de permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Permission refusée', 'Nous avons besoin de l’accès à vos photos pour choisir un avatar.');
      return;
    }

    // 2) Ouvre la galerie
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled) return;  // <— anglais US

    const asset = result.assets[0];
    if (!asset.uri) {
      console.warn('Aucun URI récupéré');
      return;
    }

    try {
      setUploading(true);
      // 3) Prépare le blob
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      // 4) Upload dans Storage
      const storage = getStorage();
      const fileRef = ref(storage, `avatars/${user!.id}_${Date.now()}.jpg`);
      await uploadBytes(fileRef, blob, { contentType: 'image/jpeg' });
      // 5) Récupère l’URL
      const url = await getDownloadURL(fileRef);
      setAvatar(url);
    } catch (err: any) {
      console.error('Upload avatar échoué', err);
      showAlert('Erreur', 'Impossible d’uploader l’image, réessayez plus tard.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    const updatedData: Partial<UserProfile> = {
      name,
      userName,
      numberTel,
      contry,
      email,
      avatar,
    };
    try {
      await updateUserProfile(user.id, updatedData);
      navigation.goBack();
    } catch (error) {
      console.error('Erreur de mise à jour :', error);
      showAlert('Erreur', 'Impossible de sauvegarder le profil.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient colors={['#ff7e5f', '#feb47b']} style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Mon Profil</Text>
          </View>
        </LinearGradient>

        <View style={styles.avatarSection}>
          {avatar
            ? <Image source={{ uri: avatar }} style={styles.avatar} />
            : <Ionicons name="person-circle-outline" size={100} color="#ccc" />
          }
          <TouchableOpacity
            style={styles.photoButton}
            disabled={uploading}
          >
            {uploading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.photoButtonText}>Choisir une photo</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {/** -- Champs du formulaire -- **/}
          <Text style={styles.label}>Nom</Text>
          <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Nom" />

          <Text style={styles.label}>Prénom</Text>
          <TextInput value={userName} onChangeText={setUserName} style={styles.input} placeholder="Prénom" />

          <Text style={styles.label}>Numéro tel</Text>
          <TextInput value={numberTel} onChangeText={setNumberTel} style={styles.input} placeholder="+225 ..." />

          <Text style={styles.label}>Pays</Text>
          <TextInput value={contry} onChangeText={setContry} style={styles.input} placeholder="Côte d'Ivoire" />

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Votre CustomAlert */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        confirmText="OK"
        onConfirm={() => setAlertVisible(false)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { paddingBottom: 40 },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingTop: 50,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 16,
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatar: {
    width: 100, height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  photoButton: {
    backgroundColor: '#feb47b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  photoButtonText: {
    color: '#fff',
    fontWeight: '600'
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
    marginBottom: 15,
    fontSize: 16,
    color: '#333'
  },
  saveButton: {
    backgroundColor: '#ff7e5f',
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

export default ProfileDetailScreen;
