import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Stack, useRouter } from 'expo-router'; // For navigation
import pb from "@/lib/connection"; // Assuming you have the PocketBase connection file

const Register = () => {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nationalID, setNationalID] = useState('');
  const [error, setError] = useState('');

  const checkCredentials = async () => {
    try {
      const userFirstName = await SecureStore.getItemAsync('user_firstname');
      if (userFirstName) {
        // If credentials exist, navigate to the login screen
        // router.push('auth/login');
      }
    } catch (error) {
      console.error('Error checking credentials', error);
    }
  };

  useEffect(() => {
    checkCredentials(); // Check credentials on mount
  }, []);

  const validateInputs = () => {
    setError('');
    if (!firstName || !lastName || !address || !phoneNumber || !nationalID) {
      setError('All fields are required');
      return false;
    }
    // Phone number validation with regex (international format)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/; // International phone number format
    if (!phoneRegex.test(phoneNumber)) {
      setError('Phone number must be in the format: +1234567890');
      return false;
    }
    // National ID format validation (e.g. 08123456D53)
    const nationalIDRegex = /^\d{8}[A-Z]{1}\d{2}$/; // Example: 08123456D53
    if (!nationalIDRegex.test(nationalID)) {
      setError('National ID must be in the format: 08123456D53');
      return false;
    }
    return true;
  };

  // Handle registration with PocketBase
  const handleRegister = async () => {
    if (!validateInputs()) return;

    try {
      const newCitizen = {
        firstname: firstName,
        lastname: lastName,
        address: address,
        phoneNumber: phoneNumber,
        nationalId: nationalID,
      };

      // Save user data to PocketBase collection (citizens)
      await pb.collection('citizens').create(newCitizen);

      // Store user details locally for secure access (if needed)
      await SecureStore.setItemAsync('user_firstname', firstName);
      await SecureStore.setItemAsync('user_lastname', lastName);
      await SecureStore.setItemAsync('user_address', address);
      await SecureStore.setItemAsync('user_phone', phoneNumber);
      await SecureStore.setItemAsync('user_national_id', nationalID);

      Alert.alert('Registration Successful', 'Your details have been saved securely.');
      // router.push('auth/login'); // After registration, navigate to login'
      router.push('/(tabs)/'); // After registration, navigate to login
    } catch (error) {
      console.error('Error storing user data in PocketBase', error);
      Alert.alert('Error', 'Something went wrong while saving your details.');
    }
  };

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#f2f2f7' }}>
      <Stack.Screen options={{ title: 'Register', headerShown: false }} />
      <Image source={require('../../assets/images/icon.png')} style={{ width: 120, height: 120, alignSelf: 'center', marginBottom: 24, borderRadius: 10 }} />
      <Text style={{ fontSize: 32, fontWeight: '600', textAlign: 'center', marginBottom: 24 }}>Create an Account</Text>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number (e.g. +26377567890)"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="National ID (e.g. 08123456D53)"
        value={nationalID}
        onChangeText={setNationalID}
        keyboardType="default"
        maxLength={12} // Assuming maximum length of National ID is 12 characters
      />

      {error ? <Text style={{ color: 'red', textAlign: 'center', marginTop: 8 }}>{error}</Text> : null}

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
      >
        <Text style={{ color: '#fff', fontSize: 18 }}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ marginTop: 16, alignSelf: 'center' }}
        onPress={() => router.push('auth/login')}
      >
        <Text style={{ color: '#007aff', fontSize: 16 }}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = {
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingLeft: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    width: '100%', // Ensure full width
  },
  button: {
    backgroundColor: '#007aff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
};

export default Register;
