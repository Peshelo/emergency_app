import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/FontAwesome';
import call from 'react-native-phone-call';
import { Stack } from 'expo-router';

const EmergencyContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [placeFilter, setPlaceFilter] = useState('');

  const dummyContacts = [
    {
      id: '0',
      name: 'PSTT',
      type: 'Police Station',
      phone: '0771159008',
      place: 'Harare',
    },
    {
      id: '1',
      name: 'Parirenyatwa Hospital',
      type: 'Hospital',
      phone: '0242700101',
      place: 'Harare',
    },
    {
      id: '2',
      name: 'Harare Central Police Station',
      type: 'Police Station',
      phone: '0242757671',
      place: 'Harare',
    },
    {
      id: '3',
      name: 'Borrowdale Fire Station',
      type: 'Fire Station',
      phone: '0242282100',
      place: 'Harare',
    },
    {
      id: '4',
      name: 'Mpilo Central Hospital',
      type: 'Hospital',
      phone: '0292221625',
      place: 'Bulawayo',
    },
    {
      id: '5',
      name: 'Bulawayo Central Police Station',
      type: 'Police Station',
      phone: '0292272853',
      place: 'Bulawayo',
    },
    {
      id: '6',
      name: 'Gweru General Hospital',
      type: 'Hospital',
      phone: '054222525',
      place: 'Gweru',
    },
    {
      id: '7',
      name: 'Gweru Central Police Station',
      type: 'Police Station',
      phone: '054225785',
      place: 'Gweru',
    },
    {
      id: '8',
      name: 'Mutare General Hospital',
      type: 'Hospital',
      phone: '02060600',
      place: 'Mutare',
    },
    {
      id: '9',
      name: 'Mutare Central Police Station',
      type: 'Police Station',
      phone: '02060317',
      place: 'Mutare',
    },
    {
      id: '10',
      name: 'Victoria Falls Police Station',
      type: 'Police Station',
      phone: '01345015',
      place: 'Victoria Falls',
    },
  ];

  useEffect(() => {
    setContacts(dummyContacts);
    getLocation();
  }, []);

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required.');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    const address = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    const formattedAddress = `${address[0].street}, ${address[0].city}`;
    setUserLocation(formattedAddress);
  };

  const handleCall = (phone) => {
    const args = {
      number: phone,
      prompt: true,
    };
    call(args).catch((error) => Alert.alert('Error', 'Unable to make the call.'));
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = contact.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilterType = filterType
      ? contact.type === filterType
      : true;
    const matchesPlace = placeFilter
      ? contact.place.toLowerCase().includes(placeFilter.toLowerCase())
      : true;
    return matchesSearch && matchesFilterType && matchesPlace;
  });

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Emergency Contacts',headerShown:true ,
             headerRight: () => (
               <Image source={require('../../assets/images/logo.jpg')} style={styles.logoHeader} />
             )
            }}/>
      {/* <Text style={styles.title}>Emergency Contacts</Text> */}
      <Text style={styles.location}>
        Current Location: {userLocation || 'Fetching location...'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Search by name"
        value={searchQuery}
        onChangeText={(text) => setSearchQuery(text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Filter by place"
        value={placeFilter}
        onChangeText={(text) => setPlaceFilter(text)}
      />

      <View style={styles.filterContainer}>
        {['All', 'Hospital', 'Police Station', 'Fire Station'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterButton,
              filterType === type && styles.activeFilter,
            ]}
            onPress={() => setFilterType(type === 'All' ? '' : type)}
          >
            <Text style={styles.filterText}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleCall(item.phone)}
          >
            <View style={styles.cardIcon}>
              {item.type === 'Hospital' && (
                <Icon name="hospital-o" size={30} color="#4CAF50" />
              )}
              {item.type === 'Police Station' && (
                <Icon name="shield" size={30} color="#2196F3" />
              )}
              {item.type === 'Fire Station' && (
                <Icon name="fire" size={30} color="#FF5722" />
              )}
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>{item.type}</Text>
              <Text style={styles.cardPlace}>{item.place}</Text>
            </View>
            <Icon name="phone" size={20} color="#000" style={styles.callIcon} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  logoHeader: {
    width: 40,
    height: 40,
    objectFit: 'cover',
marginRight: 10,
borderRadius: 50,
 },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  activeFilter: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  filterText: {
    color: '#000',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon: {
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  cardPlace: {
    fontSize: 12,
    color: '#999',
  },
  callIcon: {
    marginLeft: 8,
  },
});

export default EmergencyContacts;
