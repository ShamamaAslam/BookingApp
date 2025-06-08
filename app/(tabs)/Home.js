import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from './SupabaseClient';

const { width } = Dimensions.get('window');

const images = [
  require('../../assets/Offer1.jpg'),
  require('../../assets/Offer2.jpg'),
  require('../../assets/Offer3.jpg'),
  require('../../assets/Offer4.jpg'),
  require('../../assets/Offer5.jpg'),
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const itemwidth = width - 40;
  const [from, setFrom] = useState('Select From');
  const [to, setTo] = useState('Select To');

  // Fetch user name on mount
  useEffect(() => {
    async function fetchUserName() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.log('Error fetching user:', error.message);
        return;
      }
    console.log('User fetched:', user); 
      // Assuming user_metadata has a "name" field
      setName(user?.user_metadata?.name || '');
    }

    fetchUserName();
  }, []);

  const renderImage = ({ item }) => (
    <View style={{ width: itemwidth, height: 250 }}>
      <Image source={item} style={styles.slideImage} />
    </View>
  );
 const handleFromPress = () => {
    setFrom('Lahore'); 
  };

  const handleToPress = () => {
    setTo('Karachi');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Greeting with user name */}
      <Text style={styles.greeting}>Hey {name || 'there'}!</Text>

      <Image source={require('../../assets/WelcomeLogo.jpg')} style={styles.logo} />

      <Text style={styles.title}>
        "Your journey begins here – book your ride in seconds!"
      </Text>

      <View style={styles.sliderContainer}>
        <FlatList
          data={images}
          renderItem={renderImage}
          keyExtractor={(_, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <View style={styles.container}>
      <Text style={styles.title}>Ticket Booking</Text>
      <View style={styles.row}>

      <TouchableOpacity style={styles.button} onPress={handleFromPress}>
        <Text style={styles.buttonText}>From: {from}</Text>
      </TouchableOpacity>

        <Text style={styles.arrow}>⇄</Text>

      <TouchableOpacity style={styles.button} onPress={handleToPress}>
        <Text style={styles.buttonText}>To: {to}</Text>
      </TouchableOpacity>
    </View>
    </View>
    </ScrollView>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'lavender',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'Red',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  logo: {
    width: 300,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'purple',
    textAlign: 'center',
    marginBottom: 10,
  },
  sliderContainer: {
    height: 200,
    width: width - 40,
    marginBottom: 30,
  },
  slideImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    borderRadius: 30,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'center',
    gap:'10',
  },
  cityButton: {
    backgroundColor: 'purple',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 10,
    minWidth: 120,
  },
  buttonText: {
    color: 'black',
    textAlign: 'center',
    fontSize: 16,
  },
  arrow: {
    fontSize: 30,
    color: '#007bff',
    marginhorizontal:4,
  },  
  },
);
