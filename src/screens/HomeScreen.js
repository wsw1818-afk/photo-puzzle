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

const { width, height } = Dimensions.get('window');

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

  // 난이도 아이콘
  const getDifficultyIcon = (key) => {
    switch (key) {
      case 'easy': return '🌱';
      case 'medium': return '🌿';
      case 'hard': return '🌳';
      case 'veryHard': return '🔥';
      default: return '🧩';
    }
  };

  // 난이도별 배경색
  const getDifficultyColors = (key) => {
    switch (key) {
      case 'easy':
        return {
          bg: colors.success + '15',
          border: colors.success + '40',
          badge: colors.success + '20',
          badgeText: colors.success,
        };
      case 'medium':
        return {
          bg: colors.primary + '15',
          border: colors.primary + '40',
          badge: colors.primary + '20',
          badgeText: colors.primary,
        };
      case 'hard':
        return {
          bg: colors.error + '15',
          border: colors.error + '40',
          badge: colors.error + '20',
          badgeText: colors.error,
        };
      case 'veryHard':
        return {
          bg: '#6B21A8' + '15',
          border: '#6B21A8' + '40',
          badge: '#6B21A8' + '20',
          badgeText: '#6B21A8',
        };
      default:
        return {
          bg: colors.surfaceLight,
          border: colors.puzzleBorder,
          badge: colors.primary + '15',
          badgeText: colors.primary,
        };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 장식 원형 */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />

      <View style={styles.content}>
        {/* 타이틀 영역 */}
        <View style={styles.titleContainer}>
          <View style={styles.iconContainer}>
            <Text style={styles.emoji}>🧩</Text>
          </View>
          <Text style={styles.title}>Photo Puzzle</Text>
          <Text style={styles.subtitle}>사진으로 퍼즐을 맞춰보세요!</Text>
        </View>

        {/* 메인 버튼 */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartGame}
          activeOpacity={0.85}
        >
          <View style={styles.startButtonInner}>
            <Text style={styles.startButtonText}>게임 시작</Text>
            <Text style={styles.startButtonArrow}>→</Text>
          </View>
        </TouchableOpacity>

        {/* 게임 설명 카드 */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoIcon}>📖</Text>
            <Text style={styles.infoTitle}>게임 방법</Text>
          </View>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <View style={styles.infoNumber}><Text style={styles.infoNumberText}>1</Text></View>
              <Text style={styles.infoText}>사진을 선택하세요</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoNumber}><Text style={styles.infoNumberText}>2</Text></View>
              <Text style={styles.infoText}>빈 칸을 터치하세요</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoNumber}><Text style={styles.infoNumberText}>3</Text></View>
              <Text style={styles.infoText}>맞는 조각을 선택하세요</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoNumber}><Text style={styles.infoNumberText}>4</Text></View>
              <Text style={styles.infoText}>모든 조각을 맞추면 완성!</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 난이도 선택 모달 */}
      <Modal
        visible={showDifficultyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDifficultyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>난이도 선택</Text>
            <Text style={styles.modalSubtitle}>도전할 난이도를 선택하세요</Text>

            <View style={styles.difficultyGrid}>
              {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => {
                const diffColors = getDifficultyColors(key);
                return (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.difficultyCard,
                      {
                        backgroundColor: diffColors.bg,
                        borderColor: diffColors.border,
                      },
                    ]}
                    onPress={() => handleSelectDifficulty(key)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.difficultyEmoji}>{getDifficultyIcon(key)}</Text>
                    <Text style={styles.difficultyLabel}>{config.label}</Text>
                    <View style={[styles.difficultyBadge, { backgroundColor: diffColors.badge }]}>
                      <Text style={[styles.difficultyBadgeText, { color: diffColors.badgeText }]}>
                        힌트 {config.hintPieces}개
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

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
  decorCircle1: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: colors.primaryLight + '20',
  },
  decorCircle2: {
    position: 'absolute',
    top: 50,
    left: -60,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.accent + '15',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  emoji: {
    fontSize: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: colors.primary,
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 32,
    elevation: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  startButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textLight,
  },
  startButtonArrow: {
    fontSize: 24,
    color: colors.textLight,
    fontWeight: '300',
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  infoIcon: {
    fontSize: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  infoList: {
    gap: 14,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  infoNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  infoText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.puzzleBorder,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  difficultyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  difficultyCard: {
    width: '47%',
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.puzzleBorder,
  },
  difficultyEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  difficultyLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  difficultyBadge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  difficultyBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
