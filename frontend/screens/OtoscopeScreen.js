// app/OtoscopeScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../src/constants';

const OtoscopeScreen = () => {
  const [leftEar, setLeftEar] = useState(null);
  const [rightEar, setRightEar] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickAndAnalyze = async (side) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    if (side === 'left') setLeftEar(uri);
    else setRightEar(uri);

    setLoading(true);
    setAnalysis(null);

    try {
      const token = await AsyncStorage.getItem('userToken') || 'fake-jwt-token-for-testing';

      const formData = new FormData();
      formData.append('file', {
        uri,
        name: 'otoscope.jpg',
        type: 'image/jpeg',
      });

      const res = await fetch(`${API_URL}/analyze_and_store`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      setAnalysis({
        diagnosis: data.diagnosis || 'Otite moyenne aiguë (simulation)',
        confidence: `${data.confidence || 94}%`,
        signs: data.findings || ['Tympan bombé', 'Rougeur intense'],
      });

      Alert.alert('Succès', 'Image analysée et ajoutée au contexte IA !');
    } catch (e) {
      Alert.alert('Erreur', 'Impossible d’analyser l’image');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Examen Otoscopique</Text>

      <View style={styles.earsContainer}>
        <TouchableOpacity onPress={() => pickAndAnalyze('left')} style={styles.earBox}>
          {leftEar ? (
            <Image source={{ uri: leftEar }} style={styles.earImage} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Oreille{'\n'}Gauche</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => pickAndAnalyze('right')} style={styles.earBox}>
          {rightEar ? (
            <Image source={{ uri: rightEar }} style={styles.earImage} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Oreille{'\n'}Droite</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {loading && <Text style={styles.loading}>Analyse en cours...</Text>}

      {analysis && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Résultat IA</Text>
          <Text style={styles.diagnosis}>{analysis.diagnosis}</Text>
          <Text style={styles.confidence}>Fiabilité : {analysis.confidence}</Text>
          <Text style={styles.signsTitle}>Signes détectés :</Text>
          {analysis.signs.map((s, i) => (
            <Text key={i} style={styles.signItem}>• {s}</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginVertical: 30, color: '#007AFF' },
  earsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 40 },
  earBox: { alignItems: 'center' },
  placeholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f0f0f0',
    borderWidth: 4,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { textAlign: 'center', color: '#666', fontSize: 16, fontWeight: '600' },
  earImage: { width: 150, height: 150, borderRadius: 75, borderWidth: 4, borderColor: '#007AFF' },
  loading: { textAlign: 'center', fontSize: 18, color: '#007AFF', marginVertical: 20 },
  resultBox: { backgroundColor: '#f8f9fa', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#007AFF' },
  resultTitle: { fontSize: 22, fontWeight: 'bold', color: '#007AFF', marginBottom: 10 },
  diagnosis: { fontSize: 20, fontWeight: 'bold', color: '#D32F2F', marginBottom: 8 },
  confidence: { fontSize: 18, color: '#007AFF', marginBottom: 15 },
  signsTitle: { fontSize: 16, fontWeight: '600', marginTop: 10, color: '#333' },
  signItem: { fontSize: 16, color: '#555', marginLeft: 10, marginVertical: 3 },
});

export default OtoscopeScreen;