import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Animated, Vibration, Alert, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Location from 'expo-location'; // Import Expo's Location module
import { FontAwesome, MaterialIcons, Entypo, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import pb from "@/lib/connection"; // Assuming you have the PocketBase connection file


const EmergencyHelpScreen = () => {
  const [isHolding, setIsHolding] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const progress = useRef(new Animated.Value(0)).current;
  const expansion = useRef(new Animated.Value(0)).current;
  const [userName, setUserName] = useState('');
  const router = useRouter();
  const [errors,setErrors] = useState('');


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const firstName = await SecureStore.getItemAsync('user_firstname');
        const lastName = await SecureStore.getItemAsync('user_lastname');
        const userPhone = await SecureStore.getItemAsync('user_phone');

        if (!userPhone) {
          Alert.alert(
            'Registration Required',
            'Please register your details before accessing the Emergency Help feature.',
            [{ text: 'OK', onPress: () => router.push('auth/register') }]
          );
        }

        if (firstName && lastName) {
          setUserName(`${firstName} ${lastName}`);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [router]);

  useEffect(() => {
    if (isHolding) {
      const countdownTimer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);

      // Start animations
      Animated.timing(progress, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: false,
      }).start();
      Animated.timing(expansion, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: false,
      }).start();

      const timeout = setTimeout(() => {
        if (isHolding) {
          sendSOS();
          Vibration.vibrate(1000);
        }
        clearInterval(countdownTimer);
      }, 5000);

      return () => {
        clearInterval(countdownTimer);
        clearTimeout(timeout);
      };
    } else {
      setCountdown(4);
      Animated.timing(progress, {
        toValue: 0,
        duration: 0,
        useNativeDriver: false,
      }).start();
      Animated.timing(expansion, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [isHolding]);

  const sendSOS = async () => {
    let location;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to send SOS.');
        return;
      }
  
      location = await Location.getCurrentPositionAsync({});
      const firstName = await SecureStore.getItemAsync('user_firstname');
      const lastName = await SecureStore.getItemAsync('user_lastname');
      const nationalId = await SecureStore.getItemAsync('user_national_id');
      const phoneNumber = await SecureStore.getItemAsync('user_phone');
      const userAddress = await SecureStore.getItemAsync('user_address'); // Replace with actual address logic if needed
  
      const username = `${firstName} ${lastName} National ID: ${nationalId}`;
      const { latitude, longitude } = location.coords;
  
      // Record the SOS case in PocketBase
      const caseData = {
        title: 'SOS Emergency',
        description: `SOS triggered by ${username}`,
        city: 'Unknown', // Replace with dynamic city retrieval if available
        address: userAddress || 'Not Provided',
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        merchant: 'oi2mnpx4rc6i655', // Replace with dynamic merchant selection if needed
        status: 'Open',
        priority: 'red',
        phoneNumber,
      };
  
      try {
        const record = await pb.collection('cases').create(caseData);
        Alert.alert('SOS Recorded', `Your case has been recorded with ID: ${record.id}`);
      } catch (error) {
        console.error('Error recording case:', error);
        Alert.alert('Error', 'Failed to record case in the database.');
      }
  
      // Sending POST request to external server
      const response = await fetch('http://102.37.154.6/send-sos', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: username,
          latitude,
          longitude,
          recipient: phoneNumber,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to send SOS. Server error.');
      }
  
      const responseData = await response.json();
      Alert.alert('SOS Sent', `Message: ${responseData.message}\nLocation: (${latitude}, ${longitude})`);
    } catch (error) {
      console.error('Error sending SOS:', error);
      setErrors(error);
      Alert.alert('Error', error.message || 'Failed to send SOS signal. Please try again.');
    }
  };
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: 'SOS',headerShown:true ,
             headerRight: () => (
               <Image source={require('../../assets/images/logo.jpg')} style={styles.logoHeader} />
             )
            }}/>
      <View style={styles.header}>
      <Text style="color:red;">{errors}</Text>
        <Text style={styles.title}>Emergency help needed?</Text>
        <Text style={styles.subtitle}>Hold the button for 3 seconds to send SOS</Text>
      </View>

      <Animated.View
        style={[
          styles.expandingCircle,
          {
            transform: [
              {
                scale: expansion.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 3],
                }),
              },
            ],
          },
        ]}
      />

      <TouchableOpacity
        onPressIn={() => setIsHolding(true)}
        onPressOut={() => setIsHolding(false)}
        style={styles.emergencyButton}
      >
        <Text style={styles.emergencyText}>SOS</Text>
      </TouchableOpacity>
      <Text style={styles.timerText}>{isHolding ? countdown : ''}</Text>

      <View style={styles.spacer} />

      <View style={styles.optionsContainer}>
        <Text style={styles.optionsTitle}>Not sure what to do?</Text>
        <View style={styles.optionsRow}>
          <TouchableOpacity style={styles.optionCard}>
            <MaterialIcons name="car-crash" size={24} color="#555" />
            <Text style={styles.optionText}>I had an accident</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionCard}>
            <FontAwesome name="medkit" size={24} color="#555" />
            <Text style={styles.optionText}>I have an injury</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.optionsRow}>
          <TouchableOpacity style={styles.optionCard}>
            <Entypo name="warning" size={24} color="#555" />
            <Text style={styles.optionText}>I'm feeling unsafe</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.servicesHeader}>
        <Text style={styles.servicesTitle}>Other Services</Text>
        <Text style={styles.seeAll}>See All</Text>
      </View>

      <ScrollView horizontal style={styles.servicesScrollContainer} showsHorizontalScrollIndicator={false}>
        <TouchableOpacity style={styles.serviceCard}>
          <Ionicons name="shield-checkmark" size={24} color="#555" />
          <Text style={styles.serviceCardText}>Police Stations</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.serviceCard}>
          <FontAwesome5 name="hospital" size={24} color="#555" />
          <Text style={styles.serviceCardText}>Hospitals</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.serviceCard}>
          <MaterialIcons name="fire-truck" size={24} color="#555" />
          <Text style={styles.serviceCardText}>Fire Department</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f9f9f9',
    padding: 16,
    // Align items in the center
    alignItems: 'center',

  },  logo: {
    width: 100,
    height: 100,
    objectFit: 'contain',
    alignSelf: 'center',
    marginVertical: 16,
  },
  logoHeader: {
    width: 40,
    height: 40,
    objectFit: 'cover',
marginRight: 10,
borderRadius: 50,
 },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginTop: 4,
  },
  emergencyButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#ff4d4d',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  emergencyText: {
    fontSize: 50,
    color: '#fff',
    fontWeight: 'bold',
  },
  spacer: {
    height: 40,
  },
  optionsContainer: {
    width: '100%',
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  optionCard: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginTop: 8,
  },
  servicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  servicesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: '#007bff',
  },
  servicesScrollContainer: {
    width: '100%',
    marginBottom: 16,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 8,
    alignItems: 'center',
    width: 120,
    margin:10
  },
  serviceCardText: {
    fontSize: 14,
    color: '#555',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default EmergencyHelpScreen;
