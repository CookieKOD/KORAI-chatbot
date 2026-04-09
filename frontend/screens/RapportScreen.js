import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';

// Données temporaires (à remplacer plus tard par l'appel API)
const mockReports = [
  {
    id: 1,
    patient: 'Amadou Diop',
    date: '15/05/2023',
    diagnosis: 'Otite Moyenne Aiguë',
  },
  {
    id: 2,
    patient: 'Aminata Diallo',
    date: '10/05/2023',
    diagnosis: 'Tympan sain',
  },
  {
    id: 3,
    patient: 'Malick Sow',
    date: '05/05/2023',
    diagnosis: 'Perforation tympanique',
  },
];

const RapportScreen = () => {
  const [reports, setReports] = useState(mockReports);

  const handleGenerateReport = () => {
    Alert.alert(
      'Rapport généré',
      'Le rapport de la dernière consultation a été sauvegardé et est prêt à être partagé.',
      [{ text: 'OK' }]
    );
    // Ici tu pourras appeler ton endpoint /generate_report plus tard
  };

  const renderItem = ({ item }) => (
    <View style={styles.reportCard}>
      <Text style={styles.patientName}>
        Consultation ORL - {item.patient}
      </Text>
      <Text style={styles.date}>Date : {item.date}</Text>
      <Text style={styles.diagnosis}>Diagnostic : {item.diagnosis}</Text>

      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.btnShare}>
          <Text style={styles.btnText}>Partager</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnDownload}>
          <Text style={styles.btnText}>Télécharger</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rapports de Consultation</Text>

      <FlatList
        data={reports}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Bouton flottant en bas */}
      <TouchableOpacity style={styles.generateButton} onPress={handleGenerateReport}>
        <Text style={styles.generateButtonText}>Générer un Nouveau Rapport</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles fidèles à ta maquette
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  reportCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  diagnosis: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 8,
    fontWeight: '600',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  btnShare: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnDownload: {
    backgroundColor: '#34C759',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
  generateButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RapportScreen;