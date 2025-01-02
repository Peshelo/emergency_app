import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Stack, useRouter } from 'expo-router'; // For navigation
import PhoneInput from 'react-native-phone-number-input'; // Import the phone input component

const Register = () => {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nationalID, setNationalID] = useState('');
  const [error, setError] = useState('');
  const [countryCode, setCountryCode] = useState('');

  // Check if user credentials are already saved
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

  // Validate inputs
  const validateInputs = () => {
    setError('');
    if (!firstName || !lastName || !address || !phoneNumber || !nationalID) {
      setError('All fields are required');
      return false;
    }
    // if (!/^\d{9}$/.test(nationalID.replace(/[^\w]/g, ''))) {
    //   setError('National ID must be in the format: 08123456D53');
    //   return false;
    // }
    if (phoneNumber.length < 10) {
      setError('Phone number must be valid');
      return false;
    }
    return true;
  };

  // Handle registration
  const handleRegister = async () => {
    if (!validateInputs()) return;

    try {
      await SecureStore.setItemAsync('user_firstname', firstName);
      await SecureStore.setItemAsync('user_lastname', lastName);
      await SecureStore.setItemAsync('user_address', address);
      await SecureStore.setItemAsync('user_phone', phoneNumber);
      await SecureStore.setItemAsync('user_national_id', nationalID);

      Alert.alert('Registration Successful', 'Your details have been saved securely.');
      router.push('auth/login'); // After registration, navigate to login
    } catch (error) {
      console.error('Error storing user data', error);
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
      <PhoneInput
        defaultValue={phoneNumber}
        defaultCode="US" // Set default country code
        layout="first"
        onChangeFormattedText={setPhoneNumber}
        onChangeCountry={setCountryCode} // Update country code on selection
        withDarkTheme
        withShadow
        autoFocus
        containerStyle={styles.phoneInput}
        textInputStyle={{ color: 'black' }} // Make phone number text black
      />
      <TextInput
        style={styles.input}
        placeholder="National ID"
        keyboardType="default"
        value={nationalID}
        onChangeText={setNationalID}
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
  phoneInput: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 50,
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
