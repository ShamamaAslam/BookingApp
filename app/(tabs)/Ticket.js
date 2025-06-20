import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const Ticket = () => {
  const {
    seats = '',
    gender = '',
    seatCount = 0,
    totalAmount = 0,
    transactionId = '',
    bank = '',
    amount = '',
    accountNumber = ''
  } = useLocalSearchParams();

  const bookingDate = new Date().toLocaleString();

  const qrValue = JSON.stringify({
    transactionId,
    seats,
    gender,
    bank,
    amount,
    accountNumber
  });

  const handleProceed = () => {
    router.push({
      pathname: '/Confirmation',
      params: {
        transactionId,
        seatCount,
        totalAmount,
        seats
      }
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.ticket}>
        <Text style={styles.heading}>🎫 SaffarNow e-Ticket</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Transaction ID:</Text>
          <Text style={styles.value}>{transactionId}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Seat(s):</Text>
          <Text style={styles.value}>{seats}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Passenger Gender:</Text>
          <Text style={styles.value}>{gender}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Total Seats:</Text>
          <Text style={styles.value}>{seatCount}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Total Paid:</Text>
          <Text style={styles.value}>{totalAmount} PKR</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Payment Method:</Text>
          <Text style={styles.value}>{bank}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Account Number:</Text>
          <Text style={styles.value}>{accountNumber}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Booking Time:</Text>
          <Text style={styles.value}>{bookingDate}</Text>
        </View>

        <View style={styles.qrContainer}>
          <QRCode value={qrValue} size={160} />
          <Text style={styles.qrNote}>Scan to verify</Text>
        </View>

        <TouchableOpacity style={styles.proceedButton} onPress={handleProceed}>
          <Text style={styles.proceedButtonText}>Proceed to Confirmation</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Ticket;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#eaf2fb',
    flexGrow: 1,
    alignItems: 'center',
  },
  ticket: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#003580',
    marginBottom: 20,
  },
  section: {
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
    color: '#666',
    marginBottom: 3,
  },
  value: {
    fontSize: 16,
    color: '#222',
  },
  qrContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  qrNote: {
    marginTop: 10,
    fontSize: 13,
    color: '#888',
  },
  proceedButton: {
    marginTop: 25,
    backgroundColor: '#003580',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  proceedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
