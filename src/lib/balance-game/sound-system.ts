import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SoundEffect =
  | 'power_pickup'
  | 'win'
  | 'lose'
  | 'monster_death'
  | 'portal'
  | 'achievement'
  | 'level_complete'
  | 'button_click';

interface SoundSettings {
  sfxEnabled: boolean;
  musicEnabled: boolean;
  sfxVolume: number;
  musicVolume: number;
}

const STORAGE_KEY = '@balance_game_sound_settings';

let soundSettings: SoundSettings = {
  sfxEnabled: true,
  musicEnabled: true,
  sfxVolume: 0.7,
  musicVolume: 0.5,
};

// Sound instances cache
const soundCache: Map<SoundEffect, Audio.Sound> = new Map();
let backgroundMusic: Audio.Sound | null = null;

export async function initializeAudio() {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    
    // Load settings
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      soundSettings = JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to initialize audio:', error);
  }
}

export async function getSoundSettings(): Promise<SoundSettings> {
  return { ...soundSettings };
}

export async function updateSoundSettings(settings: Partial<SoundSettings>): Promise<void> {
  soundSettings = { ...soundSettings, ...settings };
  
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(soundSettings));
    
    // Update volumes
    if (backgroundMusic) {
      await backgroundMusic.setVolumeAsync(soundSettings.musicEnabled ? soundSettings.musicVolume : 0);
    }
  } catch (error) {
    console.error('Failed to update sound settings:', error);
  }
}

export async function playSoundEffect(effect: SoundEffect) {
  if (!soundSettings.sfxEnabled) return;

  try {
    let sound = soundCache.get(effect);

    if (!sound) {
      // Sound files would be loaded from assets
      // For now, we'll use system sounds or skip
      // In real implementation:
      // const { sound: newSound } = await Audio.Sound.createAsync(
      //   require(`../../assets/sounds/${effect}.mp3`)
      // );
      // soundCache.set(effect, newSound);
      // sound = newSound;
      
      // Placeholder: Just log for now
      console.log(`Playing sound effect: ${effect}`);
      return;
    }

    await sound.replayAsync();
    await sound.setVolumeAsync(soundSettings.sfxVolume);
  } catch (error) {
    console.error(`Failed to play sound ${effect}:`, error);
  }
}

export async function playBackgroundMusic(worldId?: string) {
  if (!soundSettings.musicEnabled) return;

  try {
    // Stop current music
    if (backgroundMusic) {
      await backgroundMusic.stopAsync();
      await backgroundMusic.unloadAsync();
      backgroundMusic = null;
    }

    // In real implementation:
    // const musicFile = worldId ? `music_${worldId}` : 'music_menu';
    // const { sound } = await Audio.Sound.createAsync(
    //   require(`../../assets/music/${musicFile}.mp3`),
    //   {
    //     isLooping: true,
    //     volume: soundSettings.musicVolume,
    //   }
    // );
    // backgroundMusic = sound;
    // await sound.playAsync();

    console.log(`Playing background music for world: ${worldId || 'menu'}`);
  } catch (error) {
    console.error('Failed to play background music:', error);
  }
}

export async function stopBackgroundMusic() {
  try {
    if (backgroundMusic) {
      await backgroundMusic.stopAsync();
      await backgroundMusic.unloadAsync();
      backgroundMusic = null;
    }
  } catch (error) {
    console.error('Failed to stop background music:', error);
  }
}

export async function pauseBackgroundMusic() {
  try {
    if (backgroundMusic) {
      await backgroundMusic.pauseAsync();
    }
  } catch (error) {
    console.error('Failed to pause background music:', error);
  }
}

export async function resumeBackgroundMusic() {
  try {
    if (backgroundMusic) {
      await backgroundMusic.playAsync();
    }
  } catch (error) {
    console.error('Failed to resume background music:', error);
  }
}

export async function cleanupAudio() {
  try {
    // Unload all cached sounds
    for (const sound of soundCache.values()) {
      await sound.unloadAsync();
    }
    soundCache.clear();

    // Stop and unload background music
    if (backgroundMusic) {
      await backgroundMusic.stopAsync();
      await backgroundMusic.unloadAsync();
      backgroundMusic = null;
    }
  } catch (error) {
    console.error('Failed to cleanup audio:', error);
  }
}

// Haptic feedback helper
export function playHaptic(type: 'light' | 'medium' | 'heavy' = 'medium') {
  // Would use Haptics from expo-haptics
  // For now, just log
  console.log(`Playing haptic: ${type}`);
}
