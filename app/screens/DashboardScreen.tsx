// src/screens/DashboardScreen.tsx
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions
} from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeTab from './tabs/HomeTab';
import ExpensesTab from './tabs/ExpensesTab';
import BudgetsTab from './tabs/BudgetsTab';
import AnalysisTab from './tabs/AnalysisTab';
import ProfileTab from './tabs/ProfileTab';

import { Colors, TabIcons } from '../constants';
import { Strings } from '../constants/strings';

const Tab = createBottomTabNavigator();
type IoniconsName = keyof typeof Ionicons.glyphMap;

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  // largeur écran / nombre d'onglets
  const screenWidth = Dimensions.get('window').width;
  const tabWidth = screenWidth / state.routes.length;

  const translateX = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
      stiffness: 200,
      damping: 20
    }).start();
  }, [state.index, tabWidth]);

  return (
    <View style={styles.tabBarContainer}>
      <Animated.View
        style={[
          styles.indicator,
          {
            width: tabWidth * 0.4,
            left: (tabWidth - tabWidth * 0.4) / 2,
            transform: [{ translateX }]
          }
        ]}
      />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : typeof options.title === 'string'
            ? options.title
            : route.name;
        const isFocused = state.index === index;

        const rawIcon = TabIcons[route.name as keyof typeof TabIcons] || 'ellipse-outline';
        const iconName = rawIcon as IoniconsName;
        const color = isFocused ? Colors.accent : Colors.textSecondary;
        const size = isFocused ? 28 : 24;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            activeOpacity={0.7}
            style={[styles.tabButton, { width: tabWidth }]}
            onPress={() => navigation.navigate(route.name)}
          >
            <Ionicons name={iconName} size={size} color={color} />
            <Text style={[styles.tabLabel, { color, fontSize: isFocused ? 14 : 12 }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const DashboardScreen: React.FC = () => (
  <Tab.Navigator
    tabBar={props => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen
      name="Accueil"
      component={HomeTab}
      options={{ tabBarLabel: Strings.labels.tabs.accueil }}
    />
    <Tab.Screen
      name="Dépenses"
      component={ExpensesTab}
      options={{ tabBarLabel: Strings.labels.tabs.depseses }}
    />
    <Tab.Screen
      name="Budgets"
      component={BudgetsTab}
      options={{ tabBarLabel: Strings.labels.tabs.budgets }}
    />
    <Tab.Screen
      name="Analyse"
      component={AnalysisTab}
      options={{ tabBarLabel: Strings.labels.tabs.analyse }}
    />
    <Tab.Screen
      name="Profil"
      component={ProfileTab}
      options={{ tabBarLabel: Strings.labels.tabs.profil }}
    />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 5,
    left: 0,
    right: 0,
    height: 60,
    marginHorizontal: 5,
    backgroundColor: Colors.background,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center'
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabLabel: {
    marginTop: 2,
    marginBottom: 5,
    fontWeight: '600'
  },
  indicator: {
    position: 'absolute',
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.accent,
    bottom: 3
  }
});

export default DashboardScreen;
