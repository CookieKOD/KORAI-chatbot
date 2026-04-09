import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const DashboardScreen = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Header bleu */}
      <View style={styles.header}>
        <Text style={styles.welcome}>Bonjour, Dr. Ndiaye</Text>
        <Text style={styles.subWelcome}>Bienvenue sur KORAI.</Text>
      </View>

      {/* Cartes de statistiques */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>18</Text>
          <Text style={styles.statLabel}>Consultations</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>24</Text>
          <Text style={styles.statLabel}>Patients</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>92</Text>
          <Text style={styles.statLabel}>Diagnostics</Text>
        </View>
      </View>

      {/* Section "C'est quoi KORAI ?" */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>C’est quoi KORAI ?</Text>
        
        <View style={styles.featureCard}>
          <Text style={styles.featureText}>Gestion sécurisée des dossiers patients ORL</Text>
        </View>
        <View style={styles.featureCard}>
          <Text style={styles.featureText}>Accès rapide aux recommandations médicales</Text>
        </View>
        <View style={styles.featureCard}>
          <Text style={styles.featureText}>Collaboration fluide entre professionnels de santé</Text>
        </View>
        <View style={styles.featureCard}>
          <Text style={styles.featureText}>Confidentialité optimale grâce au chiffrement des données</Text>
        </View>
      </View>
    </ScrollView>
  );
};

// Styles exactement comme dans ta maquette
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#0891B2',
    padding: 20,
    paddingTop: 50,
  },
  welcome: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subWelcome: { fontSize: 16, color: '#fff', marginTop: 5 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: '#f5f5f5',
  },
  statCard: { alignItems: 'center' },
  statNumber: { fontSize: 36, fontWeight: 'bold', color: '#007AFF' },
  statLabel: { fontSize: 14, color: '#666', marginTop: 5 },
  infoSection: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  featureCard: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  featureText: { fontSize: 15, color: '#333' },
});

export default DashboardScreen;