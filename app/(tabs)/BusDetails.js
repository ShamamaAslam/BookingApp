import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SeatMap from './SeatMap';
import { supabase } from './SupabaseClient';

export default function BusDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengerDetails, setPassengerDetails] = useState(

    Array(Number(params.passengers)).fill({ name: '', age: '', gender: '' })
  );
useEffect(() => {
  async function fetchBuses() {
    try {
      setLoading(true);
      
      // 👇 ADD THIS DEBUG LOG HERE (right after setLoading)
      console.log("Searching for:", {
        from: params.from,
        to: params.to,
        date: new Date(params.date).toISOString(),
        operator: params.operator || 'Any Operator'
      });
      
      // Keep the rest of your existing code below
      await new Promise(resolve => setTimeout(resolve, 1000));
      let query = supabase
        .from('buses')
        // ... rest of your query
    } catch (err) {
      // ... error handling
    } finally {
      setLoading(false);
    }
  }

  fetchBuses();
}, []);
  useEffect(() => {
    async function fetchBusDetails() {
      try {
        const { data, error } = await supabase
          .from('buses')
          .select('*')
          .eq('id', params.busId)
          .single();

        if (error) throw error;
        setBus(data);
      } catch (error) {
        console.error('Error fetching bus details:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBusDetails();
  }, []);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSeatSelection = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(seat => seat !== seatNumber));
    } else {
      if (selectedSeats.length < params.passengers) {
        setSelectedSeats([...selectedSeats, seatNumber]);
      }
    }
  };

  const handleProceedToPayment = () => {
 console.log('Attempting to navigate to payment...'); 
  console.log('Selected seats:', selectedSeats); 

    if (selectedSeats.length !== Number(params.passengers)) {
      alert(`Please select ${params.passengers} seat(s)`);
      return;
    }

    router.push({
      pathname: '/(tabs)/payment',
      params: {
        busId: params.busId,
        from: params.from,
        to: params.to,
        date: params.date,
        passengers: params.passengers,
        selectedSeats: selectedSeats.join(','),
        totalPrice: (bus.price * params.passengers).toString()
      }
    });
  };

  if (loading || !bus) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading bus details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{bus.operator}</Text>
        <Text style={styles.busType}>{bus.type}</Text>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routeTiming}>
          <Text style={styles.time}>{formatTime(bus.departure_time)}</Text>
          <Text style={styles.city}>{params.from}</Text>
        </View>
        
        <View style={styles.durationContainer}>
          <Text style={styles.durationText}>{bus.duration} hrs</Text>
          <View style={styles.durationLine} />
        </View>
        
        <View style={styles.routeTiming}>
          <Text style={styles.time}>{formatTime(bus.arrival_time)}</Text>
          <Text style={styles.city}>{params.to}</Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Departure Date:</Text>
          <Text style={styles.detailValue}>{new Date(params.date).toDateString()}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Amenities:</Text>
          <Text style={styles.detailValue}>{bus.amenities}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Passengers:</Text>
          <Text style={styles.detailValue}>{params.passengers}</Text>
        </View>
      </View>

      <View style={styles.seatSelection}>
        <Text style={styles.sectionTitle}>Select Seats ({params.passengers} needed)</Text>
       <SeatMap
  seats={bus.seat_map}
  selectedSeats={selectedSeats}
  onSeatSelect={setSelectedSeats}
  maxSelections={Number(params.passengers)}
  busType={bus.type.toLowerCase()} 
/>

        <View style={styles.seatLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.seatSample, styles.available]} />
            <Text>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.seatSample, styles.selected]} />
            <Text>Selected</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.seatSample, styles.booked]} />
            <Text>Booked</Text>
          </View>
        </View>
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.priceLabel}>Total Price:</Text>
        <Text style={styles.priceValue}>Rs. {bus.price * params.passengers}</Text>
      </View>

      <TouchableOpacity 
        style={styles.proceedButton}
        onPress={handleProceedToPayment}
      >
        <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    marginBottom: 20,
    alignItems: 'center'
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50'
  },
  busType: {
    color: '#7F8C8D',
    fontSize: 14
  },
  routeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#EBF5FB',
    borderRadius: 8
  },
  routeTiming: {
    alignItems: 'center',
    flex: 1
  },
  time: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50'
  },
  city: {
    color: '#7F8C8D',
    fontSize: 14
  },
  durationContainer: {
    alignItems: 'center',
    flex: 1
  },
  durationText: {
    color: '#7F8C8D'
  },
  durationLine: {
    height: 1,
    width: '80%',
    backgroundColor: '#BDC3C7',
    marginVertical: 4
  },
  detailsContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F8F9F9',
    borderRadius: 8
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#2C3E50'
  },
  detailValue: {
    color: '#7F8C8D'
  },
  seatSelection: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12
  },
  busLayout: {
    width: '100%',
    height: 200,
    marginBottom: 12
  },
  seatLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10
  },
  legendItem: {
    alignItems: 'center'
  },
  seatSample: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginBottom: 4
  },
  available: {
    backgroundColor: '#27AE60'
  },
  selected: {
    backgroundColor: '#2E86C1'
  },
  booked: {
    backgroundColor: '#E74C3C'
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#EBF5FB',
    borderRadius: 8
  },
  priceLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50'
  },
  priceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E86C1'
  },
  proceedButton: {
    backgroundColor: '#2E86C1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  proceedButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  }
});