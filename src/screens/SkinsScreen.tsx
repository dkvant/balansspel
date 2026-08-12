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
import { Canvas, Circle, RadialGradient, vec } from '@shopify/react-native-skia';
import {
  BallSkin,
  BALL_SKINS,
  getSelectedSkin,
  setSelectedSkin,
  getUnlockedSkins,
} from '../lib/balance-game/skins';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function SkinsScreen({ navigation }: any) {
  const [selectedSkin, setSelectedSkinState] = useState<BallSkin>('classic');
  const [unlockedSkins, setUnlockedSkins] = useState<BallSkin[]>(['classic']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const selected = await getSelectedSkin();
    const unlocked = await getUnlockedSkins();
    setSelectedSkinState(selected);
    setUnlockedSkins(unlocked);
    setLoading(false);
  };

  const handleSelectSkin = async (skin: BallSkin) => {
    if (!unlockedSkins.includes(skin)) return;
    await setSelectedSkin(skin);
    setSelectedSkinState(skin);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Laddar skins...</Text>
      </SafeAreaView>
    );
  }

  const allSkins = Object.values(BALL_SKINS);
  const unlockedCount = unlockedSkins.length;
  const totalCount = allSkins.length;

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
        <Text style={styles.title}>🌈 Ball Skins</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressCard}>
        <Text style={styles.progressText}>
          {unlockedCount} / {totalCount} upplåsta
        </Text>
      </View>

      {/* Skins Grid */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {allSkins.map((skin) => {
          const isUnlocked = unlockedSkins.includes(skin.id);
          const isSelected = selectedSkin === skin.id;

          return (
            <Pressable
              key={skin.id}
              style={[
                styles.skinCard,
                isSelected && styles.skinCardSelected,
                !isUnlocked && styles.skinCardLocked,
              ]}
              onPress={() => handleSelectSkin(skin.id)}
              disabled={!isUnlocked}
            >
              {/* Ball Preview */}
              <View style={styles.ballPreview}>
                <Canvas style={{ width: 80, height: 80 }}>
                  {/* Outer glow */}
                  <Circle cx={40} cy={40} r={48} opacity={0.4}>
                    <RadialGradient
                      c={vec(40, 40)}
                      r={48}
                      colors={[skin.glowColor || '#3b82f6', 'transparent']}
                    />
                  </Circle>
                  {/* Ball */}
                  <Circle cx={40} cy={40} r={30}>
                    <RadialGradient
                      c={vec(30, 30)}
                      r={45}
                      colors={isUnlocked ? skin.colors : ['#475569', '#334155', '#1e293b']}
                    />
                  </Circle>
                  {/* Highlight */}
                  <Circle cx={30} cy={30} r={12} opacity={0.85}>
                    <RadialGradient
                      c={vec(30, 30)}
                      r={12}
                      colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.3)', 'transparent']}
                    />
                  </Circle>
                </Canvas>
              </View>

              {/* Name */}
              <Text
                style={[
                  styles.skinName,
                  !isUnlocked && styles.skinNameLocked,
                ]}
              >
                {skin.name}
              </Text>

              {/* Lock/Selected indicator */}
              {!isUnlocked && (
                <View style={styles.lockBadge}>
                  <Ionicons name="lock-closed" size={16} color="#64748b" />
                  {skin.requiresAchievement && (
                    <Text style={styles.lockText}>Achievement</Text>
                  )}
                </View>
              )}

              {isSelected && isUnlocked && (
                <View style={styles.selectedBadge}>
                  <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Hint */}
      <View style={styles.hintCard}>
        <Text style={styles.hintText}>
          💡 Lås upp nya skins genom att klara achievements!
        </Text>
      </View>
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
    padding: 15,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    alignItems: 'center',
  },
  progressText: {
    color: '#fbbf24',
    fontSize: 16,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  skinCard: {
    width: (SCREEN_WIDTH - 60) / 2,
    padding: 15,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(71, 85, 105, 0.3)',
    alignItems: 'center',
    gap: 10,
  },
  skinCardSelected: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  skinCardLocked: {
    opacity: 0.5,
  },
  ballPreview: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skinName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  skinNameLocked: {
    color: '#64748b',
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 8,
  },
  lockText: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '600',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  hintCard: {
    margin: 15,
    padding: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  hintText: {
    color: '#60a5fa',
    fontSize: 14,
    textAlign: 'center',
  },
});
