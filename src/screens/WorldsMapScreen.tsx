import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  World,
  WORLDS,
  WorldProgress,
  loadWorldProgress,
  getTotalStars,
} from '../lib/balance-game/worlds';
import { levels } from '../lib/balance-game/levels';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function WorldsMapScreen({ navigation }: any) {
  const [worldProgress, setWorldProgress] = useState<WorldProgress[]>([]);
  const [totalStars, setTotalStars] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const progress = await loadWorldProgress();
    const stars = await getTotalStars();
    setWorldProgress(progress);
    setTotalStars(stars);
    setLoading(false);
  };

  const handleWorldPress = (world: typeof WORLDS[0], progress: WorldProgress) => {
    if (!progress.unlocked) return;
    
    // Navigate to level select with world filter
    navigation.navigate('Balansspel', { worldId: world.id });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Laddar världskarta...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#60a5fa" />
          <Text style={styles.backText}>Tillbaka</Text>
        </Pressable>
        <Text style={styles.title}>🗺️ Världskarta</Text>
      </View>

      {/* Total Stars */}
      <View style={styles.starsCard}>
        <Text style={styles.starsTitle}>Totala Stjärnor</Text>
        <Text style={styles.starsValue}>⭐ {totalStars}</Text>
      </View>

      {/* Worlds Map */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {WORLDS.map((world, index) => {
          const progress = worldProgress.find(p => p.worldId === world.id);
          const isUnlocked = progress?.unlocked || false;
          const completedLevels = progress?.completedLevels.length || 0;
          const totalLevels = world.levelIds.length;
          const worldStars = progress?.totalStars || 0;

          return (
            <View key={world.id} style={styles.worldContainer}>
              {/* Connector Line */}
              {index > 0 && (
                <View style={[
                  styles.connector,
                  isUnlocked ? styles.connectorUnlocked : styles.connectorLocked
                ]} />
              )}

              {/* World Card */}
              <Pressable
                style={[
                  styles.worldCard,
                  !isUnlocked && styles.worldCardLocked,
                ]}
                onPress={() => handleWorldPress(world, progress!)}
                disabled={!isUnlocked}
              >
                <LinearGradient
                  colors={isUnlocked ? world.bgGradient as [string, string, ...string[]] : ['#1e293b', '#0f172a']}
                  style={styles.worldGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {/* Lock Overlay */}
                  {!isUnlocked && (
                    <View style={styles.lockOverlay}>
                      <Ionicons name="lock-closed" size={48} color="#475569" />
                      <Text style={styles.lockText}>
                        Kräver {world.requiredStars} ⭐
                      </Text>
                    </View>
                  )}

                  {/* World Content */}
                  <View style={styles.worldContent}>
                    <Text style={styles.worldIcon}>{world.icon}</Text>
                    <Text style={[
                      styles.worldName,
                      !isUnlocked && styles.worldNameLocked
                    ]}>
                      {world.name}
                    </Text>
                    <Text style={[
                      styles.worldDescription,
                      !isUnlocked && styles.worldDescriptionLocked
                    ]}>
                      {world.description}
                    </Text>

                    {isUnlocked && (
                      <>
                        {/* Progress */}
                        <View style={styles.progressContainer}>
                          <Text style={styles.progressText}>
                            {completedLevels} / {totalLevels} banor
                          </Text>
                          <View style={styles.progressBar}>
                            <View style={[
                              styles.progressFill,
                              { width: `${(completedLevels / totalLevels) * 100}%` }
                            ]} />
                          </View>
                        </View>

                        {/* Stars */}
                        <View style={styles.starsRow}>
                          <Text style={styles.worldStars}>⭐ {worldStars}</Text>
                        </View>

                        {/* Levels Preview */}
                        <View style={styles.levelsPreview}>
                          {world.levelIds.slice(0, 3).map(levelId => {
                            const level = levels.find(l => l.id === levelId);
                            const isCompleted = progress?.completedLevels.includes(levelId);
                            return (
                              <View
                                key={levelId}
                                style={[
                                  styles.levelDot,
                                  isCompleted && styles.levelDotCompleted
                                ]}
                              >
                                {isCompleted && (
                                  <Ionicons name="checkmark" size={12} color="#10b981" />
                                )}
                              </View>
                            );
                          })}
                          {world.levelIds.length > 3 && (
                            <Text style={styles.moreLevels}>
                              +{world.levelIds.length - 3}
                            </Text>
                          )}
                        </View>
                      </>
                    )}
                  </View>
                </LinearGradient>
              </Pressable>
            </View>
          );
        })}

        {/* End Message */}
        <View style={styles.endMessage}>
          <Text style={styles.endMessageText}>
            🎊 Lycka till med ditt äventyr! 🎊
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  loadingText: {
    color: '#60a5fa',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(96, 165, 250, 0.2)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
  },
  backText: {
    color: '#60a5fa',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(59, 130, 246, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  starsCard: {
    margin: 15,
    padding: 20,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    alignItems: 'center',
  },
  starsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fbbf24',
    marginBottom: 8,
  },
  starsValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    paddingTop: 30,
  },
  worldContainer: {
    position: 'relative',
    marginBottom: 40,
  },
  connector: {
    position: 'absolute',
    top: -40,
    left: '50%',
    marginLeft: -2,
    width: 4,
    height: 40,
  },
  connectorUnlocked: {
    backgroundColor: '#10b981',
  },
  connectorLocked: {
    backgroundColor: '#475569',
  },
  worldCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(96, 165, 250, 0.5)',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  worldCardLocked: {
    borderColor: 'rgba(71, 85, 105, 0.5)',
    opacity: 0.6,
  },
  worldGradient: {
    padding: 24,
    minHeight: 220,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  lockText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  worldContent: {
    alignItems: 'center',
  },
  worldIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  worldName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  worldNameLocked: {
    color: '#64748b',
  },
  worldDescription: {
    fontSize: 14,
    color: '#f1f5f9',
    textAlign: 'center',
    marginBottom: 16,
  },
  worldDescriptionLocked: {
    color: '#64748b',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 12,
  },
  progressText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  starsRow: {
    marginBottom: 12,
  },
  worldStars: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fbbf24',
  },
  levelsPreview: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  levelDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelDotCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    borderColor: '#10b981',
  },
  moreLevels: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  endMessage: {
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  endMessageText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fbbf24',
    textAlign: 'center',
  },
});
