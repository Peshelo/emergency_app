import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Vibration, Alert } from 'react-native';
import * as Location from 'expo-location'; // Import Expo's Location module
import { Stack } from 'expo-router';

const SOSButton = () => {
  const [isHolding, setIsHolding] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const progress = useRef(new Animated.Value(0)).current;
  const expansion = useRef(new Animated.Value(0)).current; // New Animated value for expansion

  useEffect(() => {
    if (isHolding) {
      const countdownTimer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);

      // Start the animation for the progress indicator
      Animated.timing(progress, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: false,
      }).start();

      // Start the animation for the expanding circle
      Animated.timing(expansion, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: false,
      }).start();

      const timeout = setTimeout(() => {
        if (isHolding) {
          sendSOS();
          Vibration.vibrate(1000); // Trigger phone vibration
        }
        clearInterval(countdownTimer);
      }, 5000);

      return () => {
        clearInterval(countdownTimer);
        clearTimeout(timeout); // Clear the timeout when component unmounts or button released
      };
    } else {
      setCountdown(5);
      Animated.timing(progress, {
        toValue: 0,
        duration: 0,
        useNativeDriver: false,
      }).start();

      // Reset the expansion animation to shrink back
      Animated.timing(expansion, {
        toValue: 0,
        duration: 300, // Duration for shrinking back to 0
        useNativeDriver: false,
      }).start();
    }
  }, [isHolding]);

  const sendSOS = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required to send SOS.');
      return;
    }

    let userLocation = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = userLocation.coords;
    
    // Log the user location
    console.log('User Location:', userLocation);

    // Construct the SOS payload
    const sosPayload = {
      name: 'Tawana G', // Replace with the actual user name or get it from context/state
      latitude: latitude,
      longitude: longitude,
    };

    // Log the SOS payload
    console.log('SOS Payload:', sosPayload);

    // Send SOS alert
    try {
      const response = await fetch('http://192.168.157.28:8080/send-sos', { // Adjust this line for your environment
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sosPayload),
      });

      // Log the response for debugging
      const responseData = await response.json();
      console.log('Response Data:', responseData);

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${responseData.message}`);
      }

      Alert.alert('SOS Sent', `Location: ${latitude}, ${longitude}\n${responseData.message}`);
      console.log('SOS Alert:', { name: sosPayload.name, location: { latitude, longitude } });
    } catch (error) {
      console.error('Error sending SOS:', error);
      Alert.alert('Error', 'Failed to send SOS signal. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Faint expanding circle */}
      <Stack.Screen options={{ title: 'Send SOS Alert',headerShown:true  }}/>

      <Animated.View
        style={[
          styles.expandingCircle,
          {
            transform: [
              {
                scale: expansion.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 3], // Scale from 0 to 3 times the original size
                }),
              },
            ],
          },
        ]}
      />

      <View style={styles.circleContainer}>
        <TouchableOpacity
          onPressIn={() => setIsHolding(true)}
          onPressOut={() => setIsHolding(false)}
          style={styles.sosButton}
        >
          <Text style={styles.sosText}>SOS</Text>
          <Animated.View
            style={[
              styles.progressCircle,
              {
                strokeDashoffset: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
            ]}
          />
        </TouchableOpacity>
        <Text style={styles.timerText}>{isHolding ? countdown : ''}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  expandingCircle: {
    position: 'absolute',
    width: 200, // Initial size of the expanding circle
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 59, 48, 0.2)', // Faint red color
    top: '50%', // Center vertically
    left: '50%', // Center horizontally
    transform: [{ translateX: -100 }, { translateY: -100 }], // Center the circle
    zIndex: 1,
  },
  circleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2, // Bring the SOS button to the front
  },
  sosButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  sosText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressCircle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderColor: '#ff3b30',
    borderWidth: 5,
    transform: [{ rotate: '90deg' }],
    strokeDasharray: 100,
    strokeDashoffset: 100,
  },
  timerText: {
    marginTop: 10,
    fontSize: 24,
    color: '#333',
  },
});

export default SOSButton;
