import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Ticket = () => {
  const params = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 Congratulations!</Text>
      <Text style={styles.message}>Your seat(s) have been booked successfully.</Text>

      <View style={styles.ticketCard}>
        <Text style={styles.ticketText}>🎟️ Ticket ID: {params.transactionId}</Text>
        <Text style={styles.ticketText}>Seat No: {params.seats}</Text>
        <Text style={styles.ticketText}>Gender: {params.gender}</Text>
        <Text style={styles.ticketText}>Bank: {params.bank}</Text>
        <Text style={styles.ticketText}>Amount Paid: {params.amount} PKR</Text>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(tabs)/SeatMap')}>
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#f5f5f5', padding: 20,
  },
  title: {
    fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#003580',
  },
  message: {
    fontSize: 16, marginBottom: 20,
  },
  ticketCard: {
    backgroundColor: 'white', padding: 20,
    borderRadius: 10, elevation: 3, width: '100%',
  },
  ticketText: {
    fontSize: 16, marginBottom: 10,
  },
  backButton: {
    backgroundColor: '#003580', marginTop: 30,
    padding: 15, borderRadius: 8,
  },
  backButtonText: {
    color: 'white', fontSize: 16, fontWeight: 'bold',
  },
});

export default Ticket;
