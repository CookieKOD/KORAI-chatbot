import * as ImagePicker from "expo-image-picker";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Ellipse, Line, Path, Rect } from "react-native-svg";

const API_URL = "http://127.0.0.1:8000";

// Couleurs médicales
const COLORS = {
  primary: "#0891B2",
  primaryDark: "#0E7490",
  primaryLight: "#CFFAFE",
  secondary: "#059669",
  secondaryLight: "#D1FAE5",
  background: "#F0FDFA",
  white: "#FFFFFF",
  text: "#1E3A5F",
  textLight: "#64748B",
  border: "#E2E8F0",
  warning: "#F59E0B",
  warningBg: "#FEF3C7",
  error: "#EF4444",
  success: "#10B981",
  disabled: "#94A3B8",
  disabledBg: "#F1F5F9",
};

// Liste des symptômes ORL
const SYMPTOMES = [
  { id: 1, label: "Douleur à l'oreille", icon: "ear" },
  { id: 2, label: "Diminution d'audition", icon: "hearing" },
  { id: 3, label: "Bourdonnements / Acouphènes", icon: "wave" },
  { id: 4, label: "Écoulement de l'oreille", icon: "drop" },
  { id: 5, label: "Oreille bouchée", icon: "blocked" },
  { id: 6, label: "Sensibilité au bruit", icon: "sound" },
  { id: 7, label: "Vertiges", icon: "dizzy" },
  { id: 8, label: "Écoulement de sang", icon: "blood" },
  { id: 9, label: "Démangeaisons à l'oreille", icon: "itch" },
];

// Icônes SVG médicales
const MedicalCrossIcon = ({ size = 24, color = COLORS.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="9" y="3" width="6" height="18" rx="1" fill={color} />
    <Rect x="3" y="9" width="18" height="6" rx="1" fill={color} />
  </Svg>
);

const StethoscopeIcon = ({ size = 24, color = COLORS.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4.5 12.5C4.5 8.5 7 5.5 11 5.5M19.5 12.5C19.5 8.5 17 5.5 13 5.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="11" cy="4" r="1.5" fill={color} />
    <Circle cx="13" cy="4" r="1.5" fill={color} />
    <Path d="M4.5 12.5V14C4.5 17.5 7 20 12 20C17 20 19.5 17.5 19.5 14V12.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="20" cy="10" r="2" stroke={color} strokeWidth="2" />
  </Svg>
);

// Icône Oreille
const EarIcon = ({ size = 48, color = COLORS.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M12 18V21M9 21H15" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// Icône Nez
const NoseIcon = ({ size = 48, color = COLORS.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 4V14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M12 14C12 14 8 15 7 18C6.5 19.5 7 20 8 20C9 20 10 19.5 10.5 19" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M12 14C12 14 16 15 17 18C17.5 19.5 17 20 16 20C15 20 14 19.5 13.5 19" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="9" cy="17" r="1" fill={color} />
    <Circle cx="15" cy="17" r="1" fill={color} />
  </Svg>
);

// Icône Gorge
const ThroatIcon = ({ size = 48, color = COLORS.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Ellipse cx="12" cy="8" rx="6" ry="4" stroke={color} strokeWidth="2" />
    <Path d="M6 8V16C6 18.5 8.5 20 12 20C15.5 20 18 18.5 18 16V8" stroke={color} strokeWidth="2" />
    <Path d="M9 12H15" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M10 15H14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="12" cy="8" r="2" fill={color} opacity="0.3" />
  </Svg>
);

// Icône Cadenas
const LockIcon = ({ size = 20, color = COLORS.disabled }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="5" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth="2" />
    <Path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="12" cy="16" r="1.5" fill={color} />
  </Svg>
);

const UserIcon = ({ size = 24, color = COLORS.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" />
    <Path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const MaleIcon = ({ size = 32, color = COLORS.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="10" cy="14" r="6" stroke={color} strokeWidth="2" />
    <Path d="M14.5 9.5L20 4M20 4H15M20 4V9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const FemaleIcon = ({ size = 32, color = COLORS.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="9" r="6" stroke={color} strokeWidth="2" />
    <Path d="M12 15V21M9 18H15" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const HeartPulseIcon = ({ size = 24, color = COLORS.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 6C12 6 8 2 4.5 4.5C1 7 2 11 4 13L12 21L20 13C22 11 23 7 19.5 4.5C16 2 12 6 12 6Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 12H8L10 9L12 15L14 11L16 12H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ClipboardIcon = ({ size = 24, color = COLORS.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="5" y="4" width="14" height="17" rx="2" stroke={color} strokeWidth="2" />
    <Rect x="8" y="2" width="8" height="4" rx="1" fill={color} />
    <Line x1="8" y1="10" x2="16" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="8" y1="14" x2="16" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="8" y1="18" x2="12" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const CameraIcon = ({ size = 24, color = COLORS.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 8C4 6.89543 4.89543 6 6 6H8L9 4H15L16 6H18C19.1046 6 20 6.89543 20 8V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V8Z" stroke={color} strokeWidth="2" />
    <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth="2" />
  </Svg>
);

const RefreshIcon = ({ size = 24, color = COLORS.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 12C4 7.58172 7.58172 4 12 4C15.0736 4 17.7554 5.64664 19.2 8.1M20 12C20 16.4183 16.4183 20 12 20C8.92638 20 6.24456 18.3534 4.8 15.9" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M20 4V8H16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M4 20V16H8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const WarningIcon = ({ size = 20, color = COLORS.warning }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3L22 21H2L12 3Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <Line x1="12" y1="10" x2="12" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="12" cy="17" r="1" fill={color} />
  </Svg>
);

const CheckIcon = ({ size = 18, color = COLORS.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12L10 17L19 7" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ArrowLeftIcon = ({ size = 20, color = COLORS.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ArrowRightIcon = ({ size = 20, color = COLORS.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 6L15 12L9 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function ConsultationScreen() {
  const [step, setStep] = useState(0);
  const [consultationType, setConsultationType] = useState(null);
  const [age, setAge] = useState("");
  const [sexe, setSexe] = useState("");
  const [symptomesSelectionnes, setSymptomesSelectionnes] = useState([]);
  const [antecedents, setAntecedents] = useState("");
  const [autresSymptomes, setAutresSymptomes] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [diagnostic, setDiagnostic] = useState(null);
  
  const scrollViewRef = useRef(null);

  const toggleSymptome = (symptomeLabel) => {
    if (symptomesSelectionnes.includes(symptomeLabel)) {
      setSymptomesSelectionnes(symptomesSelectionnes.filter(s => s !== symptomeLabel));
    } else {
      setSymptomesSelectionnes([...symptomesSelectionnes, symptomeLabel]);
    }
  };

  const handleSelectConsultationType = (type) => {
    if (type === "oreille") {
      setConsultationType(type);
      setStep(1);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!age || parseInt(age) < 0 || parseInt(age) > 120) {
        Alert.alert("Erreur", "Veuillez entrer un âge valide (0-120 ans)");
        return;
      }
    } else if (step === 2) {
      if (!sexe) {
        Alert.alert("Erreur", "Veuillez sélectionner un sexe");
        return;
      }
    } else if (step === 3) {
      if (symptomesSelectionnes.length === 0) {
        Alert.alert("Erreur", "Veuillez sélectionner au moins un symptôme");
        return;
      }
    }
    
    if (step < 4) {
      setStep(step + 1);
    } else {
      soumettreFormulaire();
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const soumettreFormulaire = async () => {
    setLoading(true);

    const typeLabel = consultationType === "oreille" ? "auriculaire/otologique" : consultationType;
    let messageConstruit = `Patient: ${age} ans, sexe ${sexe}. Consultation ${typeLabel}. `;
    
    if (symptomesSelectionnes.length > 0) {
      messageConstruit += `Symptômes: ${symptomesSelectionnes.join(", ")}. `;
    }
    
    if (autresSymptomes.trim()) {
      messageConstruit += `Autres symptômes: ${autresSymptomes}. `;
    }
    
    if (antecedents.trim()) {
      messageConstruit += `Antécédents: ${antecedents}. `;
    }
    
    messageConstruit += "Quel est le diagnostic ORL probable?";

    const userMessage = { 
      role: "user", 
      content: `Consultation ORL (${typeLabel}):\nÂge: ${age} ans\nSexe: ${sexe}\nSymptômes: ${symptomesSelectionnes.join(", ")}\n${autresSymptomes ? `Autres: ${autresSymptomes}\n` : ""}Antécédents: ${antecedents || "Aucun"}`
    };
    
    setMessages([userMessage]);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageConstruit,
          show_sources: true,
        }),
      });

      const data = await response.json();

      const diagnosticMessage = {
        role: "assistant",
        content: data?.response || "Impossible d'établir un diagnostic. Veuillez consulter un médecin.",
      };
      
      setMessages(prev => [...prev, diagnosticMessage]);
      setDiagnostic(diagnosticMessage.content);
      setStep(5);
      
    } catch (error) {
      console.error("Erreur RAG :", error);
      Alert.alert("Erreur", "Problème de communication avec le serveur");
    } finally {
      setLoading(false);
    }
  };

  const analyzeImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        alert("Permission refusée");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled) return;

      const imageUri = result.assets[0].uri;

      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: "Image envoyée pour analyse",
          image: imageUri,
        },
      ]);

      setLoading(true);

      const imageResponse = await fetch(imageUri);
      const blob = await imageResponse.blob();

      const formData = new FormData();
      formData.append("file", blob, "image.jpg");

      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Analyse d'image : ${data?.prediction || "Inconnu"}\nConfiance : ${((data?.confidence || 0)).toFixed(1)}%`,
        },
      ]);
    } catch (error) {
      console.error("Erreur image :", error);
      Alert.alert("Erreur", "Échec de l'analyse d'image");
    } finally {
      setLoading(false);
    }
  };

  const resetFormulaire = () => {
    setStep(0);
    setConsultationType(null);
    setAge("");
    setSexe("");
    setSymptomesSelectionnes([]);
    setAntecedents("");
    setAutresSymptomes("");
    setMessages([]);
    setDiagnostic(null);
  };

  // Header avec logo et progression
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <MedicalCrossIcon size={28} color={COLORS.white} />
        </View>
        <View style={styles.logoTextContainer}>
          <Text style={styles.logoTitle}>KORAI</Text>
          <Text style={styles.logoSubtitle}>Assistant ORL</Text>
        </View>
      </View>
      
      {step >= 1 && step < 5 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(step / 4) * 100}%` }]} />
          </View>
          <View style={styles.stepsContainer}>
            {[1, 2, 3, 4].map((s) => (
              <View
                key={s}
                style={[
                  styles.stepDot,
                  s <= step ? styles.stepDotActive : styles.stepDotInactive,
                ]}
              >
                {s < step ? (
                  <CheckIcon size={12} color={COLORS.white} />
                ) : (
                  <Text style={[styles.stepNumber, s <= step && styles.stepNumberActive]}>
                    {s}
                  </Text>
                )}
              </View>
            ))}
          </View>
          <View style={styles.stepLabels}>
            <Text style={styles.stepLabel}>Âge</Text>
            <Text style={styles.stepLabel}>Sexe</Text>
            <Text style={styles.stepLabel}>Symptômes</Text>
            <Text style={styles.stepLabel}>Antécédents</Text>
          </View>
        </View>
      )}
    </View>
  );

  // ÉTAPE 0 : Choix du type de consultation
  const renderEtape0 = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <StethoscopeIcon size={28} color={COLORS.primary} />
        <Text style={styles.cardTitle}>Type de consultation</Text>
      </View>
      
      <Text style={styles.label}>Quelle zone souhaitez-vous examiner ?</Text>
      
      <View style={styles.consultationTypeContainer}>
        {/* Oreille - Disponible */}
        <TouchableOpacity 
          style={[styles.consultationTypeCard, styles.consultationTypeAvailable]} 
          onPress={() => handleSelectConsultationType("oreille")}
          activeOpacity={0.7}
        >
          <View style={styles.availableBadge}>
            <Text style={styles.availableBadgeText}>Disponible</Text>
          </View>
          <EarIcon size={44} color={COLORS.primary} />
          <Text style={[styles.consultationTypeLabel, styles.consultationTypeLabelAvailable]}>
            Oreille
          </Text>
          <Text style={styles.tapToStart}>Appuyez pour commencer</Text>
        </TouchableOpacity>

        {/* Nez - Désactivé */}
        <View style={[styles.consultationTypeCard, styles.consultationTypeDisabled]}>
          <View style={styles.lockBadge}>
            <LockIcon size={16} color={COLORS.disabled} />
          </View>
          <NoseIcon size={44} color={COLORS.disabled} />
          <Text style={[styles.consultationTypeLabel, styles.consultationTypeLabelDisabled]}>
            Nez
          </Text>
          <Text style={styles.comingSoonBadge}>Bientot disponible</Text>
        </View>

        {/* Gorge - Désactivé */}
        <View style={[styles.consultationTypeCard, styles.consultationTypeDisabled]}>
          <View style={styles.lockBadge}>
            <LockIcon size={16} color={COLORS.disabled} />
          </View>
          <ThroatIcon size={44} color={COLORS.disabled} />
          <Text style={[styles.consultationTypeLabel, styles.consultationTypeLabelDisabled]}>
            Gorge
          </Text>
          <Text style={styles.comingSoonBadge}>Bientot disponible</Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <WarningIcon size={18} color={COLORS.primary} />
        <Text style={styles.infoBoxText}>
          Seule la consultation auriculaire (oreille) est disponible pour le moment. Les modules nez et gorge seront ajoutes prochainement.
        </Text>
      </View>
    </View>
  );

  const renderEtape1 = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <UserIcon size={28} color={COLORS.primary} />
        <Text style={styles.cardTitle}>Informations du patient</Text>
      </View>
      
      <Text style={styles.label}>Quel est l'âge du patient ?</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Entrez l'âge"
          placeholderTextColor={COLORS.textLight}
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
          maxLength={3}
        />
        <Text style={styles.inputSuffix}>ans</Text>
      </View>
      
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handlePrevious}>
          <ArrowLeftIcon size={20} color={COLORS.primary} />
          <Text style={styles.secondaryButtonText}>Retour</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
          <Text style={styles.primaryButtonText}>Continuer</Text>
          <ArrowRightIcon size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEtape2 = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <UserIcon size={28} color={COLORS.primary} />
        <Text style={styles.cardTitle}>Sexe du patient</Text>
      </View>
      
      <Text style={styles.label}>Sélectionnez le sexe</Text>
      
      <View style={styles.sexeContainer}>
        <TouchableOpacity
          style={[
            styles.sexeCard,
            sexe === "Masculin" && styles.sexeCardActive,
          ]}
          onPress={() => setSexe("Masculin")}
        >
          <View style={[styles.sexeIconContainer, sexe === "Masculin" && styles.sexeIconContainerActive]}>
            <MaleIcon size={40} color={sexe === "Masculin" ? COLORS.white : COLORS.primary} />
          </View>
          <Text style={[styles.sexeLabel, sexe === "Masculin" && styles.sexeLabelActive]}>
            Masculin
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.sexeCard,
            sexe === "Feminin" && styles.sexeCardActive,
          ]}
          onPress={() => setSexe("Feminin")}
        >
          <View style={[styles.sexeIconContainer, sexe === "Feminin" && styles.sexeIconContainerActive]}>
            <FemaleIcon size={40} color={sexe === "Feminin" ? COLORS.white : COLORS.primary} />
          </View>
          <Text style={[styles.sexeLabel, sexe === "Feminin" && styles.sexeLabelActive]}>
            Féminin
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handlePrevious}>
          <ArrowLeftIcon size={20} color={COLORS.primary} />
          <Text style={styles.secondaryButtonText}>Retour</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
          <Text style={styles.primaryButtonText}>Continuer</Text>
          <ArrowRightIcon size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEtape3 = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <EarIcon size={28} color={COLORS.primary} />
        <Text style={styles.cardTitle}>Symptomes auriculaires</Text>
      </View>
      
      <Text style={styles.label}>Selectionnez les symptomes</Text>
      
      <View style={styles.symptomesGrid}>
        {SYMPTOMES.map((symptome) => (
          <TouchableOpacity
            key={symptome.id}
            style={[
              styles.symptomeCard,
              symptomesSelectionnes.includes(symptome.label) && styles.symptomeCardActive,
            ]}
            onPress={() => toggleSymptome(symptome.label)}
          >
            <View style={[
              styles.symptomeCheckbox,
              symptomesSelectionnes.includes(symptome.label) && styles.symptomeCheckboxActive,
            ]}>
              {symptomesSelectionnes.includes(symptome.label) && (
                <CheckIcon size={14} color={COLORS.white} />
              )}
            </View>
            <Text style={[
              styles.symptomeLabel,
              symptomesSelectionnes.includes(symptome.label) && styles.symptomeLabelActive,
            ]}>
              {symptome.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.label}>Autres symptômes (optionnel)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Décrivez d'autres symptômes..."
        placeholderTextColor={COLORS.textLight}
        value={autresSymptomes}
        onChangeText={setAutresSymptomes}
        multiline
        numberOfLines={3}
      />
      
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handlePrevious}>
          <ArrowLeftIcon size={20} color={COLORS.primary} />
          <Text style={styles.secondaryButtonText}>Retour</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
          <Text style={styles.primaryButtonText}>Continuer</Text>
          <ArrowRightIcon size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEtape4 = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <HeartPulseIcon size={28} color={COLORS.primary} />
        <Text style={styles.cardTitle}>Antécédents médicaux</Text>
      </View>
      
      <Text style={styles.label}>Antécédents médicaux et opérations</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Ex: Allergies, opérations, maladies chroniques..."
        placeholderTextColor={COLORS.textLight}
        value={antecedents}
        onChangeText={setAntecedents}
        multiline
        numberOfLines={5}
      />
      
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handlePrevious}>
          <ArrowLeftIcon size={20} color={COLORS.primary} />
          <Text style={styles.secondaryButtonText}>Retour</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.primaryButton, loading && styles.primaryButtonDisabled]} 
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>Analyser</Text>
              <StethoscopeIcon size={20} color={COLORS.white} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEtape5 = () => (
    <View>
      <View style={styles.resultHeader}>
        <ClipboardIcon size={32} color={COLORS.white} />
        <Text style={styles.resultHeaderTitle}>Bilan de Consultation</Text>
        <Text style={styles.resultHeaderSubtitle}>Consultation auriculaire</Text>
      </View>

      {/* Récapitulatif */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Récapitulatif</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Âge:</Text>
          <Text style={styles.summaryValue}>{age} ans</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Sexe:</Text>
          <Text style={styles.summaryValue}>{sexe}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Symptômes:</Text>
          <Text style={styles.summaryValue}>{symptomesSelectionnes.join(", ")}</Text>
        </View>
        {antecedents && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Antécédents:</Text>
            <Text style={styles.summaryValue}>{antecedents}</Text>
          </View>
        )}
      </View>

      {/* Diagnostic */}
      <View style={styles.diagnosticCard}>
        <View style={styles.diagnosticHeader}>
          <StethoscopeIcon size={24} color={COLORS.secondary} />
          <Text style={styles.diagnosticTitle}>Analyse des symptômes</Text>
        </View>
        <Text style={styles.diagnosticText}>{diagnostic}</Text>
      </View>

      {/* Messages d'analyse d'image */}
      {messages.filter(m => m.image || m.content.includes("Analyse d'image")).map((msg, index) => (
        <View key={index} style={styles.imageAnalysisCard}>
          {msg.image && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: msg.image }} style={styles.imagePreviewThumbnail} />
              <View style={styles.imagePreviewBadge}>
                <CameraIcon size={14} color={COLORS.white} />
              </View>
            </View>
          )}
          <View style={styles.imageAnalysisContent}>
            <Text style={styles.imageAnalysisLabel}>Analyse d&apos;image</Text>
            <Text style={styles.imageAnalysisText}>{msg.content}</Text>
          </View>
        </View>
      ))}

      {/* Avertissement */}
      <View style={styles.warningCard}>
        <WarningIcon size={24} color={COLORS.warning} />
        <Text style={styles.warningText}>
          Ce diagnostic est donné à titre indicatif uniquement. Veuillez consulter un spécialiste ORL pour une évaluation complète.
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.imageButton} onPress={analyzeImage} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <CameraIcon size={22} color={COLORS.white} />
              <Text style={styles.imageButtonText}>Ajouter Photo</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetButton} onPress={resetFormulaire}>
          <RefreshIcon size={22} color={COLORS.white} />
          <Text style={styles.resetButtonText}>Nouvelle consultation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView 
        ref={scrollViewRef} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === 0 && renderEtape0()}
        {step === 1 && renderEtape1()}
        {step === 2 && renderEtape2()}
        {step === 3 && renderEtape3()}
        {step === 4 && renderEtape4()}
        {step === 5 && renderEtape5()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  logoCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoTextContainer: {
    marginLeft: 12,
  },
  logoTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
  },
  logoSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 3,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 3,
  },
  stepsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  stepDotActive: {
    backgroundColor: COLORS.white,
  },
  stepDotInactive: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "rgba(255,255,255,0.8)",
  },
  stepNumberActive: {
    color: COLORS.primary,
  },
  stepLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.white,
    textAlign: "center",
    width: 75,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginLeft: 12,
  },
  label: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
    fontWeight: "500",
  },
  
  // Styles pour l'étape 0 - Type de consultation
  consultationTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  consultationTypeCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 8,
    marginHorizontal: 5,
    borderRadius: 16,
    borderWidth: 2,
    minHeight: 140,
  },
  consultationTypeAvailable: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  consultationTypeDisabled: {
    backgroundColor: COLORS.disabledBg,
    borderColor: COLORS.border,
  },
  consultationTypeLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 10,
    textAlign: "center",
  },
  consultationTypeLabelAvailable: {
    color: COLORS.primary,
  },
  consultationTypeLabelDisabled: {
    color: COLORS.disabled,
  },
  lockBadge: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  comingSoonBadge: {
    fontSize: 9,
    color: COLORS.disabled,
    marginTop: 4,
    fontStyle: "italic",
  },
  availableBadge: {
    position: "absolute",
    top: -10,
    backgroundColor: COLORS.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availableBadgeText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: "bold",
  },
  tapToStart: {
    fontSize: 9,
    color: COLORS.primary,
    marginTop: 4,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.primaryLight,
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  infoBoxText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
  
  // Autres styles
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputSuffix: {
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  sexeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  sexeCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    marginHorizontal: 8,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  sexeCardActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  sexeIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  sexeIconContainerActive: {
    backgroundColor: COLORS.primary,
  },
  sexeLabel: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  sexeLabelActive: {
    color: COLORS.primary,
  },
  symptomesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  symptomeCard: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginBottom: 10,
    marginHorizontal: "1%",
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  symptomeCardActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  symptomeCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  symptomeCheckboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  symptomeLabel: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
  },
  symptomeLabelActive: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  
  // Styles pour les résultats (étape 5)
  resultHeader: {
    backgroundColor: COLORS.primary,
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  resultHeaderTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.white,
    marginTop: 12,
  },
  resultHeaderSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    width: 100,
  },
  summaryValue: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  diagnosticCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  diagnosticHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  diagnosticTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.secondary,
    marginLeft: 10,
  },
  diagnosticText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 24,
  },
  imageAnalysisCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  imagePreviewContainer: {
    position: "relative",
    marginRight: 16,
  },
  imagePreviewThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  imagePreviewBadge: {
    position: "absolute",
    bottom: -6,
    right: -6,
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  imageAnalysisContent: {
    flex: 1,
  },
  imageAnalysisLabel: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "bold",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  imageAnalysisText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  warningCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.warningBg,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  warningText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  imageButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  imageButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },
  resetButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: COLORS.secondary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  resetButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
