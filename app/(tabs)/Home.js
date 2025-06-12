import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from './SupabaseClient';

const { width } = Dimensions.get('window');

// Bus-specific images
const images = [
  require('../../assets/Offer1.jpg'),
  require('../../assets/Offer2.jpg'),
  require('../../assets/Offer3.jpg'),
  require('../../assets/Offer4.jpg'),
  require('../../assets/Offer5.jpg'),
];

// Pakistani cities common for bus routes
const cities = [
  'Lahore','Lodhran', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Gujranwala', 'Hyderabad',
  'Sialkot', 'Bahawalpur', 'Sargodha', 'Sukkur', 'Larkana'
];

// Bus operators
const operators = [
  'Any Operator',
  'Daewoo Express', 
  'Faisal Movers', 
  'Skyways', 
  'Niazi Express',
  'Bilal Travels', 
  'Sindh Express', 
  'Pakistan Express'
];

export default function BusBookingScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [from, setFrom] = useState('Select From');
  const [to, setTo] = useState('Select To');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [passengers, setPassengers] = useState(1);
  const [showFromModal, setShowFromModal] = useState(false);
  const [showToModal, setShowToModal] = useState(false);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('Any Operator');
  const [showOperatorModal, setShowOperatorModal] = useState(false);

  // Fetch user name
  useEffect(() => {
    async function fetchUserName() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error && user) {
        setName(user.user_metadata?.name || '');
      }
    }
    fetchUserName();
  }, []);

  const handleFromSelect = (city) => {
    setFrom(city);
    setShowFromModal(false);
    setSearchFrom('');
  };

  const handleToSelect = (city) => {
    setTo(city);
    setShowToModal(false);
    setSearchTo('');
  };

  const handleOperatorSelect = (operator) => {
    setSelectedOperator(operator);
    setShowOperatorModal(false);
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSearch = () => {
    if (from !== 'Select From' && to !== 'Select To') {
      router.push({
        pathname: '/busResults',
        params: {
          from,
          to,
          date: date.toISOString(),
          passengers,
          operator: selectedOperator
        }
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <Text style={styles.greeting}>Hello {name || 'Traveler'}!</Text>
      <Image source={require('../../assets/LOGO.jpg')} style={styles.logo} />
      <Text style={styles.tagline}>Book bus tickets across Pakistan</Text>

      {/* Promotional Slider */}
      <View style={styles.sliderContainer}>
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={{ width: width - 40, height: 150 }}>
              <Image source={item} style={styles.slideImage} />
            </View>
          )}
          keyExtractor={(_, index) => index.toString()}
        />
      </View>

      {/* Booking Form */}
      <View style={styles.bookingCard}>
        <Text style={styles.bookingTitle}>Find Buses</Text>
        
        {/* Route Selection */}
        <View style={styles.routeContainer}>
          <TouchableOpacity 
            style={styles.cityButton}
            onPress={() => setShowFromModal(true)}
          >
            <MaterialIcons name="location-on" size={20} color="#2E86C1" />
            <Text style={styles.cityText}>{from}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.swapButton}
            onPress={() => {
              const temp = from;
              setFrom(to);
              setTo(temp);
            }}
          >
            <Ionicons name="swap-horizontal" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cityButton}
            onPress={() => setShowToModal(true)}
          >
            <MaterialIcons name="location-searching" size={20} color="#2E86C1" />
            <Text style={styles.cityText}>{to}</Text>
          </TouchableOpacity>
        </View>

        {/* Date Selection */}
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <FontAwesome name="calendar" size={18} color="#2E86C1" />
          <Text style={styles.dateText}>{formatDate(date)}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onChangeDate}
            minimumDate={new Date()}
          />
        )}

        {/* Passengers and Operator */}
        <View style={styles.optionsRow}>
          <View style={styles.optionBox}>
            <Text style={styles.optionLabel}>Passengers</Text>
            <View style={styles.counter}>
              <TouchableOpacity onPress={() => setPassengers(Math.max(1, passengers - 1))}>
                <MaterialIcons name="remove" size={24} color="#2E86C1" />
              </TouchableOpacity>
              <Text style={styles.counterText}>{passengers}</Text>
              <TouchableOpacity onPress={() => setPassengers(passengers + 1)}>
                <MaterialIcons name="add" size={24} color="#2E86C1" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.optionBox}>
            <Text style={styles.optionLabel}>Operator</Text>
            <TouchableOpacity 
              style={styles.operatorButton}
              onPress={() => setShowOperatorModal(true)}
            >
              <Text style={styles.operatorText}>{selectedOperator}</Text>
              <MaterialIcons name="arrow-drop-down" size={20} color="#2E86C1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Button */}
        <TouchableOpacity 
          style={[styles.searchButton, (from === 'Select From' || to === 'Select To') && styles.disabledButton]}
          onPress={handleSearch}
          disabled={from === 'Select From' || to === 'Select To'}
        >
          <Text style={styles.searchButtonText}>Search Buses</Text>
        </TouchableOpacity>
      </View>

      {/* From City Modal */}
      <Modal visible={showFromModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Departure City</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search cities..."
              value={searchFrom}
              onChangeText={setSearchFrom}
            />
            <FlatList
              data={cities.filter(city => 
                city.toLowerCase().includes(searchFrom.toLowerCase())
              )}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.cityItem}
                  onPress={() => handleFromSelect(item)}
                >
                  <Text style={styles.cityName}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item}
            />
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowFromModal(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* To City Modal */}
      <Modal visible={showToModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Destination City</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search cities..."
              value={searchTo}
              onChangeText={setSearchTo}
            />
            <FlatList
              data={cities.filter(city => 
                city.toLowerCase().includes(searchTo.toLowerCase())
              )}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.cityItem}
                  onPress={() => handleToSelect(item)}
                >
                  <Text style={styles.cityName}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item}
            />
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowToModal(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Operator Modal */}
      <Modal visible={showOperatorModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Bus Operator</Text>
            <FlatList
              data={operators}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.cityItem}
                  onPress={() => handleOperatorSelect(item)}
                >
                  <Text style={styles.cityName}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item}
            />
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowOperatorModal(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F8F9F9',
    padding: 15,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E86C1',
    marginBottom: 5,
  },
  logo: {
    width: 120,
    height: 60,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: '#5D6D7E',
    marginBottom: 20,
  },
  sliderContainer: {
    height: 160,
    marginBottom: 20,
  },
  slideImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  bookingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
    textAlign: 'center',
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D6EAF8',
  },
  cityText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2874A6',
  },
  swapButton: {
    backgroundColor: '#2E86C1',
    padding: 8,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D6EAF8',
    marginBottom: 15,
  },
  dateText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#2874A6',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  optionBox: {
    width: '48%',
  },
  optionLabel: {
    fontSize: 14,
    color: '#5D6D7E',
    marginBottom: 8,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EBF5FB',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D6EAF8',
  },
  counterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  operatorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EBF5FB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D6EAF8',
  },
  operatorText: {
    fontSize: 14,
    color: '#2874A6',
  },
  searchButton: {
    backgroundColor: '#2E86C1',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#95A5A6',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '90%',
    maxHeight: '70%',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: '#F2F3F4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  cityItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEDED',
  },
  cityName: {
    fontSize: 16,
    color: '#2C3E50',
  },
  closeButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#2E86C1',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeText: {
    color: 'white',
    fontWeight: 'bold',
  },
});