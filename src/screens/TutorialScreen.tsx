import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  tips: string[];
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'intro',
    title: 'Välkommen! 🎮',
    description: 'Lär dig styra kulan genom banor med telefonens accelerometer!',
    icon: '⚽',
    tips: [
      'Luta telefonen för att röra kulan',
      'Målet är att nå guldmålet',
      'Undvik hinder och monster',
    ],
  },
  {
    id: 'controls',
    title: 'Kontroller 🕹️',
    description: 'Luta telefonen åt olika håll för att styra kulan',
    icon: '📱',
    tips: [
      'Luta höger → Kulan rullar höger',
      'Luta vänster → Kulan rullar vänster',
      'Luta framåt → Kulan rullar upp',
      'Luta bakåt → Kulan rullar ner',
      'Mindre lutning = långsammare',
      'Mer lutning = snabbare',
    ],
  },
  {
    id: 'obstacles',
    title: 'Hinder 🧱',
    description: 'Olika hinder har olika effekter',
    icon: '🚧',
    tips: [
      '🧱 Väggar - Studsar tillbaka',
      '🕳️ Hål - Instant död',
      '🧊 Is - Hal yta, svårare kontroll',
      '⚔️ Taggar - Dödliga',
      '🔥 Lava - Instant död',
    ],
  },
  {
    id: 'monsters',
    title: 'Monster 👹',
    description: 'Monster patrullerar och kan döda dig!',
    icon: '👹',
    tips: [
      'Rör inte monster!',
      'De rör sig i olika mönster',
      'Planera din väg runt dem',
      'Använd power-ups för skydd',
    ],
  },
  {
    id: 'special',
    title: 'Speciella Hinder 🌀',
    description: 'Avancerade hinder med unika effekter',
    icon: '✨',
    tips: [
      '🌀 Portaler - Teleporterar dig',
      '🌪️ Vindkraft - Påverkar rörelse',
      '🧲 Magneter - Drar dig in',
    ],
  },
  {
    id: 'powerups',
    title: 'Power-ups ⭐',
    description: 'Samla power-ups för fördelar!',
    icon: '⭐',
    tips: [
      '🛡️ Shield - Blockerar 1 träff',
      '⚡ Speed - 1.5x snabbare',
      '👻 Ghost - Går genom väggar',
      '🧲 Magnet - Dras till mål',
      '🕐 Slow-mo - Precision',
      '⭐ Invincible - Dödar monster!',
    ],
  },
  {
    id: 'progression',
    title: 'Progression 🏆',
    description: 'Samla stjärnor och lås upp innehåll',
    icon: '⭐',
    tips: [
      '⭐⭐⭐ = Klara under 10s',
      '⭐⭐ = Klara under 20s',
      '⭐ = Klara banan',
      'Stjärnor låser upp nya världar',
      'Klara achievements för skins',
      'Daily challenges för rewards',
    ],
  },
  {
    id: 'ready',
    title: 'Redo att spela! 🚀',
    description: 'Nu är du redo att erövra banorna!',
    icon: '🎊',
    tips: [
      'Börja med lätta banor',
      'Öva på kontrollerna',
      'Samla power-ups strategiskt',
      'Bygg din streak',
      'Ha kul!',
    ],
  },
];

const STORAGE_KEY = '@balance_game_tutorial_completed';

export function TutorialScreen({ navigation }: any) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  const handleNext = async () => {
    if (isLastStep) {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
      navigation.goBack();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, 'true');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.skipButton}
          onPress={() => setShowSkipConfirm(true)}
        >
          <Text style={styles.skipText}>Hoppa över</Text>
        </Pressable>
        <View style={styles.progressContainer}>
          {TUTORIAL_STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === currentStep && styles.progressDotActive,
                index < currentStep && styles.progressDotCompleted,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.icon}>{step.icon}</Text>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.description}>{step.description}</Text>

        <View style={styles.tipsContainer}>
          {step.tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        {currentStep > 0 && (
          <Pressable
            style={[styles.navButton, styles.navButtonSecondary]}
            onPress={handlePrevious}
          >
            <Ionicons name="arrow-back" size={24} color="#60a5fa" />
            <Text style={styles.navButtonTextSecondary}>Tillbaka</Text>
          </Pressable>
        )}

        <Pressable
          style={[
            styles.navButton,
            styles.navButtonPrimary,
            currentStep === 0 && styles.navButtonFull,
          ]}
          onPress={handleNext}
        >
          <Text style={styles.navButtonText}>
            {isLastStep ? 'Börja spela!' : 'Nästa'}
          </Text>
          <Ionicons name="arrow-forward" size={24} color="#fff" />
        </Pressable>
      </View>

      {/* Skip Confirmation Modal */}
      <Modal
        visible={showSkipConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSkipConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Hoppa över tutorial?</Text>
            <Text style={styles.modalText}>
              Du kan alltid komma tillbaka och läsa tutorialen senare.
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowSkipConfirm(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>Avbryt</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSkip}
              >
                <Text style={styles.modalButtonText}>Hoppa över</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    color: '#60a5fa',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(96, 165, 250, 0.3)',
  },
  progressDotActive: {
    backgroundColor: '#60a5fa',
    width: 24,
  },
  progressDotCompleted: {
    backgroundColor: '#10b981',
  },
  content: {
    flex: 1,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 26,
  },
  tipsContainer: {
    width: '100%',
    gap: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#e2e8f0',
    fontWeight: '500',
  },
  navigation: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 18,
    borderRadius: 14,
  },
  navButtonFull: {
    flex: 1,
  },
  navButtonPrimary: {
    backgroundColor: '#3b82f6',
  },
  navButtonSecondary: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  navButtonTextSecondary: {
    color: '#60a5fa',
    fontSize: 18,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(15, 23, 42, 0.98)',
    borderRadius: 24,
    padding: 30,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#3b82f6',
  },
  modalButtonSecondary: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  modalButtonTextSecondary: {
    color: '#60a5fa',
    fontSize: 17,
    fontWeight: '700',
  },
});
