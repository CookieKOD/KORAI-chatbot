import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ConsultationScreen from '../screens/ConsultationScreen';
import OtoscopeScreen from '../screens/OtoscopeScreen';
import RapportScreen from '../screens/RapportScreen';

const Tab = createBottomTabNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Accueil') iconName = 'home';
            else if (route.name === 'Consultation') iconName = 'chat-bubble';
            else if (route.name === 'Otoscope') iconName = 'photo-camera';
            else if (route.name === 'Rapports') iconName = 'description';
            return <Icon name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Accueil" component={DashboardScreen} />
        <Tab.Screen name="Consultation" component={ConsultationScreen} />
        <Tab.Screen name="Otoscope" component={OtoscopeScreen} />
        <Tab.Screen name="Rapports" component={RapportScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}