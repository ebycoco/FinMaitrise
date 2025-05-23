// src/components/FAB.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet, GestureResponderEvent, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';

interface FABProps {
  /** état ouvert ou fermé pour changer l'icône */
  isOpen: boolean;
  /** callback au clic */
  onPress: (event?: GestureResponderEvent) => void;
  /** couleur de fond personnalisée */
  backgroundColor?: string;
  /** icône affichée quand isOpen = true */
  iconOpen?: keyof typeof Ionicons.glyphMap;
  /** icône affichée quand isOpen = false */
  iconClose?: keyof typeof Ionicons.glyphMap;
  /** style supplémentaire */
  style?: ViewStyle;
}

const FAB: React.FC<FABProps> = ({
  isOpen,
  onPress,
  backgroundColor = Colors.accent,
  iconOpen = 'close',
  iconClose = 'add',
  style
}) => {
  const name = isOpen ? iconOpen : iconClose;

  return (
    <TouchableOpacity
      style={[styles.fab, { backgroundColor }, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={name} size={28} color={Colors.white} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 8,
    width: 40,
    height: 40,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 35
  }
});

export default FAB;
