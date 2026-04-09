import { View } from 'react-native';
import { Slot } from 'expo-router';

// Ce fichier dit juste à Expo Router : « utilise le _layout.tsx parent »
export default function Index() {
  return <Slot />;
}
