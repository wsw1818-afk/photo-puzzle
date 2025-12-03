import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import HomeScreen from './src/screens/HomeScreen';
import ImageSelectScreen from './src/screens/ImageSelectScreen';
import PuzzleScreen from './src/screens/PuzzleScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [params, setParams] = useState({});

  const navigation = {
    navigate: (screen, screenParams = {}) => {
      setCurrentScreen(screen);
      setParams(screenParams);
    },
    goBack: () => {
      if (currentScreen === 'Puzzle') {
        setCurrentScreen('ImageSelect');
      } else if (currentScreen === 'ImageSelect') {
        setCurrentScreen('Home');
      } else {
        setCurrentScreen('Home');
      }
    },
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Home':
        return <HomeScreen navigation={navigation} />;
      case 'ImageSelect':
        return <ImageSelectScreen navigation={navigation} route={{ params }} />;
      case 'Puzzle':
        return <PuzzleScreen navigation={navigation} route={{ params }} />;
      default:
        return <HomeScreen navigation={navigation} />;
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        {renderScreen()}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
