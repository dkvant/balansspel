import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  DailyChallenge,
  ChallengeProgress,
  StreakData,
  getTodaysChallenge,
  getChallengeProgress,
  getStreakData,
  getModifierDisplayName,
  updateChallengeProgress,
  getStreakReward,
} from '../lib/balance-game/daily-challenges';
import { levels } from '../lib/balance-game/levels';
import { GameCanvas } from '../components/BalanceGame/GameCanvas';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function DailyChallengesScreen({ navigation }: any) {
  const [todaysChallenge, setTodaysChallenge] = useState<DailyChallenge | null>(null);
  const [progress, setProgress] = useState<ChallengeProgress | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [playingChallenge, setPlayingChallenge] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showLoseModal, setShowLoseModal] = useState(false);
  const [completionTime, setCompletionTime] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const challenge = await getTodaysChallenge();
    const prog = await getChallengeProgress(challenge.id);
    const streakData = await getStreakData();
    
    setTodaysChallenge(challenge);
    setProgress(prog);
    setStreak(streakData);
    setLoading(false);
  };

  const handleStartChallenge = () => {
    setPlayingChallenge(true);
    setShowWinModal(false);
    setShowLoseModal(false);
  };

  const handleWin = async (time: number) => {
    if (!todaysChallenge) return;
    
    setCompletionTime(time);
    
    // Check if meets challenge requirements
    let success = true;
    if (todaysChallenge.targetTime && time > todaysChallenge.targetTime) {
      success = false;
    }
    
    if (success) {
      await updateChallengeProgress(todaysChallenge.id, true, time);
      setShowWinModal(true);
      
      // Reload data to update streak
      await loadData();
    } else {
      setShowLoseModal(true);
    }
  };

  const handleLose = async () => {
    if (!todaysChallenge) return;
    
    await updateChallengeProgress(todaysChallenge.id, false);
    setShowLoseModal(true);
    
    // Reload progress
    const prog = await getChallengeProgress(todaysChallenge.id);
    setProgress(prog);
  };

  const handleBackToMenu = () => {
    setPlayingChallenge(false);
    setShowWinModal(false);
    setShowLoseModal(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Laddar dagens utmaning...</Text>
      </SafeAreaView>
    );
  }

  if (!todaysChallenge) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Ingen utmaning tillgänglig</Text>
      </SafeAreaView>
    );
  }

  const level = levels.find(l => l.id === todaysChallenge.levelId);
  if (!level) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Bana hittades inte</Text>
      </SafeAreaView>
    );
  }

  const isCompleted = progress?.completed || false;
  const attemptsLeft = todaysChallenge.maxAttempts 
    ? todaysChallenge.maxAttempts - (progress?.attempts || 0)
    : null;
  const canPlay = !isCompleted && (attemptsLeft === null || attemptsLeft > 0);

  if (playingChallenge) {
    return (
      <View style={styles.container}>
        <GameCanvas
          level={level}
          onWin={handleWin}
          onLose={handleLose}
        />
        
        {/* Back button */}
        <Pressable
          style={styles.gameBackButton}
          onPress={handleBackToMenu}
        >
          <Ionicons name="arrow-back" size={24} color="#60a5fa" />
          <Text style={styles.gameBackText}>Avbryt</Text>
        </Pressable>
        
        {/* Modifiers display */}
        <View style={styles.modifiersOverlay}>
          {todaysChallenge.modifiers.map((mod, idx) => (
            <View key={idx} style={styles.modifierBadge}>
              <Text style={styles.modifierBadgeText}>
                {getModifierDisplayName(mod)}
              </Text>
            </View>
          ))}
        </View>
        
        {/* Win Modal */}
        <Modal
          visible={showWinModal}
          transparent
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>🎉 KLARAD!</Text>
              <Text style={styles.modalText}>
                Dagens utmaning klar på {completionTime.toFixed(2)}s!
              </Text>
              
              {/* Rewards */}
              <View style={styles.rewardsContainer}>
                <Text style={styles.rewardsTitle}>Belöningar:</Text>
                <Text style={styles.rewardText}>💰 {todaysChallenge.reward.coins} coins</Text>
                <Text style={styles.rewardText}>⭐ {todaysChallenge.reward.xp} XP</Text>
              </View>
              
              {/* Streak info */}
              {streak && (
                <View style={styles.streakContainer}>
                  <Text style={styles.streakText}>
                    🔥 {streak.currentStreak} dagars streak!
                  </Text>
                </View>
              )}
              
              <Pressable
                style={[styles.modalButton, styles.primaryButton]}
                onPress={handleBackToMenu}
              >
                <Text style={styles.modalButtonText}>Tillbaka</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
        
        {/* Lose Modal */}
        <Modal
          visible={showLoseModal}
          transparent
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>😢 Misslyckades</Text>
              <Text style={styles.modalText}>
                {todaysChallenge.targetTime && completionTime > todaysChallenge.targetTime
                  ? `För långsam! Målet var ${todaysChallenge.targetTime}s`
                  : 'Försök igen!'}
              </Text>
              
              {attemptsLeft !== null && attemptsLeft > 0 && (
                <Text style={styles.attemptsText}>
                  {attemptsLeft} försök kvar
                </Text>
              )}
              
              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.modalButton, styles.primaryButton]}
                  onPress={() => {
                    setShowLoseModal(false);
                    if (canPlay) {
                      handleStartChallenge();
                    } else {
                      handleBackToMenu();
                    }
                  }}
                >
                  <Text style={styles.modalButtonText}>
                    {canPlay ? 'Försök igen' : 'Tillbaka'}
                  </Text>
                </Pressable>
                
                {canPlay && (
                  <Pressable
                    style={[styles.modalButton, styles.secondaryButton]}
                    onPress={handleBackToMenu}
                  >
                    <Text style={styles.modalButtonTextSecondary}>Avbryt</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  const streakReward = streak ? getStreakReward(streak.currentStreak) : null;

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
        <Text style={styles.title}>📅 Dagens Utmaning</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Streak Card */}
        {streak && (
          <View style={styles.streakCard}>
            <View style={styles.streakHeader}>
              <Text style={styles.streakTitle}>🔥 Din Streak</Text>
              {streakReward && (
                <View style={styles.streakRewardBadge}>
                  <Text style={styles.streakRewardText}>
                    {streakReward.emoji} Nästa: {streakReward.title}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.streakStats}>
              <View style={styles.streakStat}>
                <Text style={styles.streakStatValue}>{streak.currentStreak}</Text>
                <Text style={styles.streakStatLabel}>Nuvarande</Text>
              </View>
              <View style={styles.streakStat}>
                <Text style={styles.streakStatValue}>{streak.longestStreak}</Text>
                <Text style={styles.streakStatLabel}>Längsta</Text>
              </View>
              <View style={styles.streakStat}>
                <Text style={styles.streakStatValue}>{streak.totalChallengesCompleted}</Text>
                <Text style={styles.streakStatLabel}>Totalt</Text>
              </View>
            </View>
          </View>
        )}

        {/* Challenge Card */}
        <View style={[styles.challengeCard, isCompleted && styles.challengeCardCompleted]}>
          <View style={styles.challengeHeader}>
            <Text style={styles.challengeTitle}>Dagens Bana</Text>
            {isCompleted && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                <Text style={styles.completedText}>Klarad!</Text>
              </View>
            )}
          </View>

          <Text style={styles.levelName}>{level.name}</Text>
          <Text style={styles.levelDifficulty}>Svårighet: {level.difficulty}</Text>

          {/* Modifiers */}
          <View style={styles.modifiersSection}>
            <Text style={styles.modifiersTitle}>Modifiers:</Text>
            {todaysChallenge.modifiers.map((mod, idx) => (
              <View key={idx} style={styles.modifierChip}>
                <Text style={styles.modifierChipText}>
                  {getModifierDisplayName(mod)}
                </Text>
              </View>
            ))}
          </View>

          {/* Requirements */}
          {todaysChallenge.targetTime && (
            <View style={styles.requirement}>
              <Ionicons name="time" size={20} color="#fbbf24" />
              <Text style={styles.requirementText}>
                Klara under {todaysChallenge.targetTime}s
              </Text>
            </View>
          )}

          {todaysChallenge.maxAttempts && (
            <View style={styles.requirement}>
              <Ionicons name="heart" size={20} color="#ef4444" />
              <Text style={styles.requirementText}>
                Max {todaysChallenge.maxAttempts} försök
              </Text>
            </View>
          )}

          {/* Rewards */}
          <View style={styles.rewardsSection}>
            <Text style={styles.rewardsTitle}>Belöningar:</Text>
            <View style={styles.rewardsRow}>
              <Text style={styles.rewardChip}>💰 {todaysChallenge.reward.coins}</Text>
              <Text style={styles.rewardChip}>⭐ {todaysChallenge.reward.xp}</Text>
            </View>
          </View>

          {/* Progress */}
          {progress && !isCompleted && (
            <View style={styles.progressSection}>
              <Text style={styles.progressText}>
                Försök: {progress.attempts}
                {todaysChallenge.maxAttempts && ` / ${todaysChallenge.maxAttempts}`}
              </Text>
              {progress.bestTime && (
                <Text style={styles.progressText}>
                  Bästa tid: {progress.bestTime.toFixed(2)}s
                </Text>
              )}
            </View>
          )}

          {/* Play Button */}
          {canPlay ? (
            <Pressable
              style={styles.playButton}
              onPress={handleStartChallenge}
            >
              <Text style={styles.playButtonText}>
                {progress ? 'Försök igen' : 'Starta utmaning'}
              </Text>
            </Pressable>
          ) : isCompleted ? (
            <View style={styles.completedMessage}>
              <Text style={styles.completedMessageText}>
                Bra jobbat! Kom tillbaka imorgon för ny utmaning!
              </Text>
            </View>
          ) : (
            <View style={styles.noAttemptsMessage}>
              <Text style={styles.noAttemptsMessageText}>
                Inga försök kvar. Kom tillbaka imorgon!
              </Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Tips</Text>
          <Text style={styles.infoText}>
            • Nya utmaningar varje dag kl 00:00
          </Text>
          <Text style={styles.infoText}>
            • Klara challenges varje dag för att bygga din streak
          </Text>
          <Text style={styles.infoText}>
            • Högre streak = större belöningar
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    gap: 15,
  },
  streakCard: {
    padding: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  streakTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fbbf24',
  },
  streakRewardBadge: {
    padding: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: 12,
  },
  streakRewardText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '600',
  },
  streakStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  streakStat: {
    alignItems: 'center',
  },
  streakStatValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  streakStatLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  challengeCard: {
    padding: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  challengeCardCompleted: {
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#60a5fa',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '700',
  },
  levelName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  levelDifficulty: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 15,
  },
  modifiersSection: {
    marginBottom: 15,
  },
  modifiersTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fbbf24',
    marginBottom: 8,
  },
  modifierChip: {
    alignSelf: 'flex-start',
    padding: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 12,
    marginBottom: 6,
  },
  modifierChipText: {
    color: '#60a5fa',
    fontSize: 14,
    fontWeight: '600',
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  requirementText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
  },
  rewardsSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(71, 85, 105, 0.5)',
  },
  rewardsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fbbf24',
    marginBottom: 8,
  },
  rewardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rewardChip: {
    padding: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: 12,
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: '700',
  },
  progressSection: {
    marginTop: 15,
    padding: 12,
    backgroundColor: 'rgba(71, 85, 105, 0.2)',
    borderRadius: 12,
  },
  progressText: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 4,
  },
  playButton: {
    marginTop: 15,
    padding: 16,
    backgroundColor: '#3b82f6',
    borderRadius: 14,
    alignItems: 'center',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  completedMessage: {
    marginTop: 15,
    padding: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 14,
    alignItems: 'center',
  },
  completedMessageText: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  noAttemptsMessage: {
    marginTop: 15,
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 14,
    alignItems: 'center',
  },
  noAttemptsMessageText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoCard: {
    padding: 15,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#60a5fa',
    marginBottom: 10,
  },
  infoText: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 6,
  },
  gameBackButton: {
    position: 'absolute',
    top: 50,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(96, 165, 250, 0.5)',
    zIndex: 10,
  },
  gameBackText: {
    color: '#60a5fa',
    fontSize: 16,
    fontWeight: '700',
  },
  modifiersOverlay: {
    position: 'absolute',
    top: 50,
    right: 15,
    gap: 8,
    zIndex: 10,
  },
  modifierBadge: {
    padding: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(251, 191, 36, 0.5)',
  },
  modifierBadgeText: {
    color: '#fbbf24',
    fontSize: 12,
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
    textShadowColor: 'rgba(59, 130, 246, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  modalText: {
    fontSize: 18,
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 20,
  },
  rewardsContainer: {
    padding: 15,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: 16,
    marginBottom: 15,
  },
  rewardText: {
    fontSize: 16,
    color: '#fbbf24',
    fontWeight: '600',
    marginBottom: 6,
  },
  streakContainer: {
    padding: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
    marginBottom: 15,
  },
  streakText: {
    fontSize: 18,
    color: '#fbbf24',
    fontWeight: '700',
    textAlign: 'center',
  },
  attemptsText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalButtons: {
    gap: 12,
  },
  modalButton: {
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
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
  },
  modalButtonTextSecondary: {
    color: '#94a3b8',
    fontSize: 17,
    fontWeight: '700',
  },
});
