import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SplashScreen } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ConsultationScreen from '../screens/ConsultationScreen';
import OtoscopeScreen from '../screens/OtoscopeScreen';
import RapportScreen from '../screens/RapportScreen';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

SplashScreen.preventAutoHideAsync();

function MainApp() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home-outline' as any;
          if (route.name === 'Accueil') iconName = 'home-outline';
          else if (route.name === 'Consultation') iconName = 'chatbubble-outline';
          else if (route.name === 'Otoscope') iconName = 'camera-outline';
          else if (route.name === 'Rapports') iconName = 'document-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Accueil" component={DashboardScreen} />
      <Tab.Screen name="Consultation" component={ConsultationScreen} />
      <Tab.Screen name="Otoscope" component={OtoscopeScreen as any} />
      <Tab.Screen name="Rapports" component={RapportScreen} />
    </Tab.Navigator>
  );
}

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const token = await AsyncStorage.getItem('userToken');
      setIsLoggedIn(!!token);
      SplashScreen.hideAsync();
    };
    check();
  }, []);

  // TEST RAPIDE SANS LOGIN → décommente la ligne suivante
  return <MainApp />;

  if (isLoggedIn === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Chargement de KORAI...</Text>
      </View>
    );
  }

  // ON N’AJOUTE PLUS DE NavigationContainer ICI → Expo Router le fait déjà !
  return isLoggedIn ? <MainApp /> : <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: '600',
  },
});