import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import {
  DIFFICULTY_CONFIG,
  generatePuzzlePieces,
  generateChoices,
  isPuzzleComplete,
  formatTime,
  shuffleArray,
} from '../utils/puzzleUtils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const MAX_PUZZLE_WIDTH = screenWidth - 32; // 최대 퍼즐 너비
const MAX_PUZZLE_HEIGHT = screenHeight * 0.55; // 최대 퍼즐 높이 (화면의 55%)
const CHOICE_AREA_HEIGHT = 180; // 선택지 영역 높이
const PREVIEW_TIME = 10; // 미리보기 시간 (초)

export default function PuzzleScreen({ navigation, route }) {
  const { imageUri, imageWidth, imageHeight, difficulty } = route.params;
  const config = DIFFICULTY_CONFIG[difficulty];
  const gridSize = config.gridSize;

  // 이미지 비율에 맞게 퍼즐 크기 계산
  const imageRatio = imageWidth && imageHeight ? imageWidth / imageHeight : 3 / 4;
  let puzzleWidth, puzzleHeight;

  if (imageRatio > MAX_PUZZLE_WIDTH / MAX_PUZZLE_HEIGHT) {
    // 가로가 더 긴 이미지
    puzzleWidth = MAX_PUZZLE_WIDTH;
    puzzleHeight = MAX_PUZZLE_WIDTH / imageRatio;
  } else {
    // 세로가 더 긴 이미지
    puzzleHeight = MAX_PUZZLE_HEIGHT;
    puzzleWidth = MAX_PUZZLE_HEIGHT * imageRatio;
  }

  console.log('[PuzzleScreen] 렌더링 - 난이도:', difficulty, '그리드:', gridSize);
  console.log('[PuzzleScreen] 이미지 크기:', imageWidth, 'x', imageHeight, '비율:', imageRatio.toFixed(2));
  console.log('[PuzzleScreen] 퍼즐 크기:', puzzleWidth.toFixed(0), 'x', puzzleHeight.toFixed(0));

  // 상태
  const [pieces, setPieces] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null); // 선택된 빈 칸
  const [choices, setChoices] = useState([]); // 하단 선택지
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [isPreview, setIsPreview] = useState(true); // 미리보기 상태
  const [previewCountdown, setPreviewCountdown] = useState(PREVIEW_TIME); // 미리보기 카운트다운

  // 각 조각 크기 계산
  const pieceWidth = puzzleWidth / gridSize;
  const pieceHeight = puzzleHeight / gridSize;

  // 퍼즐 초기화
  useEffect(() => {
    console.log('[PuzzleScreen] 퍼즐 초기화 - 그리드:', gridSize);
    const initialPieces = generatePuzzlePieces(gridSize, puzzleWidth, puzzleHeight);
    setPieces(initialPieces);
    console.log('[PuzzleScreen] 퍼즐 조각 생성 완료:', initialPieces.length, '개');
  }, [gridSize, puzzleWidth, puzzleHeight]);

  // 미리보기 카운트다운
  useEffect(() => {
    if (!isPreview) return;

    if (previewCountdown <= 0) {
      console.log('[PuzzleScreen] 미리보기 종료 - 게임 시작!');
      setIsPreview(false);
      return;
    }

    const timer = setTimeout(() => {
      setPreviewCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isPreview, previewCountdown]);

  // 게임 타이머 (미리보기 끝난 후 시작)
  useEffect(() => {
    if (isComplete || isPreview) return;

    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isComplete, isPreview]);

  // 완성 체크
  useEffect(() => {
    if (pieces.length > 0 && !isComplete && !isPreview) {
      const placedCount = pieces.filter((p) => p.isPlaced).length;
      const allPlaced = pieces.every((p) => p.isPlaced);
      console.log('[PuzzleScreen] 완성 체크 - 배치됨:', placedCount, '/', pieces.length);
      if (allPlaced) {
        console.log('[PuzzleScreen] 🎉 퍼즐 완성!');
        setTimeout(() => {
          setIsComplete(true);
        }, 500);
      }
    }
  }, [pieces, isComplete, isPreview]);

  // 빈 칸 선택 핸들러
  const handleSlotPress = useCallback(
    (piece) => {
      if (piece.isPlaced || isComplete || isPreview) return;

      console.log('[PuzzleScreen] 슬롯 선택 - ID:', piece.id, '위치:', piece.row, piece.col);
      setSelectedSlot(piece);

      // 해당 위치에 맞는 정답 조각과 오답 조각들로 선택지 생성
      const unplacedPieces = pieces.filter((p) => !p.isPlaced);
      const newChoices = generateChoices(piece, unplacedPieces, config.wrongChoices);
      console.log('[PuzzleScreen] 선택지 생성:', newChoices.length, '개');
      setChoices(newChoices);
    },
    [pieces, config.wrongChoices, isComplete, isPreview]
  );

  // 선택지에서 조각 선택
  const handleChoiceSelect = useCallback(
    (chosenPiece) => {
      if (!selectedSlot) return;

      setMoveCount((prev) => prev + 1);

      // 정답 체크
      const isCorrect = chosenPiece.id === selectedSlot.id;
      console.log('[PuzzleScreen] 조각 선택 - 선택:', chosenPiece.id, '정답:', selectedSlot.id, isCorrect ? '✅ 정답!' : '❌ 오답');

      if (isCorrect) {
        // 정답! - 조각 배치 (useEffect에서 완성 체크)
        setPieces((prev) =>
          prev.map((p) =>
            p.id === selectedSlot.id ? { ...p, isPlaced: true } : p
          )
        );
      }

      // 선택 초기화
      setSelectedSlot(null);
      setChoices([]);
    },
    [selectedSlot]
  );

  // 게임 재시작
  const handleRestart = () => {
    console.log('[PuzzleScreen] 게임 재시작');
    const initialPieces = generatePuzzlePieces(gridSize, puzzleWidth, puzzleHeight);
    setPieces(initialPieces);
    setSelectedSlot(null);
    setChoices([]);
    setElapsedTime(0);
    setIsComplete(false);
    setMoveCount(0);
    setIsPreview(true);
    setPreviewCountdown(PREVIEW_TIME);
  };

  // 미리보기 스킵
  const handleSkipPreview = () => {
    setIsPreview(false);
    setPreviewCountdown(0);
  };

  // 홈으로
  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 정보 바 */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoHome}>
          <Text style={styles.backText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>시간</Text>
            <Text style={styles.statValue}>{formatTime(elapsedTime)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>이동</Text>
            <Text style={styles.statValue}>{moveCount}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
          <Text style={styles.restartText}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* 안내 메시지 */}
      <View style={styles.instructionBar}>
        <Text style={styles.instructionText}>
          {isComplete
            ? '🎉 퍼즐 완성!'
            : isPreview
            ? `사진을 기억하세요! ${previewCountdown}초`
            : selectedSlot
            ? '아래에서 맞는 조각을 선택하세요'
            : '빈 칸을 터치하세요'}
        </Text>
      </View>

      {/* 퍼즐 보드 */}
      <View style={[styles.puzzleBoard, { width: puzzleWidth, height: puzzleHeight }]}>
        {isPreview || isComplete ? (
          // 미리보기 또는 완료: 전체 이미지 표시
          <Image
            source={{ uri: imageUri }}
            style={styles.previewImage}
            resizeMode="cover"
          />
        ) : (
          // 게임 모드: 퍼즐 조각들 표시
          pieces.map((piece) => (
            <TouchableOpacity
              key={piece.id}
              style={[
                styles.puzzleSlot,
                {
                  width: pieceWidth - 2,
                  height: pieceHeight - 2,
                  left: piece.col * pieceWidth + 1,
                  top: piece.row * pieceHeight + 1,
                },
                selectedSlot?.id === piece.id && styles.selectedSlot,
                piece.isPlaced && styles.placedSlot,
              ]}
              onPress={() => handleSlotPress(piece)}
              disabled={piece.isPlaced}
              activeOpacity={0.7}
            >
              {piece.isPlaced ? (
                <Image
                  source={{ uri: imageUri }}
                  style={[
                    styles.pieceImage,
                    {
                      width: puzzleWidth,
                      height: puzzleHeight,
                      left: -piece.col * pieceWidth,
                      top: -piece.row * pieceHeight,
                    },
                  ]}
                />
              ) : (
                <Text style={styles.slotNumber}>{piece.id + 1}</Text>
              )}
            </TouchableOpacity>
          ))
        )}

        {/* 그리드 라인 표시용 오버레이 (미리보기 + 게임 중) */}
        {!isComplete && (
          <View style={styles.gridOverlay} pointerEvents="none">
            {Array.from({ length: gridSize - 1 }).map((_, i) => (
              <View
                key={`h-${i}`}
                style={[
                  styles.gridLine,
                  isPreview && styles.previewGridLine,
                  {
                    top: (i + 1) * pieceHeight,
                    width: puzzleWidth,
                    height: 2,
                  },
                ]}
              />
            ))}
            {Array.from({ length: gridSize - 1 }).map((_, i) => (
              <View
                key={`v-${i}`}
                style={[
                  styles.gridLine,
                  isPreview && styles.previewGridLine,
                  {
                    left: (i + 1) * pieceWidth,
                    height: puzzleHeight,
                    width: 2,
                  },
                ]}
              />
            ))}
          </View>
        )}
      </View>

      {/* 선택지 영역 */}
      <View style={styles.choiceArea}>
        {isComplete ? (
          // 완료: 결과 및 버튼 표시
          <View style={styles.completionArea}>
            <Text style={styles.completionStats}>
              시간: {formatTime(elapsedTime)} | 이동: {moveCount}회
            </Text>
            <View style={styles.completionButtons}>
              <TouchableOpacity
                style={styles.completionButtonPrimary}
                onPress={handleRestart}
                activeOpacity={0.7}
              >
                <Text style={styles.completionButtonText}>다시하기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.completionButtonSecondary}
                onPress={handleGoHome}
                activeOpacity={0.7}
              >
                <Text style={styles.completionButtonTextSecondary}>홈으로</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : isPreview ? (
          // 미리보기 중: 스킵 버튼
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkipPreview}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>건너뛰기</Text>
          </TouchableOpacity>
        ) : choices.length > 0 ? (
          <View style={styles.choiceContainer}>
            {choices.map((choice, index) => {
              // 선택지 크기를 이미지 비율에 맞게 계산 (최대 80px 높이 기준)
              const choiceHeight = 80;
              const choiceWidth = choiceHeight * imageRatio;
              return (
                <TouchableOpacity
                  key={`choice-${choice.id}-${index}`}
                  style={[styles.choiceItem, { width: choiceWidth, height: choiceHeight }]}
                  onPress={() => handleChoiceSelect(choice)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.choiceImageWrapper, { width: choiceWidth, height: choiceHeight }]}>
                    <Image
                      source={{ uri: imageUri }}
                      style={[
                        styles.choiceImage,
                        {
                          width: puzzleWidth,
                          height: puzzleHeight,
                          left: -choice.col * pieceWidth,
                          top: -choice.row * pieceHeight,
                        },
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <Text style={styles.choicePlaceholder}>
            위에서 빈 칸을 선택하세요
          </Text>
        )}
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  restartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restartText: {
    fontSize: 22,
    color: colors.primary,
  },
  instructionBar: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  puzzleBoard: {
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  puzzleSlot: {
    position: 'absolute',
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  selectedSlot: {
    borderWidth: 3,
    borderColor: colors.puzzleSelected,
    backgroundColor: colors.primaryLight + '30',
  },
  placedSlot: {
    backgroundColor: 'transparent',
  },
  slotNumber: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  pieceImage: {
    position: 'absolute',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: colors.puzzleBorder,
  },
  previewGridLine: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  choiceArea: {
    flex: 1,
    backgroundColor: colors.surface,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  choiceItem: {
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderWidth: 2,
    borderColor: colors.puzzleBorder,
  },
  choiceImageWrapper: {
    width: 80,
    height: 80,
    overflow: 'hidden',
  },
  choiceImage: {
    position: 'absolute',
  },
  choicePlaceholder: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  skipButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  skipButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  // 완료 영역
  completionArea: {
    alignItems: 'center',
    gap: 16,
  },
  completionStats: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  completionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  completionButtonPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 25,
  },
  completionButtonSecondary: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.puzzleBorder,
  },
  completionButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  completionButtonTextSecondary: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});
