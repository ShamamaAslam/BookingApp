import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from './SupabaseClient';

const { width } = Dimensions.get('window');
const images = [
  require('../../assets/Offer1.jpg'),
  require('../../assets/Offer2.jpg'),
  require('../../assets/Offer3.jpg'),
  require('../../assets/Offer4.jpg'),
  require('../../assets/Offer5.jpg'),
];
const cities = [
  'Lahore','Lodhran', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad','Multan', 'Peshawar', 'Quetta', 'Gujranwala', 'Hyderabad','Sialkot', 'Bahawalpur', 'Sargodha', 'Sukkur', 'Larkana'];
const operators = ['Any Operator','Daewoo Express', 'Faisal Movers', 'Skyways', 'Niazi Express','Bilal Travels', 'Sindh Express', 'Pakistan Express'];

const CityModalContent = memo(({ cities, searchText, onSelect, onClose, title }) => {
  const filteredCities = cities.filter(city => 
    city.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>{title}</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search cities..."
        value={searchText}
        onChangeText={(text) => onSelect(text, true)}
      />
      <FlatList
        data={filteredCities}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.cityItem}
            onPress={() => onSelect(item, false)}
          >
            <Text style={styles.cityName}>{item}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
      <TouchableOpacity 
        style={styles.closeButton}
        onPress={onClose}
      >
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
});

const OperatorModalContent = memo(({ operators, onSelect, onClose }) => {
  return (
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Select Bus Operator</Text>
      <FlatList
        data={operators}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.cityItem}
            onPress={() => onSelect(item)}
          >
            <Text style={styles.cityName}>{item}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
      />
      <TouchableOpacity 
        style={styles.closeButton}
        onPress={onClose}
      >
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
});

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
  const [isLoading, setIsLoading] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  // Calculate maximum date (1 week from today)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 7);

  // Fetch user name
  useEffect(() => {
    let isMounted = true;
    
    async function fetchUserName() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (isMounted && !error && user) {
        setName(user.user_metadata?.name || '');
      }
    }
    
    fetchUserName();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleFromSelect = useCallback((city, isSearchText) => {
    if (isSearchText) {
      setSearchFrom(city);
    } else {
      setFrom(city);
      setShowFromModal(false);
      setSearchFrom('');
    }
  }, []);

  const handleToSelect = useCallback((city, isSearchText) => {
    if (isSearchText) {
      setSearchTo(city);
    } else {
      setTo(city);
      setShowToModal(false);
      setSearchTo('');
    }
  }, []);

  const handleOperatorSelect = useCallback((operator) => {
    setSelectedOperator(operator);
    setShowOperatorModal(false);
  }, []);

  const onChangeDate = useCallback((event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  }, []);

  const formatDate = useCallback((date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  const handleSearch = useCallback(async () => {
    if (from !== 'Select From' && to !== 'Select To') {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        router.push({
          pathname: '/BusRoutes',
          params: {
            from,
            to,
            date: date.toISOString(),
            passengers,
            operator: selectedOperator
          }
        });
      } catch (error) {
        console.error('Navigation error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [from, to, date, passengers, selectedOperator]);

  const swapCities = useCallback(() => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  }, [from, to]);

  const incrementPassengers = useCallback(() => {
    setPassengers(p => p + 1);
  }, []);

  const decrementPassengers = useCallback(() => {
    setPassengers(p => Math.max(1, p - 1));
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.greeting}>Hello {name || 'Traveler'}!</Text>
      {!logoLoaded && <View style={[styles.logo, {backgroundColor: '#F8F9F9'}]} />}
      <Image 
        source={require('../../assets/LOGO1.jpg')} 
        style={styles.logo}
        onLoad={() => setLogoLoaded(true)}
      />
      <Text style={styles.tagline}>Book bus tickets across Pakistan</Text>

      <View style={styles.sliderContainer}>
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={3}
          renderItem={({ item }) => (
            <View style={{ width: width - 40, height: 150 }}>
              <Image 
                source={item} 
                style={styles.slideImage}
                resizeMode="cover"
              />
            </View>
          )}
          keyExtractor={(_, index) => `image-${index}`}
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
            onPress={swapCities}
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
            maximumDate={maxDate}
          />
        )}

        {/* Passengers and Operator */}
        <View style={styles.optionsRow}>
          <View style={styles.optionBox}>
            <Text style={styles.optionLabel}>Passengers</Text>
            <View style={styles.counter}>
              <TouchableOpacity onPress={decrementPassengers}>
                <MaterialIcons name="remove" size={24} color="#2E86C1" />
              </TouchableOpacity>
              <Text style={styles.counterText}>{passengers}</Text>
              <TouchableOpacity onPress={incrementPassengers}>
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
          disabled={from === 'Select From' || to === 'Select To' || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.searchButtonText}>Search Buses</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* From City Modal */}
      <Modal visible={showFromModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <CityModalContent 
            cities={cities}
            searchText={searchFrom}
            onSelect={handleFromSelect}
            onClose={() => setShowFromModal(false)}
            title="Select Departure City"
          />
        </View>
      </Modal>

      {/* To City Modal */}
      <Modal visible={showToModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <CityModalContent 
            cities={cities}
            searchText={searchTo}
            onSelect={handleToSelect}
            onClose={() => setShowToModal(false)}
            title="Select Destination City"
          />
        </View>
      </Modal>

      {/* Operator Modal */}
      <Modal visible={showOperatorModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <OperatorModalContent 
            operators={operators}
            onSelect={handleOperatorSelect}
            onClose={() => setShowOperatorModal(false)}
          />
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9370DB',
    marginBottom: 10,
    marginTop: 80,
  },
  logo: {
    width: 120,
    height: 60,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 18,
    color: 'Purple',
    marginBottom: 40,
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
    justifyContent: 'center',
    height: 50,
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