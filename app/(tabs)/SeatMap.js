import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from './SupabaseClient';

const SeatMap = ({ maxSelections = 4, showLegend = true }) => {
  const { width } = Dimensions.get('window');
  const router = useRouter();
  const seatWidth = width * 0.08;
  const seatHeight = seatWidth;
  const gapSize = width * 0.02;
  const [rows, setRows] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingGender, setBookingGender] = useState(null);
  const [seatPrice] = useState(1500);

  useEffect(() => {
    const fetchSeats = async () => {
      // Test data with pre-booked seats
      const mockBookedSeats = [
        { number: '1', booked: true, gender: 'female' },
        { number: '2', booked: true, gender: 'male' },
        { number: '5', booked: true, gender: 'female' },
        { number: '8', booked: true, gender: 'male' },
      ];

      const { data, error } = await supabase
        .from('seats')
        .select('*')
        .order('number', { ascending: true });

      if (error) {
        console.error('Error fetching seats:', error);
        return;
      }

      // Merge with test data
      const mergedData = data.map(seat => {
        const mockSeat = mockBookedSeats.find(s => s.number === seat.number);
        return mockSeat || seat;
      });

      const seatsMap = {};
      mergedData.forEach(seat => {
        seatsMap[seat.number] = {
          ...seat,
          status: seat.booked ? 'booked' : 'available'
        };
      });

      const newRows = [
        [null, null, seatsMap['1'], seatsMap['2']],
        [seatsMap['3'], seatsMap['4'], seatsMap['5'], seatsMap['6']],
        [seatsMap['7'], seatsMap['8'], seatsMap['9'], seatsMap['10']],
        [seatsMap['11'], seatsMap['12'], seatsMap['13'], seatsMap['14']],
        [seatsMap['15'], seatsMap['16'], seatsMap['17'], seatsMap['18']],
        [seatsMap['19'], seatsMap['20'], seatsMap['21'], seatsMap['22']],
        [seatsMap['23'], seatsMap['24'], seatsMap['25'], seatsMap['26']],
        [seatsMap['27'], seatsMap['28'], seatsMap['29'], seatsMap['30']],
        [seatsMap['31'], seatsMap['32'], seatsMap['33'], seatsMap['34']],
        [seatsMap['35'], seatsMap['36'], seatsMap['37'], seatsMap['38']],
        [seatsMap['39'], seatsMap['40'], seatsMap['41'], seatsMap['42']],
        [null, null, seatsMap['43'], seatsMap['44']]
      ];

      setRows(newRows);
    };

    fetchSeats();

    const subscription = supabase
      .channel('seats_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seats' }, fetchSeats)
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  const handlePress = (seatNumber) => {
    const seat = rows.flat().find(s => s?.number === seatNumber);
    if (!seat || seat.status === 'booked') return;

    setSelectedSeats(prev => {
      if (prev.includes(seatNumber)) {
        return prev.filter(num => num !== seatNumber);
      }
      if (prev.length >= maxSelections) {
        Alert.alert(`Maximum ${maxSelections} seats allowed`);
        return prev;
      }
      return [...prev, seatNumber];
    });
  };

const checkGenderRestrictions = () => {
  if (!bookingGender) return { hasConflict: false };

  for (const seatNumber of selectedSeats) {
    const seat = rows.flat().find(s => s?.number === seatNumber);
    if (!seat) continue;

    for (const row of rows) {
      const leftSide = row.slice(0, 2);  // seats on left of aisle
      const rightSide = row.slice(2, 4); // seats on right of aisle

      let currentSide = null;

      if (leftSide.some(s => s?.number === seatNumber)) {
        currentSide = leftSide;
      } else if (rightSide.some(s => s?.number === seatNumber)) {
        currentSide = rightSide;
      }

      if (currentSide) {
        const seatIndex = currentSide.findIndex(s => s?.number === seatNumber);
        const adjacentIndexes = [seatIndex - 1, seatIndex + 1].filter(i => i >= 0 && i < currentSide.length);

        for (let i of adjacentIndexes) {
          const adjSeat = currentSide[i];
          if (adjSeat && adjSeat.status === 'booked' && adjSeat.gender !== bookingGender) {
            return {
              hasConflict: true,
              seatNumber,
              adjacentSeat: adjSeat.number,
              adjacentGender: adjSeat.gender
            };
          }
        }
      }
    }
  }

  return { hasConflict: false };
};


  const handleBookSeats = async () => {
    if (!selectedSeats.length) {
      Alert.alert('No Seats Selected', 'Please select at least one seat');
      return;
    }
    if (!bookingGender) {
      Alert.alert('Gender Required', 'Please select your gender');
      return;
    }

    const { hasConflict, adjacentSeat, adjacentGender } = checkGenderRestrictions();
    if (hasConflict) {
      Alert.alert(
        'Gender Restriction',
        `As ${bookingGender}, you cannot sit next to ${adjacentGender} (Seat ${adjacentSeat})`
      );
      return;
    }

    try {
      const { error } = await supabase
        .from('seats')
        .update({ 
          booked: true,
          gender: bookingGender,
          booked_at: new Date().toISOString()
        })
        .in('number', selectedSeats);

      if (error) throw error;

      router.push({
        pathname: '/payment',
        params: {
          seats: selectedSeats.join(','),
          gender: bookingGender,
          seatCount: selectedSeats.length,
          totalAmount: selectedSeats.length * seatPrice
        }
      });
    } catch (error) {
      console.error('Error booking seats:', error);
      Alert.alert('Booking Failed', 'There was an error booking your seats');
    }
  };

  const getSeatStyle = (seat) => {
    if (!seat) return styles.emptySeat;
    if (seat.status === 'booked') {
      return seat.gender === 'male' ? styles.maleBookedSeat : styles.femaleBookedSeat;
    }
    if (selectedSeats.includes(seat.number)) {
      return styles.selectedSeat;
    }
    return styles.availableSeat;
  };

  const renderSeat = (seat, index) => (
    <TouchableOpacity
      key={`seat-${index}`}
      style={[styles.seat, { width: seatWidth, height: seatWidth }, getSeatStyle(seat)]}
      onPress={() => seat && handlePress(seat.number)}
      activeOpacity={0.7}
    >
      <Text style={styles.seatText}>{seat?.number || ''}</Text>
    </TouchableOpacity>
  );

  const renderRow = (row, i) => (
    <View key={`row-${i}`} style={styles.row}>
      <View style={styles.sideContainer}>{renderSeat(row[0], 0)}{renderSeat(row[1], 1)}</View>
      <View style={styles.sideContainer}>{renderSeat(row[2], 2)}{renderSeat(row[3], 3)}</View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.busType}>Executive Bus - Available: {rows.flat().filter(s => s?.status === 'available').length}</Text>
        <View>{rows.map((row, index) => renderRow(row, index))}</View>
      </ScrollView>

      <View style={styles.genderButtons}>
        <TouchableOpacity 
          style={[styles.genderButton, bookingGender === 'female' && styles.genderButtonSelected]} 
          onPress={() => setBookingGender('female')}
        >
          <Text style={styles.genderButtonText}>Female</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.genderButton, bookingGender === 'male' && styles.genderButtonSelected]} 
          onPress={() => setBookingGender('male')}
        >
          <Text style={styles.genderButtonText}>Male</Text>
        </TouchableOpacity>
      </View>

      {selectedSeats.length > 0 && (
        <TouchableOpacity style={styles.bookButton} onPress={handleBookSeats}>
          <Text style={styles.bookButtonText}>Proceed to Payment</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
  scrollContainer: { paddingVertical: 10 },
  row: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12 },
  sideContainer: { flexDirection: 'row', marginHorizontal: 12 },
  seat: { 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 50,
    marginHorizontal: 3,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  seatText: { color: '#fff', fontSize: 12 },
  availableSeat: { backgroundColor: '#4CAF50' },
  selectedSeat: { backgroundColor: '#FF9800' },
  maleBookedSeat: { backgroundColor: '#2196F3' },
  femaleBookedSeat: { backgroundColor: '#FF1493' },
  emptySeat: { backgroundColor: 'transparent' },
  genderButtons: { flexDirection: 'row', justifyContent: 'center', marginVertical: 10, gap: 20 },
  genderButton: { backgroundColor: '#ccc', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20 },
  genderButtonSelected: { backgroundColor: '#003580' },
  genderButtonText: { color: '#fff', fontWeight: 'bold' },
  bookButton: { margin: 10, backgroundColor: '#003580', padding: 12, borderRadius: 8, alignItems: 'center' },
  bookButtonText: { color: '#fff', fontWeight: 'bold' },
  busType: { textAlign: 'center', fontWeight: 'bold', fontSize: 14, marginBottom: 10 },
});

export default SeatMap;