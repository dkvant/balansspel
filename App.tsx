import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BalanceGameScreen } from './src/screens/BalanceGameScreen';
import { AchievementsScreen } from './src/screens/AchievementsScreen';
import { SkinsScreen } from './src/screens/SkinsScreen';
import { DailyChallengesScreen } from './src/screens/DailyChallengesScreen';
import { WorldsMapScreen } from './src/screens/WorldsMapScreen';
import { StatisticsScreen } from './src/screens/StatisticsScreen';
import { TutorialScreen } from './src/screens/TutorialScreen';
import type { RootStackParamList } from './src/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Balansspel"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0f172a' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Balansspel" component={BalanceGameScreen} />
          <Stack.Screen name="Achievements" component={AchievementsScreen} />
          <Stack.Screen name="Skins" component={SkinsScreen} />
          <Stack.Screen name="DailyChallenges" component={DailyChallengesScreen} />
          <Stack.Screen name="WorldsMap" component={WorldsMapScreen} />
          <Stack.Screen name="Statistics" component={StatisticsScreen} />
          <Stack.Screen name="Tutorial" component={TutorialScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
