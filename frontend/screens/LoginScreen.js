// app/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../src/constants';

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  // VERSION TEST RAPIDE (force la connexion sans backend)
  await AsyncStorage.setItem('userToken', 'test-token-12345');
  await AsyncStorage.setItem('userName', username || 'Docteur');
  onLogin();   // ← cette ligne fait passer directement à l’app
};

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/logo-korai.png')} // mets ton logo ici ou supprime la ligne
          style={styles.logo}
        />
        <Text style={styles.title}>KORAI</Text>
        <Text style={styles.subtitle}>Assistant ORL Intelligent</Text>
      </View>

      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Nom d'utilisateur" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry />

        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Connexion...' : 'Se connecter'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#007AFF' },
  logoContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 120, height: 120, marginBottom: 20 },
  title: { fontSize: 48, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 18, color: '#fff', marginTop: 10 },
  form: { padding: 30 },
  input: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 15, fontSize: 16 },
  btn: { backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#007AFF', fontWeight: 'bold', fontSize: 18 },
});

export default LoginScreen;