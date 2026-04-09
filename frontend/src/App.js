import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Navigation from './src/navigation';
import { authAPI } from './src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    const token = await AsyncStorage.getItem('token');
    setIsLoggedIn(!!token);
    setLoading(false);
  };

  if (loading) return <View style={styles.container}><Text>Chargement...</Text></View>;

  return isLoggedIn ? <Navigation /> : <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});