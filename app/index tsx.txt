import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
    <Image source={require('../../assets/LOGO1.jpg')} style={styles.logo} />

      <Text style={styles.title}>Welcome to BookingApp</Text>
      <Text style={styles.subtitle}>
        Book your stays, your way — fast, simple, and reliable.
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.signupButton]}
          onPress={() => router.push('/Signup')}
        >
          <Text style={styles.buttonTextSignup}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.loginButton]}
          onPress={() => router.push('/LoginScreen')}
        >
          <Text style={styles.buttonTextLogin}>Log In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'honeyddew',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 40,
    borderRadius: 10,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 50,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    paddingVertical: 15,
    borderRadius: 30,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  signupButton: {
    backgroundColor: '#2980b9',
  },
  loginButton: {
    backgroundColor: '#ecf0f1',
    borderWidth: 1,
    borderColor: '#2980b9',
  },
  buttonTextSignup: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonTextLogin: {
    color: '#2980b9',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
