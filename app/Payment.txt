import { Picker } from '@react-native-picker/picker'; // ✅ Correct import
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const PaymentScreen = () => {
  const params = useLocalSearchParams();
  const [bank, setBank] = useState('');
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const pakistaniBanks = [
    'HBL', 'UBL', 'MCB', 'Allied Bank', 'Bank Alfalah',
    'JazzCash', 'EasyPaisa', 'Al Baraka Bank', 'Meezan Bank',
    'Standard Chartered', 'Sadapay', 'Nayapay'
  ];

  const handlePayment = () => {
    const expectedAmount = params.seatCount * 1000;

    if (!bank || !amount || !accountNumber) {
      Alert.alert('Missing Info', 'Please fill in all fields');
      return;
    }

    if (parseInt(amount) !== expectedAmount) {
      Alert.alert('Invalid Amount', `Please enter exact amount: ${expectedAmount} PKR`);
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
        bank,
        accountNumber,
        amount
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
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={bank}
            onValueChange={(itemValue) => setBank(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select your bank" value="" />
            {pakistaniBanks.map((bank) => (
              <Picker.Item key={bank} label={bank} value={bank} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Enter Account Number:</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          placeholder="e.g. 03001234567 or 123456789"
          value={accountNumber}
          onChangeText={setAccountNumber}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Enter Amount (PKR):</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          placeholder={`e.g. ${params.seatCount * 1000}`}
        />
      </View>

      <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
        <Text style={styles.buttonText}>Proceed to Payment</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PaymentScreen;

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
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 50,
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
