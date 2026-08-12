import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  FlatList,
  Vibration,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Accelerometer } from 'expo-sensors';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { GameCanvas } from '../components/BalanceGame/GameCanvas';
import { levels, Level } from '../lib/balance-game/levels';
import { BallSkin, getSelectedSkin } from '../lib/balance-game/skins';
import { incrementAchievement } from '../lib/balance-game/achievements';
import { recordLevelComplete } from '../lib/balance-game/statistics';
import { WORLDS } from '../lib/balance-game/worlds';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function calculateStars(time: number, level: Level): number {
  // Calculate stars based on completion time
  // 3 stars: Fast (< level difficulty threshold)
  // 2 stars: Medium (< level difficulty * 2)
  // 1 star: Completed
  const difficultyMultiplier = {
    'Lätt': 15,
    'Medel': 20,
    'Svår': 30,
    'Expert': 40,
  }[level.difficulty] || 20;
  
  if (time < difficultyMultiplier * 0.5) return 3;
  if (time < difficultyMultiplier) return 2;
  return 1;
}

export function BalanceGameScreen({ navigation, route }: any) {
  const worldId = route?.params?.worldId;
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [showLevelSelect, setShowLevelSelect] = useState(true);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [completionTime, setCompletionTime] = useState<number>(0);
  const [selectedSkin, setSelectedSkin] = useState<BallSkin>('classic');
  const powerUpCountRef = useRef(0);
  
  const filteredLevels = React.useMemo(() => {
    if (!worldId) return levels;
    const world = WORLDS.find((w) => w.id === worldId);
    if (!world) return levels;
    return levels.filter((level) => world.levelIds.includes(level.id));
  }, [worldId]);

  useEffect(() => {
    loadSkin();
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const hasSeenTutorial = await AsyncStorage.getItem('@balance_game_tutorial_completed');
      if (!hasSeenTutorial) {
        // Auto-show tutorial on first launch
        navigation.navigate('Tutorial');
      }
    } catch (error) {
      console.error('Failed to check tutorial status:', error);
    }
  };

  const loadSkin = async () => {
    const skin = await getSelectedSkin();
    setSelectedSkin(skin);
  };

  const handleLevelSelect = (level: Level) => {
    setSelectedLevel(level);
    setShowLevelSelect(false);
    setGameWon(false);
    setGameLost(false);
    setCompletionTime(0);
  };

  const handleGameWon = async (time: number) => {
    setCompletionTime(time);
    setGameWon(true);
    Vibration.vibrate([0, 100, 50, 100, 50, 100]);
    
    // Calculate stars
    const stars = calculateStars(time, selectedLevel!);
    
    // Record statistics
    await recordLevelComplete(time, stars);
    
    // Achievement tracking
    await incrementAchievement('first_win');
    
    // Check for 3 stars
    if (time < 10) {
      await incrementAchievement('speed_demon');
    }
    
    // TODO: Track consecutive wins for 'survivor'
    // TODO: Track lava completion for 'lava_dancer'
    // TODO: Track boss level for 'boss_killer' and 'legendary'
  };

  const handleGameLost = () => {
    setGameLost(true);
    Vibration.vibrate(500);
  };

  const handleBackToMenu = () => {
    setSelectedLevel(null);
    setShowLevelSelect(true);
    setGameWon(false);
    setGameLost(false);
  };

  const handleRestart = () => {
    setGameWon(false);
    setGameLost(false);
  };

  const renderLevelItem = ({ item }: { item: Level }) => {
    const difficultyColors = {
      Lätt: '#10b981',
      Medel: '#f59e0b',
      Svår: '#ef4444',
      Expert: '#8b5cf6',
    };

    return (
      <TouchableOpacity
        style={styles.levelItem}
        onPress={() => handleLevelSelect(item)}
      >
        <View style={styles.levelHeader}>
          <Text style={styles.levelName}>{item.name}</Text>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: difficultyColors[item.difficulty] },
            ]}
          >
            <Text style={styles.difficultyText}>{item.difficulty}</Text>
          </View>
        </View>
        <Text style={styles.levelDescription}>{item.description}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {showLevelSelect ? (
        <View style={styles.menuContainer}>
          <Text style={styles.title}>⚽ Balansspel</Text>
          <Text style={styles.subtitle}>
            Luta din telefon för att styra kulan från start till mål!
          </Text>
          
          {/* Tutorial & Stats Buttons */}
          <View style={styles.utilityRow}>
            <Pressable
              style={styles.utilityButton}
              onPress={() => navigation.navigate('Tutorial')}
            >
              <Ionicons name="school" size={20} color="#60a5fa" />
              <Text style={styles.utilityText}>Tutorial</Text>
            </Pressable>
            
            <Pressable
              style={styles.utilityButton}
              onPress={() => navigation.navigate('Statistics')}
            >
              <Ionicons name="bar-chart" size={20} color="#60a5fa" />
              <Text style={styles.utilityText}>Statistik</Text>
            </Pressable>
          </View>
          
          {/* Quick Actions Row 1 */}
          <View style={styles.quickActionsRow}>
            <Pressable
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('WorldsMap')}
            >
              <Text style={styles.quickActionIcon}>🗺️</Text>
              <Text style={styles.quickActionText}>Worlds</Text>
            </Pressable>
            
            <Pressable
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('DailyChallenges')}
            >
              <Text style={styles.quickActionIcon}>📅</Text>
              <Text style={styles.quickActionText}>Daily</Text>
            </Pressable>
          </View>
          
          {/* Quick Actions Row 2 */}
          <View style={styles.quickActionsRow}>
            <Pressable
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Achievements')}
            >
              <Text style={styles.quickActionIcon}>🏆</Text>
              <Text style={styles.quickActionText}>Achievements</Text>
            </Pressable>
            
            <Pressable
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Skins')}
            >
              <Text style={styles.quickActionIcon}>🌈</Text>
              <Text style={styles.quickActionText}>Skins</Text>
            </Pressable>
          </View>
          
          <FlatList
            data={filteredLevels}
            renderItem={renderLevelItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.levelList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      ) : selectedLevel ? (
        <>
          <GameCanvas
            level={selectedLevel}
            onWin={handleGameWon}
            onLose={handleGameLost}
            ballSkin={selectedSkin}
            onPowerUpCollected={async (type) => {
              powerUpCountRef.current += 1;
              await incrementAchievement('power_collector');
              if (type === 'ghost') {
                await incrementAchievement('ghost_master');
              }
            }}
          />
          
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToMenu}
            >
              <Text style={styles.backButtonText}>← Tillbaka</Text>
            </TouchableOpacity>
            <Text style={styles.levelNameTop}>{selectedLevel.name}</Text>
          </View>
        </>
      ) : null}

      {/* Win Modal */}
      <Modal
        visible={gameWon}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎉 Fantastiskt!</Text>
            <Text style={styles.modalSubtitle}>
              Du klarade {selectedLevel?.name}
            </Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>⏱ Tid</Text>
                <Text style={styles.statValue}>{completionTime.toFixed(2)}s</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>⭐ Betyg</Text>
                <Text style={styles.statValue}>
                  {completionTime < 10 ? '⭐⭐⭐' : completionTime < 20 ? '⭐⭐' : '⭐'}
                </Text>
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.primaryButton]}
                onPress={handleRestart}
              >
                <Text style={styles.modalButtonText}>🔄 Spela igen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.secondaryButton]}
                onPress={handleBackToMenu}
              >
                <Text style={styles.modalButtonTextSecondary}>← Välj ny bana</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Lose Modal */}
      <Modal
        visible={gameLost}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.loseModal]}>
            <Text style={styles.modalTitle}>💥 Ojdå!</Text>
            <Text style={styles.modalText}>
              Kulan ramlade ut!
            </Text>
            <Text style={styles.modalHint}>
              💡 Tips: Luta telefonen försiktigt och använd små rörelser
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.primaryButton]}
                onPress={handleRestart}
              >
                <Text style={styles.modalButtonText}>🎯 Försök igen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.secondaryButton]}
                onPress={handleBackToMenu}
              >
                <Text style={styles.modalButtonTextSecondary}>← Välj annan bana</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  menuContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(59, 130, 246, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  levelList: {
    paddingBottom: 20,
  },
  levelItem: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  levelName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  difficultyBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  difficultyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  levelDescription: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 22,
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.5)',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  backButtonText: {
    color: '#60a5fa',
    fontSize: 16,
    fontWeight: '700',
  },
  levelNameTop: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: -120,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'rgba(30, 41, 59, 0.98)',
    borderRadius: 24,
    padding: 32,
    width: SCREEN_WIDTH - 50,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.5)',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  loseModal: {
    borderColor: 'rgba(239, 68, 68, 0.5)',
    shadowColor: '#ef4444',
  },
  modalTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(59, 130, 246, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  modalSubtitle: {
    fontSize: 20,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 28,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  statLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 6,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    color: '#60a5fa',
    fontWeight: '700',
  },
  modalText: {
    fontSize: 18,
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 26,
    fontWeight: '500',
  },
  modalHint: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    fontStyle: 'italic',
    paddingHorizontal: 10,
  },
  modalButtons: {
    gap: 14,
  },
  modalButton: {
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  secondaryButton: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalButtonTextSecondary: {
    color: '#94a3b8',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(96, 165, 250, 0.4)',
  },
  quickActionIcon: {
    fontSize: 20,
  },
  quickActionText: {
    color: '#60a5fa',
    fontSize: 14,
    fontWeight: '700',
  },
  utilityRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  utilityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  utilityText: {
    color: '#60a5fa',
    fontSize: 13,
    fontWeight: '600',
  },
});
