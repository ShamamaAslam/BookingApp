import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Picker, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const PaymentScreen = () => {
  const params = useLocalSearchParams();
  const [bank, setBank] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const pakistaniBanks = [
    'HBL',
    'UBL',
    'MCB',
    'Allied Bank',
    'Bank Alfalah',
    'JazzCash',
    'EasyPaisa',
    'Al Baraka Bank',
    'Meezan Bank',
    'Standard Chartered',
    'Sadapay',
    'Nayapay'
  ];

  const handlePayment = () => {
    const expectedAmount = params.seatCount * 1000;
    if (parseInt(amount) !== expectedAmount) {
      Alert.alert('Invalid Amount', `Please enter exact amount: ${expectedAmount} PKR`);
      return;
    }
    
    if (!bank) {
      Alert.alert('Bank Not Selected', 'Please select your bank');
      return;
    }

    // Generate a random transaction ID
    const transId = `TXN${Math.floor(Math.random() * 1000000)}`;
    setTransactionId(transId);

    // Navigate to ticket screen
    router.push({
      pathname: '/Ticket',
      params: {
        ...params,
        transactionId: transId,
        bank: bank,
        amount: amount
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Payment Details</Text>
      
      <View style={styles.detailCard}>
        <Text style={styles.detailText}>Seats: {params.seats}</Text>
        <Text style={styles.detailText}>Total Amount: {params.seatCount * 1000} PKR</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Select Bank:</Text>
        <Picker
          selectedValue={bank}
          style={styles.picker}
          onValueChange={(itemValue) => setBank(itemValue)}>
          <Picker.Item label="Select your bank" value="" />
          {pakistaniBanks.map((bank) => (
            <Picker.Item key={bank} label={bank} value={bank} />
          ))}
        </Picker>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Enter Amount (PKR):</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          placeholder="e.g. 1000"
        />
      </View>

      <TouchableOpacity 
        style={styles.payButton}
        onPress={handlePayment}
      >
        <Text style={styles.buttonText}>Proceed to Payment</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#003580',
    textAlign: 'center',
  },
  detailCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#003580',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  picker: {
    backgroundColor: 'white',
    borderRadius: 8,
  },
  payButton: {
    backgroundColor: '#003580',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
export default  PaymentScreen;
