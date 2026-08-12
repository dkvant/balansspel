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
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GameStats {
  totalPlayTime: number; // milliseconds
  levelsCompleted: number;
  totalDeaths: number;
  longestStreak: number;
  totalStars: number;
  powerUpsCollected: number;
  achievementsUnlocked: number;
  dailyChallengesCompleted: number;
  favoritePowerUp: string;
  mostDeadlyObstacle: string;
  fastestCompletion: number;
  totalDistance: number;
}

const STORAGE_KEY = '@balance_game_statistics';

export function StatisticsScreen({ navigation }: any) {
  const [stats, setStats] = useState<GameStats>({
    totalPlayTime: 0,
    levelsCompleted: 0,
    totalDeaths: 0,
    longestStreak: 0,
    totalStars: 0,
    powerUpsCollected: 0,
    achievementsUnlocked: 0,
    dailyChallengesCompleted: 0,
    favoritePowerUp: 'Shield',
    mostDeadlyObstacle: 'Monster',
    fastestCompletion: 0,
    totalDistance: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setStats(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
    setLoading(false);
  };

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatDistance = (pixels: number) => {
    const meters = (pixels / 100).toFixed(1); // Rough conversion
    return `${meters}m`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Laddar statistik...</Text>
      </SafeAreaView>
    );
  }

  const successRate = stats.levelsCompleted > 0
    ? ((stats.levelsCompleted / (stats.levelsCompleted + stats.totalDeaths)) * 100).toFixed(1)
    : '0.0';

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
        <Text style={styles.title}>📊 Statistik</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Overview Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Översikt</Text>
          <View style={styles.overviewGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.levelsCompleted}</Text>
              <Text style={styles.statLabel}>Banor Klarade</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>⭐ {stats.totalStars}</Text>
              <Text style={styles.statLabel}>Totala Stjärnor</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{successRate}%</Text>
              <Text style={styles.statLabel}>Framgångsgrad</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{formatTime(stats.totalPlayTime)}</Text>
              <Text style={styles.statLabel}>Speltid</Text>
            </View>
          </View>
        </View>

        {/* Progress Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Progression</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressRow}>
              <View style={styles.progressItem}>
                <Ionicons name="trophy" size={24} color="#fbbf24" />
                <Text style={styles.progressValue}>{stats.achievementsUnlocked}</Text>
                <Text style={styles.progressLabel}>Achievements</Text>
              </View>
              <View style={styles.progressItem}>
                <Ionicons name="calendar" size={24} color="#3b82f6" />
                <Text style={styles.progressValue}>{stats.dailyChallengesCompleted}</Text>
                <Text style={styles.progressLabel}>Daily Challenges</Text>
              </View>
              <View style={styles.progressItem}>
                <Ionicons name="flame" size={24} color="#ef4444" />
                <Text style={styles.progressValue}>{stats.longestStreak}</Text>
                <Text style={styles.progressLabel}>Längsta Streak</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Gameplay Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎮 Gameplay</Text>
          <View style={styles.gameplayCard}>
            <View style={styles.gameplayRow}>
              <Text style={styles.gameplayLabel}>Dödsfall</Text>
              <Text style={styles.gameplayValue}>💀 {stats.totalDeaths}</Text>
            </View>
            <View style={styles.gameplayRow}>
              <Text style={styles.gameplayLabel}>Power-ups Samlade</Text>
              <Text style={styles.gameplayValue}>⭐ {stats.powerUpsCollected}</Text>
            </View>
            <View style={styles.gameplayRow}>
              <Text style={styles.gameplayLabel}>Total Distans</Text>
              <Text style={styles.gameplayValue}>🏃 {formatDistance(stats.totalDistance)}</Text>
            </View>
            <View style={styles.gameplayRow}>
              <Text style={styles.gameplayLabel}>Snabbaste Tid</Text>
              <Text style={styles.gameplayValue}>
                {stats.fastestCompletion > 0 
                  ? `⚡ ${stats.fastestCompletion.toFixed(2)}s`
                  : '—'}
              </Text>
            </View>
          </View>
        </View>

        {/* Favorites */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💖 Favoriter</Text>
          <View style={styles.favoritesCard}>
            <View style={styles.favoriteItem}>
              <Text style={styles.favoriteIcon}>⭐</Text>
              <View style={styles.favoriteInfo}>
                <Text style={styles.favoriteLabel}>Favorit Power-up</Text>
                <Text style={styles.favoriteValue}>{stats.favoritePowerUp}</Text>
              </View>
            </View>
            <View style={styles.favoriteItem}>
              <Text style={styles.favoriteIcon}>💀</Text>
              <View style={styles.favoriteInfo}>
                <Text style={styles.favoriteLabel}>Farligaste Hinder</Text>
                <Text style={styles.favoriteValue}>{stats.mostDeadlyObstacle}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Achievements Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Achievement Progress</Text>
          <View style={styles.achievementProgressCard}>
            <View style={styles.achievementBar}>
              <View style={[
                styles.achievementFill,
                { width: `${(stats.achievementsUnlocked / 12) * 100}%` }
              ]} />
            </View>
            <Text style={styles.achievementText}>
              {stats.achievementsUnlocked} / 12 upplåsta
            </Text>
          </View>
        </View>

        {/* Fun Facts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎉 Kul Fakta</Text>
          <View style={styles.funFactsCard}>
            <Text style={styles.funFact}>
              🎯 Du har spelat i {formatTime(stats.totalPlayTime)} totalt!
            </Text>
            {stats.totalDeaths > 100 && (
              <Text style={styles.funFact}>
                💀 Över 100 dödsfall - du är ihärdig!
              </Text>
            )}
            {stats.longestStreak >= 7 && (
              <Text style={styles.funFact}>
                🔥 7+ dagars streak - du är dedikerad!
              </Text>
            )}
            {stats.powerUpsCollected > 50 && (
              <Text style={styles.funFact}>
                ⭐ 50+ power-ups - du älskar power-ups!
              </Text>
            )}
          </View>
        </View>

        {/* Reset Button */}
        <View style={styles.resetSection}>
          <Pressable
            style={styles.resetButton}
            onPress={async () => {
              if (confirm('Är du säker på att du vill återställa all statistik?')) {
                await AsyncStorage.removeItem(STORAGE_KEY);
                setStats({
                  totalPlayTime: 0,
                  levelsCompleted: 0,
                  totalDeaths: 0,
                  longestStreak: 0,
                  totalStars: 0,
                  powerUpsCollected: 0,
                  achievementsUnlocked: 0,
                  dailyChallengesCompleted: 0,
                  favoritePowerUp: 'Shield',
                  mostDeadlyObstacle: 'Monster',
                  fastestCompletion: 0,
                  totalDistance: 0,
                });
              }
            }}
          >
            <Ionicons name="trash" size={20} color="#ef4444" />
            <Text style={styles.resetText}>Återställ Statistik</Text>
          </Pressable>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    gap: 20,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fbbf24',
    marginBottom: 12,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (SCREEN_WIDTH - 60) / 2,
    padding: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  progressCard: {
    padding: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressItem: {
    alignItems: 'center',
    gap: 8,
  },
  progressValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressLabel: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
  },
  gameplayCard: {
    padding: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    gap: 12,
  },
  gameplayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gameplayLabel: {
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  gameplayValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
  },
  favoritesCard: {
    padding: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    gap: 16,
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  favoriteIcon: {
    fontSize: 32,
  },
  favoriteInfo: {
    flex: 1,
  },
  favoriteLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  favoriteValue: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
  achievementProgressCard: {
    padding: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  achievementBar: {
    height: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  achievementFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 6,
  },
  achievementText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '700',
    textAlign: 'center',
  },
  funFactsCard: {
    padding: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    gap: 12,
  },
  funFact: {
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: '600',
    lineHeight: 22,
  },
  resetSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  resetText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '700',
  },
});
