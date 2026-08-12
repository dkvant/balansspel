import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Achievement, loadAchievements } from '../lib/balance-game/achievements';

export function AchievementsScreen({ navigation }: any) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await loadAchievements();
    setAchievements(data);
    setLoading(false);
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercent = (unlockedCount / totalCount) * 100;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Laddar achievements...</Text>
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
        <Text style={styles.title}>🏆 Achievements</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>Din Progress</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {unlockedCount} / {totalCount} upplåsta ({progressPercent.toFixed(0)}%)
        </Text>
      </View>

      {/* Achievements List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {achievements.map((achievement) => (
          <View
            key={achievement.id}
            style={[
              styles.achievementCard,
              achievement.unlocked && styles.achievementUnlocked,
            ]}
          >
            {/* Icon */}
            <Text style={styles.achievementIcon}>{achievement.icon}</Text>

            {/* Info */}
            <View style={styles.achievementInfo}>
              <Text
                style={[
                  styles.achievementName,
                  achievement.unlocked && styles.achievementNameUnlocked,
                ]}
              >
                {achievement.name}
              </Text>
              <Text style={styles.achievementDescription}>
                {achievement.description}
              </Text>

              {/* Progress Bar */}
              {!achievement.unlocked && (
                <View style={styles.miniProgressContainer}>
                  <View style={styles.miniProgressBarBg}>
                    <View
                      style={[
                        styles.miniProgressBar,
                        {
                          width: `${
                            (achievement.progress / achievement.maxProgress) * 100
                          }%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.miniProgressText}>
                    {achievement.progress} / {achievement.maxProgress}
                  </Text>
                </View>
              )}

              {achievement.unlocked && achievement.unlockedAt && (
                <Text style={styles.unlockedDate}>
                  Upplåst: {new Date(achievement.unlockedAt).toLocaleDateString('sv-SE')}
                </Text>
              )}
            </View>

            {/* Checkmark */}
            {achievement.unlocked && (
              <Ionicons name="checkmark-circle" size={32} color="#10b981" />
            )}
          </View>
        ))}
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
  progressCard: {
    margin: 15,
    padding: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fbbf24',
    marginBottom: 10,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 6,
  },
  progressText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    gap: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(71, 85, 105, 0.3)',
    gap: 12,
  },
  achievementUnlocked: {
    borderColor: 'rgba(16, 185, 129, 0.5)',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
  },
  achievementIcon: {
    fontSize: 36,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 4,
  },
  achievementNameUnlocked: {
    color: '#fff',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  miniProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniProgressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  miniProgressBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  miniProgressText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
    minWidth: 50,
  },
  unlockedDate: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
  },
});
