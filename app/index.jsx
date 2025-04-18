import { Link, Redirect, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View,Text, SafeAreaView } from 'react-native';

const Index = () => {
    return (
      <Redirect href={'/(tabs)/'} />
      // <Redirect href={'/(parent)'} />


    );
}

const styles = StyleSheet.create({})

export default Index;
