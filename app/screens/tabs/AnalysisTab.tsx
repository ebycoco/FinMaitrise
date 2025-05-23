// src/screens/tabs/AnalysisTab.tsx
import React, { useState, useEffect, useCallback  } from 'react';
import {
  Dimensions,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  RefreshControl
} from 'react-native';
import {
  BarChart,
  LineChart,
  PieChart
} from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { getMonthlyData, MonthAggregate } from '../../services/dataService';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants';

const screenWidth = Dimensions.get('window').width;
const monthLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

const chartConfig = {
  backgroundGradientFrom: '#f0f4f8',
  backgroundGradientTo: '#f0f4f8',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0,123,255,${opacity})`,
  labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
  style: { borderRadius: 12 },
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: '#007bff'
  },
  propsForLabels: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  formatYLabel: (yValue: string) => {
    const value = Number(yValue);
    if (value >= 1000) {
      return `${Math.round(value / 1000)}K`;
    }
    return value.toString();
  }
};

const formatThousands = (n: string) => {
  const num = parseFloat(n);
  if (isNaN(num)) return n;
  if (num >= 1000) {
    // arrondi à l'entier le plus proche en K
    return `${Math.round(num / 1000)}K`;
  }
  return String(num);
};

const AnalysisTab: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<MonthAggregate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const agg = await getMonthlyData(user.id);
      setData(agg);
    } catch (err) {
      console.error('Erreur en chargeant les données mensuelles :', err);
    }
  }, [user]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    })();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Aucune donnée disponible pour le moment.</Text>
      </View>
    );
  }

  // Prépare les séries
  const labels   = data.map(d => monthLabels[d.month]);
  const expenses = data.map(d => d.expenses);
  const incomes  = data.map(d => d.incomes);

  // Totaux pour le PieChart
  const totalExp = expenses.reduce((sum, val) => sum + val, 0);
  const totalInc = incomes.reduce((sum, val) => sum + val, 0);
  const pieData = [
    {
      name: 'Dépenses',
      population: totalExp,
      color: '#ff6384',
      legendFontColor: '#444',
      legendFontSize: 14
    },
    {
      name: 'Revenus',
      population: totalInc,
      color: '#36A2EB',
      legendFontColor: '#444',
      legendFontSize: 14
    }
  ];

  const formattedExpenses = expenses.map(e => e >= 1000 ? Math.round(e / 1000) : e);

  return (
    <ScrollView contentContainerStyle={styles.container}
    refreshControl={
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={[Colors.accent]}
      />
    }
    >
      <Text style={styles.screenTitle}>Analyse Mensuelle</Text>

      {/* Carte répartition PieChart */}
      <LinearGradient
        colors={['#fff7f8', '#ffffff']}
        style={styles.cardWrapper}
      >
        <View style={[styles.accentBar, { backgroundColor: '#ff6384' }]} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Répartition Dépenses / Revenus</Text>
          <PieChart
            data={pieData}
            width={screenWidth - 32}
            height={180}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="5"
            absolute
            style={styles.pieStyle}
          />
        </View>
      </LinearGradient>

      {/* Carte Dépenses mensuelles */}
      <LinearGradient
        colors={['#fdecea', '#ffffff']}
        style={styles.cardWrapper}
      >
        <View style={[styles.accentBar, { backgroundColor: '#ff6384' }]} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Dépenses mensuelles</Text>
          <BarChart
            data={{ labels, datasets: [{ data: expenses }] }}
            width={screenWidth - 32}
            height={180}
            yAxisLabel=""
            yAxisSuffix=" F"
            chartConfig={chartConfig}
            verticalLabelRotation={30}
            style={styles.chartStyle}
            fromZero
          />
        </View>
      </LinearGradient>

      {/* Carte Revenus mensuels */}
      <LinearGradient
        colors={['#e8f6e8', '#ffffff']}
        style={[styles.cardWrapper,{marginBottom:60,}]}
      >
        <View style={[styles.accentBar, { backgroundColor: '#4caf50', }]} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Revenus mensuels</Text>
          <LineChart
            data={{ labels, datasets: [{ data: incomes }] }}
            width={screenWidth - 32}
            height={180}
            yAxisLabel=""
            yAxisSuffix=" F"
            chartConfig={chartConfig}
            verticalLabelRotation={30}
            bezier
            style={styles.chartStyle}
            fromZero
            formatYLabel={formatThousands}
          />
        </View>
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop:10,
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#f5f7fa'
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center'
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: '#666'
  },
  cardWrapper: {
    flexDirection: 'row',
    borderRadius: 14,
    marginBottom: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    // ombre iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    // ombre Android
    elevation: 4
  },
  accentBar: {
    width: 6
  },
  cardContent: {
    flex: 1,
    padding: 16
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
    textAlign: 'center'
  },
  chartStyle: {
    marginVertical: 4,
    borderRadius: 12
  },
  pieStyle: {
    marginVertical: 8,
    borderRadius: 12
  },
  
});

export default AnalysisTab;
