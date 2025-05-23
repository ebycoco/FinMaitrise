// src/components/Logo.tsx
import React from 'react';
import { Image, StyleSheet, ImageStyle } from 'react-native';

// Chargement statique du logo depuis le dossier assets
const logo = require('../../assets/logo.png');

interface LogoProps {
  /** Styles additionnels pour ajuster la taille ou marges */
  style?: ImageStyle;
}

/**
 * Composant Logo réutilisable
 * Affiche l'icône de l'application
 */
const Logo: React.FC<LogoProps> = ({ style }) => (
  <Image source={logo} style={[styles.logo, style]} resizeMode="contain" />
);

const styles = StyleSheet.create({
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
  }
});

export default Logo;
