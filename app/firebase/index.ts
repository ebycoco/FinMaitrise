import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
// @ts-ignore
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC7_FoXe_I2aHb0Cq2-tY1zdEVvckz3pHs",
  authDomain: "finmaitrise.firebaseapp.com",
  projectId: "finmaitrise",
  storageBucket: "finmaitrise.firebasestorage.app",
  messagingSenderId: "355808272487",
  appId: "1:355808272487:web:638b1c0597eb15ae55b4c2"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);

export { auth, db,app };
