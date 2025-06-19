import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Confirmation = () => {
  const { bookedSeats, gender, bookingTime } = useLocalSearchParams();
  
  // Convert string params to correct types
  const seatsArray = typeof bookedSeats === 'string' ? bookedSeats.split(',') : bookedSeats;
  const bookingDate = new Date(bookingTime).toLocaleString();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Booking Confirmed!</Text>
      
      <View style={styles.detailsContainer}>
        <Text style={styles.detailText}>Seats: {Array.isArray(seatsArray) ? seatsArray.join(', ') : bookedSeats}</Text>
        <Text style={styles.detailText}>Gender: {gender === 'male' ? 'Male' : 'Female'}</Text>
        <Text style={styles.detailText}>Booking Time: {bookingDate}</Text>
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push('/')} // Goes to home screen
      >
        <Text style={styles.buttonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#003580',
  },
  detailsContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    marginBottom: 30,
    elevation: 3,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  button: {
    backgroundColor: '#003580',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Confirmation;