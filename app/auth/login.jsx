import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Image } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { Stack, useRouter } from 'expo-router'; // For navigation

const Login = () => {
    
  const router = useRouter();
  const [hasBiometricHardware, setHasBiometricHardware] = useState(false);

  // Check if biometric authentication is supported on the device
  useEffect(() => {
    const checkBiometricSupport = async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      setHasBiometricHardware(hasHardware);
    };

    checkBiometricSupport();
    handleLoginWithBiometrics(); // Automatically prompt for biometric login on screen load
  }, []);

  // Authenticate using biometrics
  const handleLoginWithBiometrics = async () => {
       
    try {
        // await SecureStore.deleteItemAsync('user_firstname', firstName);
        // await SecureStore.deleteItemAsync('user_lastname', lastName);
        // await SecureStore.deleteItemAsync('user_address', address);
        // await SecureStore.deleteItemAsync('user_phone', phoneNumber);
        // await SecureStore.deleteItemAsync('user_national_id', nationalID);
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login with your fingerprint',
        fallbackLabel: 'Use Passcode',
      });

      if (result.success) {
        const firstName = await SecureStore.getItemAsync('user_firstname');
        const lastName = await SecureStore.getItemAsync('user_lastname');
        const phoneNumber = await SecureStore.getItemAsync('user_phone');

        if (firstName && lastName && phoneNumber) {
          Alert.alert('Welcome', `Hello, ${firstName} ${lastName}. Your phone number is ${phoneNumber}.`);
          // Redirect to the index tab screen after successful login
          router.push('/(tabs)/');
        } else {
          Alert.alert('Error', 'User data not found.');
        }
      } else {
        Alert.alert('Authentication Failed', 'Biometric authentication failed.');
      }
    } catch (error) {
      console.error('Error authenticating user', error);
      Alert.alert('Error', 'An error occurred while trying to authenticate.');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16, backgroundColor: '#f2f2f7' }}>
      <Stack.Screen options={{ title: 'Login', headerShown: false }} />

      <Image source={require('../../assets/images/icon.png')} style={{ width: 120, height: 120, alignSelf: 'center', marginBottom: 24, borderRadius: 10 }} />
      <Text style={{ fontSize: 32, fontWeight: '600', textAlign: 'center', marginBottom: 24 }}>Login</Text>

      {hasBiometricHardware ? (
        <TouchableOpacity
          style={{
            backgroundColor: '#007aff',
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 24,
          }}
          onPress={handleLoginWithBiometrics}
        >
          <Text style={{ color: '#fff', fontSize: 18 }}>Login with Fingerprint</Text>
        </TouchableOpacity>
      ) : (
        <Text style={{ textAlign: 'center', fontSize: 16 }}>Biometric authentication is not supported on this device.</Text>
      )}

      <TouchableOpacity
        style={{ marginTop: 16, alignSelf: 'center' }}
        onPress={() => router.push('auth/register')}
      >
        <Text style={{ color: '#007aff', fontSize: 16 }}>Create an Account</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;
