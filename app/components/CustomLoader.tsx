// src/components/CustomLoader.tsx
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';

const CustomLoader: React.FC = () => {
  // trois animations de scale pour les trois points
  const anims = [useRef(new Animated.Value(0.3)).current,
                 useRef(new Animated.Value(0.3)).current,
                 useRef(new Animated.Value(0.3)).current];

  useEffect(() => {
    anims.forEach((anim, idx) => {
      // boucle infinie : grow → shrink
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1.2,
            duration: 500,
            delay: idx * 200,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* Cercle gradient + icône */}
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        style={styles.iconWrapper}
      >
        <Ionicons name="wallet-outline" size={48} color="#fff" />
      </LinearGradient>

      {/* Trois points animés */}
      <View style={styles.dotsContainer}>
        {anims.map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              { transform: [{ scale: anim }] }
            ]}
          />
        ))}
      </View>

      <Text style={styles.text}>Chargement en cours…</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    width: 80,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.accent,
  },
  text: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});

export default CustomLoader;
