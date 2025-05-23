// src/components/CustomAlert.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants';
import { Strings } from '../constants/strings';

const { width } = Dimensions.get('window');

interface CustomAlertProps {
  visible: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title = Strings.alerts.successTitle,
  message,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Annuler'
}) => {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.header}>
            <Text style={styles.headerText}>{title}</Text>
          </LinearGradient>
          <View style={styles.body}>
            <Text style={styles.message}>{message}</Text>
          </View>
          <View style={styles.actions}>
            {onCancel && (
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
                <Text style={[styles.buttonText, styles.cancelText]}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={onConfirm}>
              <Text style={styles.buttonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const CARD_WIDTH = width * 0.8;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden'
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  headerText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center'
  },
  body: {
    padding: 16
  },
  message: {
    fontSize: 16,
    color: Colors.textPrimary,
    textAlign: 'center'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 8
  },
  button: {
    marginLeft: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8
  },
  confirmButton: {
    backgroundColor: Colors.danger
  },
  cancelButton: {
    backgroundColor: Colors.lightGray
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white
  },
  cancelText: {
    color: Colors.textSecondary
  }
});

export default CustomAlert;
