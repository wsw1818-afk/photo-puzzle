import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { DIFFICULTY_CONFIG } from '../utils/puzzleUtils';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);

  console.log('[HomeScreen] 렌더링');

  const handleStartGame = () => {
    console.log('[HomeScreen] 게임 시작 버튼 클릭');
    setShowDifficultyModal(true);
  };

  const handleSelectDifficulty = (difficulty) => {
    console.log('[HomeScreen] 난이도 선택:', difficulty);
    setShowDifficultyModal(false);
    navigation.navigate('ImageSelect', { difficulty });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 타이틀 영역 */}
        <View style={styles.titleContainer}>
          <Text style={styles.emoji}>🧩</Text>
          <Text style={styles.title}>Photo Puzzle</Text>
          <Text style={styles.subtitle}>사진으로 퍼즐을 맞춰보세요!</Text>
        </View>

        {/* 메인 버튼 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartGame}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>게임 시작</Text>
          </TouchableOpacity>
        </View>

        {/* 게임 설명 */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>게임 방법</Text>
          <Text style={styles.infoText}>1. 사진을 선택하세요</Text>
          <Text style={styles.infoText}>2. 빈 칸을 터치하세요</Text>
          <Text style={styles.infoText}>3. 아래에서 맞는 조각을 선택하세요</Text>
          <Text style={styles.infoText}>4. 모든 조각을 맞추면 완성!</Text>
        </View>
      </View>

      {/* 난이도 선택 모달 */}
      <Modal
        visible={showDifficultyModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDifficultyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>난이도 선택</Text>

            {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
              <TouchableOpacity
                key={key}
                style={styles.difficultyButton}
                onPress={() => handleSelectDifficulty(key)}
                activeOpacity={0.7}
              >
                <Text style={styles.difficultyLabel}>{config.label}</Text>
                <Text style={styles.difficultyDesc}>
                  오답 {config.wrongChoices}개
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowDifficultyModal(false)}
            >
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 30,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  infoContainer: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
    paddingLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    width: width * 0.85,
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  difficultyButton: {
    backgroundColor: colors.surfaceLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.puzzleBorder,
  },
  difficultyLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  difficultyDesc: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  cancelButton: {
    marginTop: 8,
    padding: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
