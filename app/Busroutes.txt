import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from './SupabaseClient';

export default function BusRoutes() {
  const router = useRouter();
  const { from, to, date, operator, passengers } = useLocalSearchParams();

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBuses() {
      try {
        setLoading(true);

        console.log("Fetching buses with:", { from, to, date, operator });

        const searchDate = new Date(date);
        const nextWeek = new Date(searchDate);
        nextWeek.setDate(nextWeek.getDate() + 7);

        let query = supabase
          .from('buses')
          .select('*')
          .ilike('from_city', from?.trim())
          .ilike('to_city', to?.trim())
          .gte('departure_time', searchDate.toISOString())
          .lte('departure_time', nextWeek.toISOString());

        if (operator && operator !== 'Any Operator') {
          query = query.ilike('operator', operator.trim());
        }

        const { data, error } = await query;

        if (error) throw error;
        setBuses(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBuses();
  }, [from, to, date, operator]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderBusItem = ({ item }) => (
    <TouchableOpacity
      style={styles.busCard}
      onPress={() => router.push({
        pathname: '/BusDetails',
        params: {
          busId: item.id,
          from,
          to,
          date,
          passengers
        }
      })}
    >
      <View style={styles.busHeader}>
        <Text style={styles.busOperator}>{item.operator}</Text>
        <Text style={styles.busType}>{item.type} • {item.amenities}</Text>
      </View>

      <View style={styles.timingContainer}>
        <View style={styles.timing}>
          <Text style={styles.time}>{formatTime(item.departure_time)}</Text>
          <Text style={styles.city}>{from}</Text>
        </View>

        <View style={styles.duration}>
          <Text style={styles.durationText}>{item.duration} hrs</Text>
          <View style={styles.durationLine} />
        </View>

        <View style={styles.timing}>
          <Text style={styles.time}>{formatTime(item.arrival_time)}</Text>
          <Text style={styles.city}>{to}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.price}>Rs. {item.price * passengers}</Text>
        <Text style={item.available_seats > 5 ? styles.seatsAvailable : styles.seatsLimited}>
          {item.available_seats > 5 ? `${item.available_seats} seats available` : 'Only ' + item.available_seats + ' left'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2E86C1" />
        <Text style={styles.loadingText}>Finding buses for you...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error loading buses: {error}</Text>
      </View>
    );
  }

  if (buses.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noBusesText}>No buses found for your search</Text>
        <TouchableOpacity
          style={styles.searchAgainButton}
          onPress={() => router.back()}
        >
          <Text style={styles.searchAgainText}>Search Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchSummary}>
        <Text style={styles.summaryText}>
          {from} to {to} • {new Date(date).toDateString()} • {passengers} {passengers > 1 ? 'passengers' : 'passenger'}
        </Text>
      </View>

      <FlatList
        data={buses}
        renderItem={renderBusItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    marginTop: 10,
    color: '#555'
  },
  errorText: {
    color: 'red',
    textAlign: 'center'
  },
  noBusesText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20
  },
  searchAgainButton: {
    backgroundColor: '#2E86C1',
    padding: 12,
    borderRadius: 8,
    width: '60%',
    alignItems: 'center'
  },
  searchAgainText: {
    color: 'white',
    fontWeight: 'bold'
  },
  searchSummary: {
    backgroundColor: '#EBF5FB',
    padding: 12,
    marginBottom: 8
  },
  summaryText: {
    color: '#2874A6',
    textAlign: 'center'
  },
  list: {
    padding: 12,
    paddingBottom: 20
  },
  busCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  busHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  busOperator: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50'
  },
  busType: {
    color: '#7F8C8D',
    fontSize: 12
  },
  timingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  timing: {
    alignItems: 'center',
    flex: 1
  },
  time: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50'
  },
  city: {
    color: '#7F8C8D',
    fontSize: 12
  },
  duration: {
    alignItems: 'center',
    flex: 1
  },
  durationText: {
    color: '#7F8C8D',
    fontSize: 12
  },
  durationLine: {
    height: 1,
    width: '80%',
    backgroundColor: '#BDC3C7',
    marginVertical: 4
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EAEDED',
    paddingTop: 12
  },
  price: {
    fontWeight: 'bold',
    color: '#2E86C1',
    fontSize: 16
  },
  seatsAvailable: {
    color: '#27AE60'
  },
  seatsLimited: {
    color: '#E74C3C'
  }
});
