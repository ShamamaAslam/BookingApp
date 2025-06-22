import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { useRef } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

const ConfirmationScreen = () => {
  const viewRef = useRef();

  const handleDownload = async () => {
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission denied', 'Storage permission is required to save the ticket.');
        return;
      }

      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
      });

      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('SaffarNow Tickets', asset, false);

      Alert.alert('Success', 'Ticket saved to your gallery!');
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Something went wrong while saving the ticket.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content} ref={viewRef}>
        <Ionicons name="checkmark-circle" size={120} color="green" style={styles.checkIcon} />
        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.message}>Your SaffarNow ticket has been successfully booked.</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleDownload}>
        <Text style={styles.buttonText}>Download Ticket</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ConfirmationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    marginBottom: 40,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 380,
    elevation: 3,
  },
  checkIcon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
  },
  button: {
    backgroundColor: '#003580',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
