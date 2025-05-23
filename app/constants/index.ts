// src/constants/index.ts

/**
 * Palette de couleurs utilisée dans toute l'application
 */
export const Colors = {
    primary: '#4facfe',      // dégradé bleu clair
    secondary: '#00f2fe',    // dégradé bleu foncé
    accent: '#00bfa5',       // turquoise pour FAB
    danger: '#ff6b6b',       // rouge pour dépenses
    success: '#4caf50',      // vert pour revenus
    textPrimary: '#333',
    textSecondary: '#666',
    background: '#f5f7fa',
    white: '#ffffff', 
    lightGray: '#d3d3d3', 
  };
  
  /**
   * Mois en français pour l'affichage
   */
  export const MonthsFR = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  
  /**
   * Icônes par catégorie de dépenses
   */
  export const CategoryIcons: Record<string, keyof typeof import('@expo/vector-icons').Ionicons.glyphMap> = {
    food: 'restaurant-outline',
    transport: 'bus-outline',
    shopping: 'cart-outline',
    entertainment: 'film-outline',
  };
  
  /**
   * Icônes pour la barre de navigation
   */
  export const TabIcons: Record<string, keyof typeof import('@expo/vector-icons').Ionicons.glyphMap> = {
    Accueil: 'home-outline',
    Dépenses: 'cash-outline',
    Budgets: 'pie-chart-outline',
    Analyse:   'bar-chart-outline',
    Profil: 'person-outline',
  };
  
  /**
   * Dimensions globales
   */
  import { Dimensions, Platform, UIManager } from 'react-native';
  const { width } = Dimensions.get('window');
  export const Layout = {
    screenWidth: width,
    tabCount: 4,
    tabWidth: width / 4,
  };
  
  // Activer LayoutAnimation sur Android
  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
  