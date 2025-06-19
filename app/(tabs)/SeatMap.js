import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from './SupabaseClient';
const SeatMap = ({ 
  maxSelections = 4,
  showLegend = true 
}) => {
  const { width } = Dimensions.get('window');
  const router = useRouter();
  const seatWidth = width * 0.03;
  const gapSize = width * 0.01;
  const [rows, setRows] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingGender, setBookingGender] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  // Fetch seats from Supabase
  useEffect(() => {
    const fetchSeats = async () => {
      const { data, error } = await supabase
        .from('seats')
        .select('*')
        .order('number', { ascending: true });

      if (!error && data) {
        setRows([
          [null, null, data.find(s => s.number === '1'), data.find(s => s.number === '2')],
          [data.find(s => s.number === '3'), data.find(s => s.number === '4'), 
           data.find(s => s.number === '5'), data.find(s => s.number === '6')],
          [data.find(s => s.number === '7'), data.find(s => s.number === '8'), 
           data.find(s => s.number === '9'), data.find(s => s.number === '10')],
          [data.find(s => s.number === '11'), data.find(s => s.number === '12'), 
           data.find(s => s.number === '13'), data.find(s => s.number === '14')],
          [data.find(s => s.number === '15'), data.find(s => s.number === '16'), 
           data.find(s => s.number === '17'), data.find(s => s.number === '18')],
          [data.find(s => s.number === '19'), data.find(s => s.number === '20'), 
           data.find(s => s.number === '21'), data.find(s => s.number === '22')],
          [data.find(s => s.number === '23'), data.find(s => s.number === '24'), 
           data.find(s => s.number === '25'), data.find(s => s.number === '26')],
          [data.find(s => s.number === '27'), data.find(s => s.number === '28'), 
           data.find(s => s.number === '29'), data.find(s => s.number === '30')],
          [data.find(s => s.number === '31'), data.find(s => s.number === '32'), 
           data.find(s => s.number === '33'), data.find(s => s.number === '34')],
          [data.find(s => s.number === '35'), data.find(s => s.number === '36'), 
           data.find(s => s.number === '37'), data.find(s => s.number === '38')],
          [data.find(s => s.number === '39'), data.find(s => s.number === '40'), 
           data.find(s => s.number === '41'), data.find(s => s.number === '42')],
          [null, null, data.find(s => s.number === '43'), data.find(s => s.number === '44')]
        ]);
      }
    };

    fetchSeats();

    const subscription = supabase
      .channel('seats_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seats' }, fetchSeats)
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  const getAdjacentSeats = (seatNumber) => {
    const seatIndex = rows.flat().findIndex(s => s?.number === seatNumber);
    if (seatIndex === -1) return [];
    
    const flatRows = rows.flat();
    const adjacentIndices = [
      seatIndex - 4, // above
      seatIndex + 4, // below
      seatIndex - 1, // left (if same row)
      seatIndex + 1  // right (if same row)
    ].filter(index => index >= 0 && index < flatRows.length);
    
    return adjacentIndices
      .map(index => flatRows[index])
      .filter(seat => seat !== null && seat !== undefined);
  };

  const canSelectSeat = (seatNumber) => {
    if (!bookingGender) return true;
    
    const adjacentSeats = getAdjacentSeats(seatNumber);
    return adjacentSeats.every(adjSeat => {
      return adjSeat.status !== 'booked' || adjSeat.gender === bookingGender;
    });
  };

  const handlePress = (seatNumber) => {
    const seat = rows.flat().find(s => s?.number === seatNumber);
    if (!seat || seat.status === 'booked') return;
    
    if (bookingGender && !canSelectSeat(seatNumber)) {
      const adjacentSeats = getAdjacentSeats(seatNumber);
      const conflictingSeat = adjacentSeats.find(s => s.status === 'booked' && s.gender !== bookingGender);
      
      Alert.alert(
        'Booking Rule Violation',
        `This seat is adjacent to a ${conflictingSeat.gender} passenger. ` +
        `${bookingGender === 'male' ? 'Males' : 'Females'} can only be seated next to ` +
        `other ${bookingGender === 'male' ? 'males' : 'females'} or empty seats.`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    setSelectedSeats(prev => {
      if (prev.includes(seatNumber)) {
        return prev.filter(num => num !== seatNumber);
      } else {
        return [...prev, seatNumber].slice(0, maxSelections);
      }
    });
  };

  const handleBookSeats = async () => {
    console.log('Selected seats before booking:', selectedSeats); // Debug log
     console.log('Booking gender:', bookingGender); // Debug log
    if (selectedSeats.length === 0) {
      Alert.alert('No Seats Selected', 'Please select at least one seat to book.');
      return;
    }
    
    if (!bookingGender) {
      Alert.alert('Gender Not Selected', 'Please select your gender before booking.');
      return;
    }
    
    for (const seatNumber of selectedSeats) {
      if (!canSelectSeat(seatNumber)) {
        Alert.alert(
          'Booking Rules Changed',
          'Some seats are no longer available according to gender rules. ' +
          'Please review your selection and try again.'
        );
        return;
      }
    }
    
    
  router.push({
    pathname: '/(tabs)/payment',
    params: {
      seats: selectedSeats.join(','),
      gender: bookingGender,
      seatCount: selectedSeats.length,
      totalAmount: selectedSeats.length * 1000
    }
  });
};

  const getSeatStyle = (seat) => {
    if (!seat) return styles.emptySeat;
    const isSelected = selectedSeats.includes(seat.number);
    const isBooked = seat.status === 'booked';
    
    if (isBooked) {
      return seat.gender === 'male' ? styles.maleBookedSeat : styles.femaleBookedSeat;
    }
    if (isSelected) {
      return styles.selectedSeat;
    }
    return styles.availableSeat;
  };

  const renderSeat = (seat, index) => {
    if (!seat) return <View key={`empty-${index}`} style={[styles.emptySeat, { width: seatWidth }]} />;
    
    return (
      <TouchableOpacity
        key={`seat-${seat.number}`}
        style={[styles.seat, { width: seatWidth }, getSeatStyle(seat)]}
        onPress={() => handlePress(seat.number)}
        disabled={seat.status === 'booked'}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.seatText,
          selectedSeats.includes(seat.number) && styles.selectedSeatText,
          seat.status === 'booked' && styles.bookedSeatText
        ]}>
          {seat.number}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderRow = (row, rowIndex) => {
    return (
      <View key={`row-${rowIndex}`} style={[styles.row, { marginBottom: gapSize }]}>
        <View style={styles.sideContainer}>
          {renderSeat(row[0], 0)}
          {renderSeat(row[1], 1)}
        </View>
        <View style={styles.sideContainer}>
          {renderSeat(row[2], 2)}
          {renderSeat(row[3], 3)}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.busHeader}>
        <View style={styles.driverArea}>
          <Text style={styles.driverText}>SaffarNow</Text>
        </View>
        <View style={styles.busInfo}>
          <Text style={styles.busTypeText}>Executive Class</Text>
          <Text style={styles.seatCountText}>
            {rows.flat().filter(s => s?.status === 'available').length} seats available
          </Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.busFront}>
          <View style={styles.windshield} />
          <View style={styles.frontDoor}>
            <Text style={styles.doorText}>ENTRANCE</Text>
          </View>
        </View>

        <View style={styles.seatGrid}>
          {rows.map((row, index) => renderRow(row, index))}
        </View>

        <View style={styles.busRear}>
          <View style={styles.rearDoor}>
            <Text style={styles.doorText}>EXIT</Text>
          </View>
        </View>
      </ScrollView>
      {selectedSeats.length > 0 && (
        <View style={styles.bookingControls}>
          <Text style={styles.bookingLabel}>Select Your Gender:</Text>
          <View style={styles.genderButtons}>
            <TouchableOpacity 
              style={[
                styles.genderButton, 
                bookingGender === 'female' && styles.genderButtonSelected,
                { backgroundColor: '#FF1493' }
              ]}
              onPress={() => setBookingGender('female')}
            >
              <Text style={styles.genderButtonText}>Female</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.genderButton, 
                bookingGender === 'male' && styles.genderButtonSelected,
                { backgroundColor: '#2196F3' }
              ]}
              onPress={() => setBookingGender('male')}
            >
              <Text style={styles.genderButtonText}>Male</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={handleBookSeats}
            disabled={isBooking || !bookingGender}
          >
            <Text style={styles.bookButtonText}>
              {isBooking ? 'Booking...' : `Book ${selectedSeats.length} Seat${selectedSeats.length !== 1 ? 's' : ''}`}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {showLegend && (
        <View style={styles.legendContainer}>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, styles.availableColor]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, styles.selectedColor]} />
              <Text style={styles.legendText}>Selected</Text>
            </View>
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, styles.maleColor]} />
              <Text style={styles.legendText}>Male Booked</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, styles.femaleColor]} />
              <Text style={styles.legendText}>Female Booked</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  busHeader: {
    backgroundColor: '#003580',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#002050',
  },
  driverArea: {
    backgroundColor: '#002050',
    padding: 8,
    borderRadius: 16,
    marginBottom: 6,
    width: '55%',
    alignItems: 'center',
  },
  driverText: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 15,
  },
  busInfo: {
    alignItems: 'center',
  },
  busTypeText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  seatCountText: {
    color: '#b3e5fc',
    fontSize: 11,
    marginTop: 2,
  },
  scrollContainer: {
    padding: 10,
    paddingBottom: 6,
  },
  busFront: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  windshield: {
    width: '55%',
    height: 25,
    backgroundColor: '#81d4fa',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  frontDoor: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginLeft: 8,
  },
  busRear: {
    alignItems: 'center',
    marginTop: 8,
  },
  rearDoor: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  seatGrid: {
    flexDirection: 'column',
    marginVertical: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  sideContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '45%',
    marginHorizontal: -200,
  },
  seat: {
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 55,
    marginHorizontal: 1,
    elevation: 1,
  },
  availableSeat: {
    backgroundColor: '#4CAF50',
  },
  selectedSeat: {
    backgroundColor: '#FF9800',
  },
  maleBookedSeat: {
    backgroundColor: '#2196F3',
  },
  femaleBookedSeat: {
    backgroundColor: '#FF1493',
  },
  emptySeat: {
    height: 32,
    backgroundColor: 'transparent',
  },
  seatText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 11,
  },
  selectedSeatText: {
    fontWeight: 'bold',
  },
  bookedSeatText: {
    color: '#FFFFFF',
  },
  doorText: {
    color: '#424242',
    fontSize: 9,
    fontWeight: 'bold',
  },
  legendContainer: {
    padding: 10,
    backgroundColor: '#E0E0E0',
    borderTopWidth: 1,
    borderTopColor: '#BDBDBD',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 3,
  },
  legendColor: {
    width: 14,
    height: 14,
    borderRadius: 2,
    marginRight: 5,
  },
  availableColor: {
    backgroundColor: '#4CAF50',
  },
  selectedColor: {
    backgroundColor: '#FF9800',
  },
  maleColor: {
    backgroundColor: '#2196F3',
  },
  femaleColor: {
    backgroundColor: '#FF1493',
  },
  legendText: {
    fontSize: 11,
    color: '#424242',
    fontWeight: '500',
  },
  bookingControls: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  bookingLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    color: '#424242',
  },
  genderButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  genderButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 8,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderButtonSelected: {
    borderWidth: 2,
    borderColor: '#003580',
  },
  genderButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  bookButton: {
    backgroundColor: '#003580',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SeatMap;